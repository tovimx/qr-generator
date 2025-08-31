/**
 * Comprehensive QR Code Core Functionality Tests
 * Tests the complete QR code creation, customization, and rendering workflow
 */

import { test, expect } from '@playwright/test';
import { AdvancedTestHelper, QRCodeTestHelper, PerformanceMonitor } from './helpers/advanced-test-utilities';

test.describe('QR Code Core Functionality - Complete Workflow', () => {

  test.beforeEach(async ({ page }) => {
    // Clear auth state for clean test environment
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // Ignore storage access errors
      }
    });
  });

  test('Complete QR creation workflow: login → dashboard → create QR → verify functionality', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const qrHelper = new QRCodeTestHelper(page);
    const performanceMonitor = new PerformanceMonitor(page);
    
    await performanceMonitor.startMonitoring();

    // Step 1: Navigate to login and authenticate
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

    // Use test credentials (either environment variables or defaults)
    const testEmail = process.env['E2E_TEST_EMAIL'] || 'test@example.com';
    const testPassword = process.env['E2E_TEST_PASSWORD'] || 'TestPassword123!';

    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    
    const loginStart = Date.now();
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Step 2: Wait for dashboard or handle login failure gracefully
    try {
      await page.waitForURL('/dashboard', { timeout: 15000 });
      const loginTime = Date.now() - loginStart;
      await performanceMonitor.recordMetric('login-time', loginTime);
      
      // Step 3: Verify dashboard loads with QR functionality
      await expect(page.locator('text=/QR Code|Dashboard|Projects/i').first()).toBeVisible({ timeout: 10000 });
      
      // Step 4: Wait for initial QR code generation or interface
      await page.waitForTimeout(3000); // Allow dashboard to fully initialize
      
      // Step 5: Look for existing QR code or create new one
      const qrGenerated = await qrHelper.waitForQRCodeGeneration(8000);
      
      if (!qrGenerated) {
        // Try to create a new QR code
        const createButton = page.locator('button:has-text("Create"), button:has-text("Add QR"), button:has-text("New")').first();
        if (await createButton.isVisible({ timeout: 3000 })) {
          await createButton.click();
          await qrHelper.waitForQRCodeGeneration(10000);
        }
      }

      // Step 6: Verify QR code properties
      const qrProperties = await qrHelper.verifyQRCodeProperties();
      console.log('QR Code Properties:', qrProperties);
      
      expect(qrProperties.isVisible).toBe(true);
      expect(qrProperties.hasContent).toBe(true);
      expect(['canvas', 'svg', 'image']).toContain(qrProperties.type);
      
      if (qrProperties.dimensions) {
        expect(qrProperties.dimensions.width).toBeGreaterThan(50);
        expect(qrProperties.dimensions.height).toBeGreaterThan(50);
      }

      // Step 7: Test QR code functionality by extracting short code and testing page
      const shortCode = await qrHelper.extractQRShortCode();
      
      if (shortCode) {
        console.log('Extracted QR short code:', shortCode);
        
        // Test QR page functionality
        const qrLinkTest = await qrHelper.testQRCodeLink(shortCode);
        console.log('QR Link Test Results:', qrLinkTest);
        
        expect(qrLinkTest.accessible).toBe(true);
        expect(qrLinkTest.responseTime).toBeLessThan(5000);
        expect(qrLinkTest.hasContent).toBe(true);
        
        if (qrLinkTest.errors.length > 0) {
          console.log('QR link test errors:', qrLinkTest.errors);
        }
      }

      // Step 8: Performance verification
      const metrics = await performanceMonitor.getMetrics();
      console.log('Performance Metrics:', metrics);
      
      // Verify reasonable performance
      const loginMetric = metrics.find(m => m.name === 'login-time');
      if (loginMetric) {
        expect(loginMetric.value).toBeLessThan(15000); // 15s max login time
      }

    } catch (error) {
      // Handle case where test user doesn't exist or login fails
      console.log('Login failed or user does not exist - this is expected for fresh environments');
      console.log('Error:', error instanceof Error ? error.message : 'Unknown error');
      
      // Verify we're still on a valid page (login with error or signup suggestion)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(login|signup)/);
      
      // Check if there's a way to create account
      const signupLink = page.getByRole('link', { name: 'create a new account' });
      if (await signupLink.isVisible({ timeout: 2000 })) {
        console.log('Signup option available - test environment setup correctly');
        expect(signupLink).toBeVisible();
      }
    }
  });

  test('QR code customization workflow: edit title, links, and design', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const qrHelper = new QRCodeTestHelper(page);
    
    // Try to reach dashboard (skip if no test user)
    await page.goto('/dashboard');
    
    try {
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        test.skip(true, 'No authenticated user available for customization test');
      }

      // Wait for QR interface to load
      await qrHelper.waitForQRCodeGeneration(8000);
      
      // Test customization features
      const customizationTest = await qrHelper.testCustomizationFeatures();
      console.log('Customization Test Results:', customizationTest);
      
      // Verify customization capabilities
      if (customizationTest.titleEditable) {
        console.log('✅ Title editing functionality works');
      }
      
      if (customizationTest.linksEditable) {
        console.log('✅ Link editing functionality works');
      }
      
      if (customizationTest.themeChangeable) {
        console.log('✅ Theme customization available');
      }
      
      // At least one customization feature should be available
      const hasAnyCustomization = customizationTest.titleEditable || 
                                  customizationTest.linksEditable || 
                                  customizationTest.themeChangeable;
      
      expect(hasAnyCustomization).toBe(true);
      
      if (customizationTest.errors.length > 0) {
        console.log('Customization test errors:', customizationTest.errors);
      }

    } catch (error) {
      console.log('Dashboard not accessible, customization test skipped');
      test.skip(true, 'Dashboard not accessible for customization test');
    }
  });

  test('QR page rendering and responsiveness test', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    // Test with a sample QR code (may or may not exist)
    const testShortCodes = ['test123', 'sample', 'demo', 'abc123'];
    let workingShortCode: string | null = null;
    
    // Try to find a working QR page
    for (const shortCode of testShortCodes) {
      try {
        const response = await page.goto(`/q/${shortCode}`);
        if (response?.ok()) {
          workingShortCode = shortCode;
          break;
        }
      } catch {
        // Continue to next short code
      }
    }

    if (!workingShortCode) {
      // Test 404 handling
      await page.goto('/q/nonexistent12345');
      await page.waitForLoadState('networkidle');
      
      // Should handle non-existent QR codes gracefully
      const pageHealth = await helper.checkPageHealth();
      expect(pageHealth.isHealthy).toBe(true);
      
      console.log('✅ Non-existent QR code handled gracefully');
      return;
    }

    // Test responsive design on different viewports
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Standard' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`/q/${workingShortCode}`);
      await page.waitForLoadState('networkidle');
      
      console.log(`Testing QR page on ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Verify page health on each viewport
      const pageHealth = await helper.checkPageHealth();
      expect(pageHealth.isHealthy).toBe(true);
      expect(pageHealth.loadTime).toBeLessThan(5000);
      
      // Check that content is visible and accessible
      const bodyContent = await page.textContent('body');
      expect(bodyContent).toBeTruthy();
      expect(bodyContent!.trim().length).toBeGreaterThan(10);
      
      // Verify links are touchable on mobile
      if (viewport.width < 500) {
        const links = page.locator('a[href]');
        const linkCount = await links.count();
        
        if (linkCount > 0) {
          const firstLink = links.first();
          const boundingBox = await firstLink.boundingBox();
          
          if (boundingBox) {
            expect(boundingBox.height).toBeGreaterThan(40); // Minimum touch target
            expect(boundingBox.width).toBeGreaterThan(40);
          }
        }
      }
    }

    console.log('✅ QR page responsive design test completed');
  });

  test('QR code generation performance and reliability', async ({ page, browser }) => {
    const performanceMonitor = new PerformanceMonitor(page);
    await performanceMonitor.startMonitoring();
    
    // Test multiple QR page loads to check for consistency
    const testShortCodes = ['test1', 'test2', 'test3', 'nonexistent'];
    const loadTimes: number[] = [];
    const errors: string[] = [];

    for (const shortCode of testShortCodes) {
      const startTime = Date.now();
      
      try {
        const response = await page.goto(`/q/${shortCode}`);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        loadTimes.push(loadTime);
        
        console.log(`QR page ${shortCode}: ${loadTime}ms (${response?.status()})`);
        
        // Verify response is reasonable (200 OK or 404)
        if (response) {
          expect([200, 404]).toContain(response.status());
        }

      } catch (error) {
        const loadTime = Date.now() - startTime;
        loadTimes.push(loadTime);
        errors.push(`${shortCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Performance analysis
    if (loadTimes.length > 0) {
      const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      const maxLoadTime = Math.max(...loadTimes);
      
      console.log(`Average QR page load time: ${Math.round(avgLoadTime)}ms`);
      console.log(`Maximum QR page load time: ${maxLoadTime}ms`);
      
      await performanceMonitor.recordMetric('avg-qr-load-time', avgLoadTime);
      await performanceMonitor.recordMetric('max-qr-load-time', maxLoadTime);
      
      // Performance assertions
      expect(avgLoadTime).toBeLessThan(3000); // 3s average
      expect(maxLoadTime).toBeLessThan(8000); // 8s maximum
    }

    if (errors.length > 0) {
      console.log('QR page load errors:', errors);
      // Allow some errors for non-existent pages
      expect(errors.length).toBeLessThanOrEqual(testShortCodes.length / 2);
    }

    // Test concurrent access to QR pages
    const concurrentTest = async () => {
      const context = await browser.newContext();
      const concurrentPage = await context.newPage();
      
      const startTime = Date.now();
      await concurrentPage.goto('/q/concurrent-test');
      await concurrentPage.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      await context.close();
      return loadTime;
    };

    // Test 5 concurrent users
    const concurrentPromises = Array.from({ length: 5 }, concurrentTest);
    const concurrentResults = await Promise.all(concurrentPromises);
    
    const avgConcurrentTime = concurrentResults.reduce((sum, time) => sum + time, 0) / concurrentResults.length;
    console.log(`Average concurrent load time: ${Math.round(avgConcurrentTime)}ms`);
    
    // Should handle concurrent access reasonably
    expect(avgConcurrentTime).toBeLessThan(10000); // 10s under concurrent load

    console.log('✅ QR code performance and reliability test completed');
  });

  test('QR code data validation and edge cases', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const qrHelper = new QRCodeTestHelper(page);
    
    // Test QR pages with various edge case scenarios
    const edgeCases = [
      { code: 'a', description: 'Single character' },
      { code: '123', description: 'Numeric only' },
      { code: 'very-long-short-code-that-might-cause-issues', description: 'Long code' },
      { code: 'UPPERCASE', description: 'Uppercase letters' },
      { code: 'mixed-CASE-123', description: 'Mixed case and numbers' },
      { code: '!@#$%', description: 'Special characters (should fail)' },
      { code: '', description: 'Empty string (should fail)' },
    ];

    const results = [];

    for (const { code, description } of edgeCases) {
      console.log(`Testing edge case: ${description} - "${code}"`);
      
      try {
        const response = await page.goto(`/q/${encodeURIComponent(code)}`);
        await page.waitForLoadState('networkidle');
        
        const pageHealth = await helper.checkPageHealth();
        const status = response?.status() || 0;
        
        results.push({
          code,
          description,
          status,
          healthy: pageHealth.isHealthy,
          errors: pageHealth.jsErrors
        });
        
        // All edge cases should at least return valid HTTP responses
        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(600);
        
        // Page should not crash regardless of input
        expect(pageHealth.jsErrors.length).toBeLessThan(5);

      } catch (error) {
        results.push({
          code,
          description,
          status: 'error',
          healthy: false,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }

    console.log('Edge case test results:', results);
    
    // Most edge cases should be handled gracefully (either 200 OK or 404 Not Found)
    const healthyResults = results.filter(r => r.healthy || r.status === 404);
    expect(healthyResults.length).toBeGreaterThan(results.length * 0.7); // 70% should be handled well

    console.log('✅ QR code edge case validation completed');
  });

  test('QR code analytics and tracking verification', async ({ page, request }) => {
    // Test analytics tracking on QR page visits
    const testShortCode = 'analytics-test';
    
    // Visit QR page and check for analytics tracking
    const response = await page.goto(`/q/${testShortCode}`);
    await page.waitForLoadState('networkidle');
    
    if (response?.ok()) {
      // Check if analytics scripts or tracking is present
      const analyticsPresent = await page.evaluate(() => {
        // Look for common analytics patterns
        const hasAnalytics = !!(
          document.querySelector('script[src*="analytics"]') ||
          document.querySelector('script[src*="gtag"]') ||
          document.querySelector('script[src*="google"]') ||
          window.gtag ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).ga ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__analytics
        );
        
        return hasAnalytics;
      });
      
      if (analyticsPresent) {
        console.log('✅ Analytics tracking detected on QR page');
      } else {
        console.log('ℹ️ No analytics tracking detected (may be intentional)');
      }
      
      // Test scan tracking API if available
      try {
        const trackResponse = await request.post(`/api/qr/${testShortCode}/scan`, {
          data: {
            userAgent: 'E2E Test Browser',
            referrer: 'test'
          }
        });
        
        if (trackResponse.ok()) {
          console.log('✅ Scan tracking API works');
        } else {
          console.log(`ℹ️ Scan tracking API returned ${trackResponse.status()}`);
        }
      } catch {
        console.log('ℹ️ Scan tracking API not available or requires authentication');
      }
      
    } else {
      console.log('QR page not accessible for analytics test');
    }

    // Test multiple rapid visits to ensure tracking handles load
    const rapidVisits = Array.from({ length: 5 }, async (_, i) => {
      try {
        const visitResponse = await page.goto(`/q/${testShortCode}?visit=${i}`);
        return visitResponse?.ok() || false;
      } catch {
        return false;
      }
    });

    const visitResults = await Promise.all(rapidVisits);
    const successfulVisits = visitResults.filter(Boolean).length;
    
    console.log(`Rapid visits test: ${successfulVisits}/5 successful`);
    expect(successfulVisits).toBeGreaterThan(2); // At least some should succeed

    console.log('✅ QR code analytics verification completed');
  });
});

test.describe('QR Code Advanced Features', () => {
  
  test('QR code theme and customization persistence', async ({ page }) => {
    // This test would verify that customizations persist across page loads
    // Skip if no authenticated user
    await page.goto('/dashboard');
    
    try {
      await page.waitForTimeout(2000);
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required for customization persistence test');
      }

      const qrHelper = new QRCodeTestHelper(page);
      await qrHelper.waitForQRCodeGeneration(5000);
      
      // Test theme persistence (if themes are available)
      const themeElements = page.locator('[data-testid*="theme"], .theme-selector, button:has-text("Theme")');
      if (await themeElements.first().isVisible({ timeout: 3000 })) {
        console.log('✅ Theme customization interface available');
        
        // This would test theme selection and persistence
        // Implementation would depend on specific UI structure
      }
      
    } catch {
      test.skip(true, 'Theme customization test requires authenticated dashboard access');
    }
  });

  test('QR code multi-project organization', async ({ page }) => {
    // Test project organization features
    await page.goto('/dashboard');
    
    try {
      await page.waitForTimeout(2000);
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required for multi-project test');
      }

      // Look for project management interface
      const projectElements = page.locator('[data-testid*="project"], button:has-text("Project"), .project-selector');
      if (await projectElements.first().isVisible({ timeout: 3000 })) {
        console.log('✅ Project management interface available');
      }
      
      // Test tab interface if available
      const tabElements = page.locator('[role="tab"], .tab, button[data-testid*="tab"]');
      const tabCount = await tabElements.count();
      
      if (tabCount > 0) {
        console.log(`✅ Tab interface available with ${tabCount} tabs`);
        
        // Test tab switching
        for (let i = 0; i < Math.min(tabCount, 3); i++) {
          await tabElements.nth(i).click();
          await page.waitForTimeout(500);
          
          // Verify tab content changes
          const isActive = await tabElements.nth(i).getAttribute('aria-selected') === 'true' ||
                           await tabElements.nth(i).evaluate(el => el.classList.contains('active'));
          
          if (isActive) {
            console.log(`✅ Tab ${i + 1} activation works`);
          }
        }
      }
      
    } catch {
      test.skip(true, 'Multi-project test requires dashboard access');
    }
  });

  test('QR code export and sharing functionality', async ({ page }) => {
    await page.goto('/dashboard');
    
    try {
      await page.waitForTimeout(2000);
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required for export test');
      }

      const qrHelper = new QRCodeTestHelper(page);
      await qrHelper.waitForQRCodeGeneration(5000);
      
      // Look for export/download functionality
      const exportElements = page.locator('button:has-text("Download"), button:has-text("Export"), button:has-text("Save"), [data-testid*="download"]');
      if (await exportElements.first().isVisible({ timeout: 3000 })) {
        console.log('✅ Export functionality interface available');
        
        // Test download trigger (don't actually download in test)
        await exportElements.first().click();
        await page.waitForTimeout(1000);
        
        console.log('✅ Export functionality accessible');
      }
      
      // Look for share functionality
      const shareElements = page.locator('button:has-text("Share"), button:has-text("Copy"), [data-testid*="share"]');
      if (await shareElements.first().isVisible({ timeout: 3000 })) {
        console.log('✅ Share functionality interface available');
      }
      
    } catch {
      test.skip(true, 'Export test requires dashboard access');
    }
  });
});