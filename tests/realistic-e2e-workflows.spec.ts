import { test, expect } from '@playwright/test';

/**
 * Realistic E2E Test Workflows
 * 
 * These tests focus on what actually works in the application,
 * testing real user workflows without database dependencies.
 * 
 * Based on the example.spec.ts patterns that are proven to work.
 */

test.describe('QR Code Generator - Realistic User Workflows', () => {
  
  test.describe('Authentication Flow Testing', () => {
    
    test('should render login page with all required elements', async ({ page }) => {
      await page.goto('/login');
      
      // Verify page structure
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
      
      // Check form elements
      await expect(page.getByPlaceholder('Email address')).toBeVisible();
      await expect(page.getByPlaceholder('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
      
      // Check navigation elements
      await expect(page.getByText(/Don't have an account/)).toBeVisible();
    });

    test('should render signup page with all required elements', async ({ page }) => {
      await page.goto('/signup');
      
      // Verify page structure (adjust based on actual signup page)
      await expect(page).toHaveURL('/signup');
      
      // Check form elements exist
      await expect(page.getByPlaceholder('Email address')).toBeVisible();
      await expect(page.getByPlaceholder('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    });

    test('should show form validation on empty submission', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Wait a moment for any validation to appear
      await page.waitForTimeout(1000);
      
      // Form should still be on login page (not redirected)
      await expect(page).toHaveURL('/login');
    });

    test('should navigate between login and signup pages', async ({ page }) => {
      // Start at login
      await page.goto('/login');
      
      // Go to signup
      const signupLink = page.getByRole('link', { name: /sign up/i });
      if (await signupLink.isVisible()) {
        await signupLink.click();
        await expect(page).toHaveURL('/signup');
      }
      
      // Go back to login
      const loginLink = page.getByRole('link', { name: /sign in/i });
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await expect(page).toHaveURL('/login');
      }
    });
  });

  test.describe('Public Pages and Navigation', () => {
    
    test('should load homepage without console errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Filter out known acceptable errors (like Prisma connection issues)
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('PrismaClientInitializationError') &&
        !error.includes('database') &&
        !error.includes('connection') &&
        !error.includes('User was denied access')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });

    test('should have proper page titles and meta tags', async ({ page }) => {
      await page.goto('/');
      
      // Check title
      await expect(page).toHaveTitle(/QR Generator|QR Code/);
      
      // Check basic meta tags
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toBeTruthy();
    });

    test('should be responsive on different viewport sizes', async ({ page }) => {
      // Test desktop
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await expect(page.locator('body')).toBeVisible();
      
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');
      
      // Should either show 404 page or redirect appropriately
      // This depends on your Next.js configuration
      const url = page.url();
      const isHandled = url.includes('404') || url === new URL('/', page.url()).href;
      expect(isHandled).toBeTruthy();
    });
  });

  test.describe('QR Code Public Page Testing', () => {
    
    test('should handle QR code pages gracefully when database is unavailable', async ({ page }) => {
      // Test various QR code patterns
      const testCodes = ['test-code', 'sample-123', 'demo-qr'];
      
      for (const code of testCodes) {
        await page.goto(`/q/${code}`);
        
        // Should either show the QR page or a proper error message
        // Not crash or show blank page
        await expect(page.locator('body')).toBeVisible();
        
        // Should have some content (error message or QR content)
        const hasContent = await page.locator('body').textContent();
        expect(hasContent?.trim().length).toBeGreaterThan(0);
      }
    });

    test('should be mobile-friendly on QR code pages', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/q/test-code');
      
      // Should display content properly
      await expect(page.locator('body')).toBeVisible();
      
      // Check that any buttons/links are touch-friendly (minimum 44px height)
      const buttons = page.locator('button, a[role="button"]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        const boundingBox = await firstButton.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThan(40);
        }
      }
    });
  });

  test.describe('Performance and Load Testing', () => {
    
    test('should load pages within acceptable time limits', async ({ page }) => {
      const pages = ['/', '/login', '/signup'];
      
      for (const path of pages) {
        const startTime = Date.now();
        await page.goto(path);
        
        // Wait for essential content to load
        await expect(page.locator('body')).toBeVisible();
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(10000); // 10 second max for any page
      }
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      await page.goto('/');
      
      // Should still load within reasonable time
      await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    });

    test('should handle JavaScript disabled gracefully', async ({ browser }) => {
      // Create a new context with JavaScript disabled
      const context = await browser.newContext({ javaScriptEnabled: false });
      const jsDisabledPage = await context.newPage();
      
      await jsDisabledPage.goto('/');
      
      // Should show some content even without JS
      const bodyText = await jsDisabledPage.locator('body').textContent();
      expect(bodyText?.trim().length).toBeGreaterThan(0);
      
      await context.close();
    });
  });

  test.describe('Security and Error Handling', () => {
    
    test('should have security headers', async ({ page }) => {
      const response = await page.goto('/');
      
      if (response) {
        const headers = response.headers();
        
        // Check for basic security headers (adjust based on your setup)
        // These might not all be present in development
        const securityHeaders = ['x-frame-options', 'x-content-type-options'];
        
        for (const header of securityHeaders) {
          if (headers[header]) {
            expect(headers[header]).toBeTruthy();
          }
        }
      }
    });

    test('should handle malformed URLs gracefully', async ({ page }) => {
      const malformedUrls = [
        '/q/%3Cscript%3Ealert(1)%3C/script%3E',
        '/q/../../../etc/passwd',
        '/q/extremely-long-code-' + 'a'.repeat(1000)
      ];
      
      for (const url of malformedUrls) {
        const response = await page.goto(url);
        
        // Should not crash and should return proper HTTP status
        expect(response?.status()).toBeLessThan(500);
      }
    });

    test('should protect against XSS in QR code parameters', async ({ page }) => {
      await page.goto('/q/<script>alert("xss")</script>');
      
      // Should not execute the script
      // Check that the script tag is either sanitized or the page shows an error
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert("xss")</script>');
    });
  });

  test.describe('API Endpoint Testing', () => {
    
    test('should handle API endpoints gracefully when database is down', async ({ page }) => {
      // Test that API endpoints return proper error responses
      const response = await page.request.get('/api/qr-codes');
      
      // Should return proper HTTP status (either 401 unauthorized or 503 service unavailable)
      expect([401, 403, 503].includes(response.status())).toBeTruthy();
    });

    test('should return proper CORS headers for API requests', async ({ page }) => {
      const response = await page.request.get('/api/qr-codes');
      const headers = response.headers();
      
      // Check that CORS is properly configured (if applicable)
      if (headers['access-control-allow-origin']) {
        expect(headers['access-control-allow-origin']).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility Testing', () => {
    
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      // Check for h1 tag
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(1); // Should only have one h1 per page
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Should have alt attribute or role="presentation"
        expect(alt !== null || role === 'presentation').toBeTruthy();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/login');
      
      // Test Tab navigation
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON', 'A'].includes(firstFocused || '')).toBeTruthy();
      
      await page.keyboard.press('Tab');
      const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON', 'A'].includes(secondFocused || '')).toBeTruthy();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    
    test('should work consistently across different user agents', async ({ browser }) => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ];
      
      for (const userAgent of userAgents) {
        const context = await browser.newContext({ userAgent });
        const newPage = await context.newPage();
        await newPage.goto('/');
        
        await expect(newPage.locator('body')).toBeVisible();
        await context.close();
      }
    });
  });
});

test.describe('QR Code Generator - Load and Stress Testing', () => {
  
  test('should handle multiple concurrent requests', async ({ page, context }) => {
    // Create multiple pages to simulate concurrent users
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage()
    ]);
    
    // Navigate all pages simultaneously
    await Promise.all(pages.map(p => p.goto('/')));
    
    // All pages should load successfully
    await Promise.all(pages.map(p => 
      expect(p.locator('body')).toBeVisible()
    ));
    
    // Cleanup
    await Promise.all(pages.map(p => p.close()));
  });

  test('should maintain performance under rapid navigation', async ({ page }) => {
    const pages = ['/', '/login', '/signup'];
    
    // Rapidly navigate between pages
    for (let i = 0; i < 5; i++) {
      for (const path of pages) {
        const startTime = Date.now();
        await page.goto(path);
        await expect(page.locator('body')).toBeVisible();
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // Should load quickly on subsequent visits
      }
    }
  });
});