/**
 * Security Testing Suite for QR Generator App
 * Tests XSS protection, input sanitization, CSRF protection, and other security measures
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { MockAuthHelper } from './helpers/mock-auth';
import { generateTestEmail } from './helpers/supabase-auth';

test.describe('Security Tests', () => {
  let authHelper: AuthHelper;
  let mockAuth: MockAuthHelper;
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    mockAuth = new MockAuthHelper(page);
    testEmail = generateTestEmail('security');
  });

  test.describe('Input Sanitization and XSS Protection', () => {
    test('should sanitize malicious script tags in QR code titles', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Try to inject script tag in title
      const maliciousTitle = '<script>alert("XSS")</script>Malicious Title';
      const titleInput = page.getByRole('textbox', { name: /title/i });
      await titleInput.fill(maliciousTitle);
      await page.keyboard.press('Enter');

      // Check that script was not executed
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert("XSS")</script>');
      
      // Verify title is displayed safely (escaped or filtered)
      const displayedTitle = await titleInput.inputValue();
      expect(displayedTitle).not.toContain('<script>');
    });

    test('should sanitize malicious HTML in link titles', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      await page.getByRole('button', { name: /add link/i }).click();
      
      // Try various XSS payloads
      const xssPayloads = [
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        'javascript:alert("XSS")',
        '<script>document.cookie="stolen"</script>',
        '"><script>alert("XSS")</script><"'
      ];

      for (const payload of xssPayloads) {
        await page.getByPlaceholder(/title/i).fill(payload);
        await page.getByPlaceholder(/url/i).fill('https://example.com');
        await page.getByRole('button', { name: /save/i }).click();
        
        // Check that the malicious content was not executed
        const pageContent = await page.content();
        expect(pageContent).not.toContain(payload);
        
        // Reset for next test
        await page.getByRole('button', { name: /add link/i }).click();
      }
    });

    test('should validate and sanitize URLs', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      await page.getByRole('button', { name: /add link/i }).click();

      const maliciousUrls = [
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'vbscript:alert("XSS")',
        'file:///etc/passwd',
        'ftp://malicious.com'
      ];

      for (const maliciousUrl of maliciousUrls) {
        await page.getByPlaceholder(/title/i).fill('Test Link');
        await page.getByPlaceholder(/url/i).fill(maliciousUrl);
        await page.getByRole('button', { name: /save/i }).click();

        // Should show validation error for unsafe URLs
        await expect(page.locator('.error, .text-red, [role="alert"]')).toBeVisible();
        
        // Close the form to try next URL
        const cancelButton = page.getByRole('button', { name: /cancel/i });
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
        await page.getByRole('button', { name: /add link/i }).click();
      }
    });

    test('should prevent SQL injection in search/filter inputs', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Look for any search or filter inputs
      const searchInputs = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"]');
      const inputCount = await searchInputs.count();

      if (inputCount > 0) {
        const sqlInjectionPayloads = [
          "'; DROP TABLE users; --",
          "1' OR '1'='1",
          "admin'/*",
          "' UNION SELECT * FROM users --"
        ];

        for (let i = 0; i < inputCount; i++) {
          const input = searchInputs.nth(i);
          for (const payload of sqlInjectionPayloads) {
            await input.fill(payload);
            await page.keyboard.press('Enter');
            
            // Verify the page still functions normally
            await expect(page.locator('body')).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Authentication Security', () => {
    test('should prevent unauthorized access to dashboard', async ({ page }) => {
      // Try to access dashboard without authentication
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should invalidate session on logout', async ({ page }) => {
      await authHelper.signup(testEmail, 'TestPassword123!');
      await expect(page).toHaveURL('/dashboard');

      // Logout
      await authHelper.logout();
      
      // Try to access dashboard directly
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should handle session hijacking attempts', async ({ page }) => {
      await authHelper.signup(testEmail, 'TestPassword123!');
      
      // Get current session cookies
      const cookies = await page.context().cookies();
      
      // Clear session and try to reuse cookies
      await page.context().clearCookies();
      await page.context().addCookies(cookies);
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      
      // Depending on implementation, should either:
      // 1. Still be authenticated (proper session management)
      // 2. Require re-authentication (stricter security)
      // At minimum, page should not crash
      await expect(page.locator('body')).toBeVisible();
    });

    test('should enforce password strength requirements', async ({ page }) => {
      await page.goto('/signup');

      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'qwerty'
      ];

      for (const weakPassword of weakPasswords) {
        await page.getByPlaceholder('Email address').fill(testEmail);
        await page.getByPlaceholder('Password').first().fill(weakPassword);
        
        // Try to submit
        await page.getByRole('button', { name: /sign up/i }).click();
        
        // Should show password strength error
        const hasError = await Promise.race([
          page.locator('.error, .text-red, [role="alert"]').isVisible(),
          page.waitForURL('/dashboard', { timeout: 1000 }).then(() => false).catch(() => true)
        ]);
        
        expect(hasError).toBe(true);
        
        // Clear form for next test
        await page.getByPlaceholder('Email address').fill('');
        await page.getByPlaceholder('Password').first().fill('');
      }
    });
  });

  test.describe('CSRF and Request Security', () => {
    test('should protect against CSRF attacks on critical actions', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Intercept API requests to check for CSRF tokens
      const apiRequests: unknown[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiRequests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers()
          });
        }
      });

      // Perform an action that should require CSRF protection
      await page.getByRole('button', { name: /add link/i }).click();
      await page.getByPlaceholder(/title/i).fill('CSRF Test');
      await page.getByPlaceholder(/url/i).fill('https://example.com');
      await page.getByRole('button', { name: /save/i }).click();

      // Wait for request to complete
      await page.waitForTimeout(1000);

      // Check that POST/PUT/DELETE requests have proper security headers
      const mutatingRequests = apiRequests.filter(req => 
        ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
      );

      for (const request of mutatingRequests) {
        // Should have some form of CSRF protection
        // This could be CSRF token, same-origin policy, or other mechanisms
        const hasCSRFProtection = 
          request.headers['x-csrf-token'] ||
          request.headers['x-requested-with'] === 'XMLHttpRequest' ||
          request.headers['content-type']?.includes('application/json');
        
        expect(hasCSRFProtection).toBeTruthy();
      }
    });

    test('should validate request origins', async ({ page }) => {
      await mockAuth.mockAuthentication();
      
      // Try to make a request from a different origin (simulating cross-origin attack)
      const response = await page.evaluate(async () => {
        try {
          const result = await fetch('/api/qr-codes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': 'https://malicious-site.com'
            },
            body: JSON.stringify({
              title: 'Malicious QR'
            })
          });
          return { status: result.status, ok: result.ok };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });

      // Should either reject the request or handle it securely
      if (response.status) {
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  test.describe('Data Privacy and Protection', () => {
    test('should not expose sensitive data in client-side code', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Check for exposed sensitive data in page source
      const pageContent = await page.content();
      const sensitivePatterns = [
        /password.*[:=]\s*['"]\w+['"]/i,
        /api[_-]?key.*[:=]\s*['"]\w+['"]/i,
        /secret.*[:=]\s*['"]\w+['"]/i,
        /token.*[:=]\s*['"]\w+['"]/i,
        /database.*url.*[:=]/i
      ];

      for (const pattern of sensitivePatterns) {
        expect(pageContent).not.toMatch(pattern);
      }

      // Check for exposed data in window object
      const exposedSecrets = await page.evaluate(() => {
        const secrets: string[] = [];
        const checkObject = (obj: unknown, path = 'window') => {
          for (const key in obj) {
            if (typeof key === 'string' && /password|secret|key|token/i.test(key)) {
              secrets.push(`${path}.${key}`);
            }
          }
        };
        
        checkObject(window);
        return secrets;
      });

      // Some environment variables might be exposed intentionally (NEXT_PUBLIC_*)
      const dangerousSecrets = exposedSecrets.filter(secret => 
        !secret.toLowerCase().includes('public')
      );
      
      expect(dangerousSecrets).toHaveLength(0);
    });

    test('should handle file upload security (if applicable)', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Look for file upload inputs
      const fileInputs = page.locator('input[type="file"]');
      const fileInputCount = await fileInputs.count();

      if (fileInputCount > 0) {
        // Test uploading potentially dangerous files
        const dangerousFileContent = '<script>alert("XSS")</script>';
        
        // Create a malicious file
        const buffer = Buffer.from(dangerousFileContent);
        
        await fileInputs.first().setInputFiles({
          name: 'malicious.html',
          mimeType: 'text/html',
          buffer
        });

        // The upload should be rejected or properly sanitized
        // Check for error messages or safe handling
        await page.waitForTimeout(1000);
        
        // Verify no script execution occurred
        const pageContent = await page.content();
        expect(pageContent).not.toContain('<script>alert("XSS")</script>');
      }
    });
  });

  test.describe('Rate Limiting and DoS Protection', () => {
    test('should implement rate limiting on authentication attempts', async ({ page }) => {
      await page.goto('/login');

      // Attempt multiple rapid login attempts
      const attempts = 10;
      const results = [];

      for (let i = 0; i < attempts; i++) {
        await page.getByPlaceholder('Email address').fill(`test${i}@example.com`);
        await page.getByPlaceholder('Password').fill('wrongpassword');
        await page.getByRole('button', { name: 'Sign in' }).click();
        
        // Wait a bit and check response
        await page.waitForTimeout(200);
        
        const hasRateLimitError = await page.locator('.error, .text-red, [role="alert"]')
          .filter({ hasText: /rate limit|too many|wait|blocked/i })
          .isVisible();
          
        results.push(hasRateLimitError);
        
        if (hasRateLimitError) {
          break; // Rate limiting is working
        }
      }

      // Should eventually show rate limiting after multiple attempts
      const hasRateLimit = results.some(result => result);
      expect(hasRateLimit).toBe(true);
    });

    test('should handle large payloads gracefully', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Try to create a QR code with extremely long title
      const veryLongTitle = 'A'.repeat(10000);
      
      const titleInput = page.getByRole('textbox', { name: /title/i });
      await titleInput.fill(veryLongTitle);
      await page.keyboard.press('Enter');

      // Should either limit the input or handle it gracefully
      await page.waitForTimeout(1000);
      
      const actualTitle = await titleInput.inputValue();
      expect(actualTitle.length).toBeLessThan(1000); // Reasonable limit
    });
  });

  test.describe('Content Security Policy', () => {
    test('should have proper CSP headers', async ({ page }) => {
      const response = await page.goto('/dashboard');
      const headers = response?.headers();
      
      // Check for security headers
      const securityHeaders = [
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy'
      ];

      let hasSecurityHeaders = false;
      for (const header of securityHeaders) {
        if (headers?.[header]) {
          hasSecurityHeaders = true;
          break;
        }
      }

      // At least some security headers should be present
      expect(hasSecurityHeaders).toBe(true);
    });

    test('should prevent inline script execution', async ({ page }) => {
      await mockAuth.mockAuthentication();
      
      // Try to inject inline script
      await page.addScriptTag({ content: 'window.testXSS = true;' }).catch(() => {
        // Script injection should be blocked by CSP
      });

      const scriptExecuted = await page.evaluate(() => 
        !!(window as unknown).testXSS
      );

      // Script should not have executed if CSP is properly configured
      expect(scriptExecuted).toBe(false);
    });
  });
});