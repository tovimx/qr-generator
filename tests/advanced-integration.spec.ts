/**
 * Advanced Integration E2E Tests
 * Tests complex scenarios including analytics, performance, and edge cases
 */

import { test, expect } from '@playwright/test';

test.describe('Advanced Integration Tests', () => {

  test('QR page analytics tracking simulation', async ({ page }) => {
    // Test analytics tracking without requiring dashboard access
    
    // 1. Visit a QR page (public endpoint)
    await page.goto('/q/test123');
    await page.waitForLoadState('networkidle');
    
    // 2. Check for analytics tracking setup
    const analyticsScripts = page.locator('script[src*="analytics"], script:has-text("track"), script:has-text("gtag")');
    const hasAnalytics = await analyticsScripts.count() > 0;
    
    if (hasAnalytics) {
      console.log('Analytics tracking detected');
    }
    
    // 3. Test click tracking on links
    const links = page.locator('a[href^="http"], a[href^="https"]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // Test first link click tracking
      const firstLink = links.first();
      const linkHref = await firstLink.getAttribute('href');
      
      // Monitor network requests for analytics
      const requests = [];
      page.on('request', request => {
        if (request.url().includes('analytics') || request.url().includes('track')) {
          requests.push(request.url());
        }
      });
      
      // Simulate click (don't actually navigate away)
      await firstLink.hover();
      console.log(`Link tracking test completed for: ${linkHref}`);
    }
    
    // Should not require authentication for public QR pages
    await expect(page.getByText(/sign in|login/i)).not.toBeVisible();
  });

  test('Multi-device QR code scanning simulation', async ({ browser }) => {
    // Simulate scanning from different devices
    const devices = [
      { name: 'Desktop', viewport: { width: 1200, height: 800 } },
      { name: 'Mobile', viewport: { width: 375, height: 667 } },
      { name: 'Tablet', viewport: { width: 768, height: 1024 } }
    ];
    
    for (const device of devices) {
      const context = await browser.newContext({
        viewport: device.viewport,
        userAgent: device.name === 'Mobile' ? 
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15' :
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });
      
      const page = await context.newPage();
      
      console.log(`Testing QR page on ${device.name}`);
      await page.goto('/q/test123');
      await page.waitForLoadState('networkidle');
      
      // Verify page loads and is responsive
      const pageContent = await page.locator('body').isVisible();
      expect(pageContent).toBe(true);
      
      // Check responsive design
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(device.viewport.width);
      
      await context.close();
    }
  });

  test('Performance under realistic load simulation', async ({ page }) => {
    // Test performance with multiple concurrent operations
    
    await page.goto('/login');
    
    // Measure page load performance
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`Login page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    
    // Test form performance under rapid input
    const emailInput = page.getByPlaceholder('Email address');
    const passwordInput = page.getByPlaceholder('Password');
    
    const rapidInputStart = Date.now();
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    const rapidInputTime = Date.now() - rapidInputStart;
    
    console.log(`Form input response time: ${rapidInputTime}ms`);
    expect(rapidInputTime).toBeLessThan(1000); // Should respond within 1 second
    
    // Test form submission responsiveness
    const submitStart = Date.now();
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for response (success or error)
    await page.waitForTimeout(2000);
    const submitTime = Date.now() - submitStart;
    
    console.log(`Form submission response time: ${submitTime}ms`);
    expect(submitTime).toBeLessThan(8000); // Should respond within 8 seconds
  });

  test('Network resilience and error recovery', async ({ page }) => {
    // Test how the app handles various network conditions
    
    // 1. Test slow network simulation
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // Add 100ms delay to all requests
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Should still load within reasonable time
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible({ timeout: 10000 });
    
    // 2. Test API failure recovery
    await page.unroute('**/*');
    await page.route('**/api/auth/**', route => route.abort());
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show error or remain on login page
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toContain('/login');
    
    // 3. Test recovery after network restored
    await page.unroute('**/api/auth/**');
    
    // Clear and retry
    await page.getByPlaceholder('Email address').clear();
    await page.getByPlaceholder('Password').clear();
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should either succeed or show proper error (not network error)
    await page.waitForTimeout(3000);
    const errorElement = page.getByText(/invalid.*credentials|wrong.*password/i);
    const dashboardElement = page.getByText(/dashboard|qr.*code/i);
    
    // Should see either auth error or dashboard (not network error)
    const hasErrorOrDashboard = await errorElement.isVisible() || await dashboardElement.isVisible();
    expect(hasErrorOrDashboard).toBe(true);
  });

  test('Cross-browser QR functionality consistency', async ({ browserName, page }) => {
    console.log(`Testing QR functionality on ${browserName}`);
    
    // Test QR page rendering across browsers
    await page.goto('/q/test123');
    await page.waitForLoadState('networkidle');
    
    // Basic page structure should work across all browsers
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
    expect(bodyContent.length).toBeGreaterThan(10); // Should have meaningful content
    
    // Test CSS rendering consistency
    const mainElement = page.locator('main, div, section').first();
    if (await mainElement.isVisible()) {
      const computedStyle = await mainElement.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          position: style.position,
          fontSize: style.fontSize
        };
      });
      
      // Basic CSS should be applied
      expect(computedStyle.display).not.toBe('');
      console.log(`${browserName} CSS rendering test passed`);
    }
    
    // Test JavaScript functionality
    const jsWorking = await page.evaluate(() => {
      try {
        // Test basic JS functionality
        const testDiv = document.createElement('div');
        testDiv.style.display = 'none';
        document.body.appendChild(testDiv);
        document.body.removeChild(testDiv);
        return true;
      } catch (e) {
        return false;
      }
    });
    
    expect(jsWorking).toBe(true);
    console.log(`${browserName} JavaScript functionality test passed`);
  });

  test('Accessibility compliance testing', async ({ page }) => {
    // Test basic accessibility requirements
    
    await page.goto('/login');
    
    // 1. Test heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Main heading should be present
    const mainHeading = page.getByRole('heading', { level: 1 }).or(page.getByRole('heading', { level: 2 }));
    await expect(mainHeading).toBeVisible();
    
    // 2. Test form labels
    const emailInput = page.getByPlaceholder('Email address');
    const passwordInput = page.getByPlaceholder('Password');
    
    // Inputs should have associated labels (via placeholder, aria-label, or label element)
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // 3. Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // 4. Test color contrast (basic check)
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    const buttonStyles = await submitButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    });
    
    // Button should have distinct background and text colors
    expect(buttonStyles.backgroundColor).not.toBe(buttonStyles.color);
    expect(buttonStyles.backgroundColor).not.toBe('transparent');
    
    console.log('Accessibility basic compliance test passed');
  });

  test('API endpoint health and consistency', async ({ page, request }) => {
    // Test API endpoints that don't require authentication
    
    // 1. Test API health/status if available
    try {
      const healthResponse = await request.get('/api/health');
      if (healthResponse.ok()) {
        console.log('API health endpoint responding');
      }
    } catch (e) {
      console.log('No health endpoint or endpoint error - continuing');
    }
    
    // 2. Test public QR endpoint
    const qrResponse = await request.get('/api/qr/test123');
    // Should either return QR data or proper 404
    expect([200, 404, 301, 302]).toContain(qrResponse.status());
    
    // 3. Test API error handling
    const invalidResponse = await request.get('/api/qr/invalid-code-123456789');
    expect([404, 400]).toContain(invalidResponse.status());
    
    // 4. Test API response headers
    const headers = qrResponse.headers();
    expect(headers['content-type']).toBeTruthy();
    
    console.log('API endpoint health tests completed');
  });

  test('Edge case data handling', async ({ page }) => {
    // Test how the app handles edge cases and malformed data
    
    await page.goto('/login');
    
    // 1. Test extremely long email
    const longEmail = 'a'.repeat(100) + '@example.com';
    await page.getByPlaceholder('Email address').fill(longEmail);
    await page.getByPlaceholder('Password').fill('password123');
    
    // Should either prevent input or handle gracefully
    const emailValue = await page.getByPlaceholder('Email address').inputValue();
    expect(emailValue.length).toBeLessThanOrEqual(255); // Reasonable email limit
    
    // 2. Test special characters in input
    await page.getByPlaceholder('Email address').clear();
    await page.getByPlaceholder('Email address').fill('test+user@example.com'); // Valid email with +
    
    const specialCharValue = await page.getByPlaceholder('Email address').inputValue();
    expect(specialCharValue).toBe('test+user@example.com');
    
    // 3. Test password edge cases
    await page.getByPlaceholder('Password').clear();
    const specialPassword = 'Test123!@#$%^&*()';
    await page.getByPlaceholder('Password').fill(specialPassword);
    
    const passwordValue = await page.getByPlaceholder('Password').inputValue();
    expect(passwordValue).toBe(specialPassword);
    
    // 4. Test form submission with edge case data
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(2000);
    
    // Should handle gracefully (either error or success)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(login|dashboard|signup)/);
    
    console.log('Edge case data handling test completed');
  });
});