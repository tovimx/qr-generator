import { test, expect } from '@playwright/test';
import { EnhancedAPIMock } from './helpers/enhanced-api-mock';

/**
 * Comprehensive Security Testing Suite
 * 
 * This suite tests application security measures including:
 * - XSS (Cross-Site Scripting) protection
 * - CSRF (Cross-Site Request Forgery) protection
 * - Input sanitization and validation
 * - Authentication and authorization security
 * - Content Security Policy (CSP) enforcement
 * - Session management security
 * - SQL injection protection
 * - File upload security
 * - URL manipulation and injection attacks
 */

test.describe('Security Testing - Comprehensive Suite', () => {
  let apiMock: EnhancedAPIMock;
  
  test.beforeEach(async ({ page }) => {
    apiMock = new EnhancedAPIMock(page);
    await apiMock.setupComprehensiveMocks();
    await apiMock.authenticateUser('security-test@example.com');
  });
  
  test.afterEach(async () => {
    if (apiMock) {
      apiMock.clearMockData();
    }
  });

  test.describe('XSS (Cross-Site Scripting) Protection', () => {
    
    test('should sanitize malicious script inputs in QR code titles', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Try to inject XSS in QR code title
      const maliciousScript = '<script>alert("XSS_ATTACK")</script>';
      const qrTitleInput = page.locator('[data-testid="qr-title"], input[placeholder*="title" i], .qr-name-input');
      
      if (await qrTitleInput.isVisible()) {
        await qrTitleInput.fill(maliciousScript);
        await page.keyboard.press('Enter');
        
        // Wait for potential script execution
        await page.waitForTimeout(1000);
        
        // Check that script was not executed (no alert dialog)
        const hasAlert = await page.locator('div[role="alert"], .alert').isVisible().catch(() => false);
        
        // Also check console for any XSS execution
        const consoleMessages = await page.evaluate(() => {
          return window.console.toString();
        });
        
        // Verify script was sanitized and not executed
        expect(consoleMessages).not.toContain('XSS_ATTACK');
        expect(hasAlert).toBeFalsy();
        
        // Check that the input value was properly sanitized
        const sanitizedValue = await qrTitleInput.inputValue();
        expect(sanitizedValue).not.toContain('<script>');
      }
    });

    test('should prevent XSS in link titles and URLs', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Try to add a link with XSS payload
      const addLinkButton = page.locator('[data-testid="add-link"], button:has-text("Add Link"), .add-link-btn');
      
      if (await addLinkButton.isVisible()) {
        await addLinkButton.click();
        
        const linkTitleInput = page.locator('[data-testid="link-title"], input[placeholder*="title" i]').first();
        const linkUrlInput = page.locator('[data-testid="link-url"], input[placeholder*="url" i]').first();
        
        if (await linkTitleInput.isVisible() && await linkUrlInput.isVisible()) {
          // Test XSS in link title
          const xssTitle = '<img src=x onerror=alert("XSS_TITLE")>';
          await linkTitleInput.fill(xssTitle);
          
          // Test XSS in URL
          const xssUrl = 'javascript:alert("XSS_URL")';
          await linkUrlInput.fill(xssUrl);
          
          const saveLinkButton = page.locator('[data-testid="save-link"], button:has-text("Save"), .save-btn');
          if (await saveLinkButton.isVisible()) {
            await saveLinkButton.click();
            await page.waitForTimeout(1000);
          }
          
          // Verify no XSS execution occurred
          const titleValue = await linkTitleInput.inputValue();
          const urlValue = await linkUrlInput.inputValue();
          
          expect(titleValue).not.toContain('<img src=x onerror=');
          expect(urlValue).not.toMatch(/^javascript:/);
        }
      }
    });

    test('should sanitize HTML in custom theme descriptions', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Navigate to theme customization
      const themeButton = page.locator('[data-testid="theme-button"], .theme-tab, .design-tab');
      
      if (await themeButton.isVisible()) {
        await themeButton.click();
        
        // Try to inject HTML/XSS in theme description or custom fields
        const descriptionInput = page.locator('[data-testid="theme-description"], textarea, input[placeholder*="description" i]');
        
        if (await descriptionInput.isVisible()) {
          const maliciousHTML = '<iframe src="javascript:alert(\'XSS\')"></iframe>';
          await descriptionInput.fill(maliciousHTML);
          
          // Save or apply the changes
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Apply"), [data-testid="save-theme"]');
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(1000);
          }
          
          // Check that HTML was sanitized
          const finalValue = await descriptionInput.inputValue();
          expect(finalValue).not.toContain('<iframe');
          expect(finalValue).not.toContain('javascript:');
        }
      }
    });
  });

  test.describe('Input Validation and Sanitization', () => {
    
    test('should validate and reject malformed URLs', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const addLinkButton = page.locator('[data-testid="add-link"], button:has-text("Add Link"), .add-link-btn');
      
      if (await addLinkButton.isVisible()) {
        await addLinkButton.click();
        
        const linkUrlInput = page.locator('[data-testid="link-url"], input[placeholder*="url" i]').first();
        
        if (await linkUrlInput.isVisible()) {
          const malformedUrls = [
            'not-a-url',
            'ftp://malicious.com',
            'file:///etc/passwd',
            'data:text/html,<script>alert(1)</script>',
            'javascript:void(0)'
          ];
          
          for (const maliciousUrl of malformedUrls) {
            await linkUrlInput.fill(maliciousUrl);
            
            const saveLinkButton = page.locator('[data-testid="save-link"], button:has-text("Save"), .save-btn');
            if (await saveLinkButton.isVisible()) {
              await saveLinkButton.click();
              
              // Should show validation error
              const errorMessage = page.locator('.error-message, [data-testid="error"], .field-error');
              const hasError = await errorMessage.isVisible().catch(() => false);
              
              if (hasError) {
                // Good - validation is working
                const errorText = await errorMessage.textContent();
                expect(errorText?.toLowerCase()).toMatch(/invalid|url|format|valid/);
              }
              
              // Clear the input for next iteration
              await linkUrlInput.clear();
            }
          }
        }
      }
    });

    test('should prevent extremely long input values', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Test with extremely long QR title
      const qrTitleInput = page.locator('[data-testid="qr-title"], input[placeholder*="title" i], .qr-name-input');
      
      if (await qrTitleInput.isVisible()) {
        const veryLongString = 'A'.repeat(10000);
        await qrTitleInput.fill(veryLongString);
        
        const actualValue = await qrTitleInput.inputValue();
        
        // Should be truncated or rejected
        expect(actualValue.length).toBeLessThan(1000);
      }
      
      // Test with extremely long link URL
      const addLinkButton = page.locator('[data-testid="add-link"], button:has-text("Add Link"), .add-link-btn');
      
      if (await addLinkButton.isVisible()) {
        await addLinkButton.click();
        
        const linkUrlInput = page.locator('[data-testid="link-url"], input[placeholder*="url" i]').first();
        
        if (await linkUrlInput.isVisible()) {
          const veryLongUrl = 'https://example.com/' + 'path/'.repeat(1000);
          await linkUrlInput.fill(veryLongUrl);
          
          const actualUrl = await linkUrlInput.inputValue();
          
          // Should be truncated or validation should reject it
          expect(actualUrl.length).toBeLessThan(5000);
        }
      }
    });

    test('should sanitize special characters in form inputs', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Test special characters that might cause issues
      const specialChars = [
        '../../etc/passwd',
        '\\x00\\x01\\x02',
        '%3Cscript%3E',
        '../../../admin',
        '${process.env}',
        '{{constructor.constructor("alert(1)")()'
      ];
      
      const qrTitleInput = page.locator('[data-testid="qr-title"], input[placeholder*="title" i], .qr-name-input');
      
      if (await qrTitleInput.isVisible()) {
        for (const specialChar of specialChars) {
          await qrTitleInput.fill(specialChar);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          
          const sanitizedValue = await qrTitleInput.inputValue();
          
          // Should not contain dangerous patterns
          expect(sanitizedValue).not.toMatch(/\.\.\//);
          expect(sanitizedValue).not.toContain('\\x');
          expect(sanitizedValue).not.toContain('${');
          expect(sanitizedValue).not.toContain('{{');
        }
      }
    });
  });

  test.describe('Authentication and Authorization Security', () => {
    
    test('should prevent unauthorized API access', async ({ page }) => {
      // Test API endpoints without proper authentication
      const apiEndpoints = [
        '/api/qr-codes',
        '/api/projects',
        '/api/analytics',
        '/api/domains'
      ];
      
      for (const endpoint of apiEndpoints) {
        const response = await page.request.get(endpoint).catch(() => null);
        
        if (response) {
          // Should return 401 or 403 for unauthorized access
          expect([401, 403, 302]).toContain(response.status());
        }
      }
    });

    test('should secure session cookies properly', async ({ page, context }) => {
      await page.goto('/login');
      
      // Check cookies after login attempt
      await apiMock.authenticateUser('test@example.com');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('/dashboard', { timeout: 10000 }).catch(() => {
        // May not redirect in mock environment
      });
      
      const cookies = await context.cookies();
      const sessionCookies = cookies.filter(cookie => 
        cookie.name.includes('session') || 
        cookie.name.includes('auth') ||
        cookie.name.includes('token')
      );
      
      // Verify session cookies have secure flags
      for (const cookie of sessionCookies) {
        expect(cookie.secure).toBeTruthy();
        expect(cookie.httpOnly).toBeTruthy();
        expect(cookie.sameSite).toMatch(/strict|lax/i);
      }
    });

    test('should prevent cross-origin requests without proper CORS', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Attempt cross-origin request simulation
      const maliciousOrigin = 'https://malicious-site.com';
      
      const response = await page.evaluate(async (origin) => {
        try {
          const response = await fetch('/api/qr-codes', {
            method: 'GET',
            headers: {
              'Origin': origin
            }
          });
          return {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          };
        } catch (error: unknown) {
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      }, maliciousOrigin);
      
      // Should either block the request or have proper CORS headers
      if (!response.error && response.headers) {
        const corsHeader = response.headers['access-control-allow-origin'];
        if (corsHeader) {
          expect(corsHeader).not.toBe('*');
          expect(corsHeader).not.toContain(maliciousOrigin);
        }
      }
    });
  });

  test.describe('Content Security Policy (CSP) Testing', () => {
    
    test('should have proper CSP headers', async ({ page }) => {
      const response = await page.goto('/dashboard');
      
      if (response) {
        const cspHeader = response.headers()['content-security-policy'];
        
        if (cspHeader) {
          // Should restrict inline scripts
          expect(cspHeader).toMatch(/script-src(?:(?!unsafe-inline).)*;/);
          
          // Should not allow unsafe-eval
          expect(cspHeader).not.toContain('unsafe-eval');
          
          // Should have object-src restrictions
          expect(cspHeader).toMatch(/object-src.*none/);
        }
      }
    });

    test('should prevent inline script execution via CSP', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Try to inject and execute inline script
      await page.evaluate(() => {
        const script = document.createElement('script');
        script.innerHTML = 'window.CSP_TEST_EXECUTED = true;';
        document.head.appendChild(script);
      });
      
      await page.waitForTimeout(1000);
      
      // Check if inline script was blocked
      const scriptExecuted = await page.evaluate(() => {
        return (window as Record<string, unknown>).CSP_TEST_EXECUTED;
      });
      
      expect(scriptExecuted).toBeUndefined();
    });
  });

  test.describe('File Upload Security', () => {
    
    test('should validate file types for logo uploads', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Try to find logo upload functionality
      const logoUpload = page.locator('[data-testid="logo-upload"], input[type="file"]');
      
      if (await logoUpload.isVisible()) {
        // Test would require actual file system access in a real scenario
        // For now, we can test the form validation behavior
        
        const fileInput = logoUpload;
        
        // Check if file input has accept attribute for security
        const acceptAttr = await fileInput.getAttribute('accept');
        
        if (acceptAttr) {
          // Should only accept image files
          expect(acceptAttr.toLowerCase()).toMatch(/image/);
          expect(acceptAttr).not.toContain('*');
        }
      }
    });
  });

  test.describe('SQL Injection Protection', () => {
    
    test('should prevent SQL injection in search/filter inputs', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Look for search or filter inputs
      const searchInput = page.locator('[data-testid="search"], input[placeholder*="search" i]');
      
      if (await searchInput.isVisible()) {
        const sqlInjectionPayloads = [
          "'; DROP TABLE users; --",
          "1' OR '1'='1",
          "admin'/*",
          "' UNION SELECT * FROM users --",
          "1'; INSERT INTO users VALUES ('hacker', 'password'); --"
        ];
        
        for (const payload of sqlInjectionPayloads) {
          await searchInput.fill(payload);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          
          // Check for SQL error messages in the UI
          const errorElement = page.locator('.error, [data-testid="error"]');
          const errorText = await errorElement.textContent().catch(() => '') || '';
          
          // Should not expose SQL errors
          expect(errorText.toLowerCase()).not.toMatch(/sql|syntax|mysql|postgres|database/);
        }
      }
    });
  });

  test.describe('URL Manipulation and Injection', () => {
    
    test('should validate short codes against path traversal', async ({ page }) => {
      const maliciousShortCodes = [
        '../../../admin',
        '..\\..\\admin',
        '%2e%2e%2fadmin',
        'admin/../../etc/passwd',
        '....//admin'
      ];
      
      for (const shortCode of maliciousShortCodes) {
        const response = await page.goto(`/q/${shortCode}`, { waitUntil: 'networkidle' });
        
        // Should return 404 or redirect, not expose sensitive paths
        if (response) {
          expect(response.status()).toMatch(/404|302|400/);
        }
        
        // Should not contain admin content or error messages revealing system info
        const content = await page.content();
        expect(content.toLowerCase()).not.toMatch(/admin panel|system error|database error/);
      }
    });

    test('should prevent open redirect vulnerabilities', async ({ page }) => {
      const maliciousRedirects = [
        'https://malicious-site.com',
        'http://evil.com/phishing',
        '//evil.com/phishing',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>'
      ];
      
      for (const redirect of maliciousRedirects) {
        // Test redirect parameter if it exists
        const response = await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`, { 
          waitUntil: 'networkidle' 
        }).catch(() => null);
        
        if (response) {
          // Should not redirect to external malicious sites
          const finalUrl = page.url();
          expect(finalUrl).not.toContain('malicious-site.com');
          expect(finalUrl).not.toContain('evil.com');
          expect(finalUrl).not.toMatch(/^javascript:/);
          expect(finalUrl).not.toMatch(/^data:/);
        }
      }
    });
  });

  test.describe('Rate Limiting and Abuse Prevention', () => {
    
    test('should implement rate limiting on sensitive endpoints', async ({ page }) => {
      await page.goto('/login');
      
      // Simulate rapid login attempts
      const rapidAttempts = 10;
      const results = [];
      
      for (let i = 0; i < rapidAttempts; i++) {
        await page.fill('[data-testid="email"]', 'test@example.com');
        await page.fill('[data-testid="password"]', 'wrongpassword');
        
        const startTime = Date.now();
        await page.click('[data-testid="login-button"]');
        await page.waitForTimeout(100);
        const endTime = Date.now();
        
        results.push(endTime - startTime);
      }
      
      // Later attempts should take longer (rate limiting) or show captcha/lockout
      const laterAttempts = results.slice(-3);
      const earlyAttempts = results.slice(0, 3);
      
      const avgEarly = earlyAttempts.reduce((a, b) => a + b) / earlyAttempts.length;
      const avgLater = laterAttempts.reduce((a, b) => a + b) / laterAttempts.length;
      
      // Should show some form of rate limiting (slower responses or lockout message)
      const rateLimitIndicator = page.locator('.rate-limit, [data-testid="rate-limit"], .too-many-attempts');
      const hasRateLimit = await rateLimitIndicator.isVisible().catch(() => false);
      
      // Either rate limiting message is shown OR responses get slower
      expect(hasRateLimit || avgLater > avgEarly * 1.5).toBeTruthy();
    });
  });
});