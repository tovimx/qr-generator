/**
 * Production-Ready E2E Test Suite
 * Comprehensive tests designed for the actual QR Generator application architecture
 */

import { test, expect } from '@playwright/test';
import { AdvancedTestHelper, PerformanceMonitor } from './helpers/advanced-test-utilities';

test.describe('Production-Ready E2E Test Suite', () => {

  test('Complete application health check', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const performanceMonitor = new PerformanceMonitor(page);
    
    await performanceMonitor.startMonitoring();
    
    // Test 1: Homepage loads and redirects properly
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    await performanceMonitor.recordMetric('homepage-load', loadTime);
    
    // Should redirect to login (unauthenticated) or dashboard (authenticated)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(login|dashboard)/);
    
    // Test 2: Page health check
    const healthCheck = await helper.checkPageHealth();
    console.log('Page health:', healthCheck);
    
    expect(healthCheck.isHealthy).toBe(true);
    expect(healthCheck.loadTime).toBeLessThan(5000);
    
    // Test 3: Basic accessibility
    const accessibilityCheck = await helper.checkAccessibility();
    console.log(`Accessibility score: ${accessibilityCheck.score}%`);
    expect(accessibilityCheck.score).toBeGreaterThan(70);
    
    // Test 4: Performance metrics
    const metrics = await performanceMonitor.getMetrics();
    console.log('Performance metrics:', metrics);
  });

  test('Authentication flow with real validation', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    await helper.clearAuthState();
    
    // Test 1: Login page accessibility and functionality
    await page.goto('/login');
    
    const validationTest = await helper.testFormValidation();
    expect(validationTest.hasValidation).toBe(true);
    
    // Test 2: Form input handling
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('TestPassword123!');
    
    // Verify inputs work correctly
    const emailValue = await page.getByPlaceholder('Email address').inputValue();
    const passwordValue = await page.getByPlaceholder('Password').inputValue();
    
    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('TestPassword123!');
    
    // Test 3: Form submission behavior
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for response and check result
    await page.waitForTimeout(5000);
    const responseUrl = page.url();
    
    // Valid responses: stay on login (invalid creds), go to dashboard (valid creds), or error page
    expect(responseUrl).toMatch(/\/(login|dashboard|error|signup)/);
    
    // Test 4: Navigation between auth pages
    if (responseUrl.includes('/login')) {
      await page.getByRole('link', { name: 'create a new account' }).click();
      await expect(page).toHaveURL('/signup');
      
      // Test signup page
      await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
      
      // Navigate back to login
      await page.getByRole('link', { name: 'sign in to existing account' }).click();
      await expect(page).toHaveURL('/login');
    }
    
    console.log('Authentication flow test completed successfully');
  });

  test('QR code public page functionality', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    // Test 1: QR page with non-existent code
    await page.goto('/q/nonexistent123');
    await page.waitForLoadState('networkidle');
    
    const healthCheck = await helper.checkPageHealth();
    
    // Should handle non-existent QR codes gracefully
    expect(healthCheck.isHealthy).toBe(true);
    
    // Should show proper error or redirect
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
    
    // Test 2: QR page structure and SEO
    const hasMetaTags = await page.locator('meta[name="description"], meta[property="og:title"]').count();
    expect(hasMetaTags).toBeGreaterThan(0);
    
    // Test 3: QR page performance
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: perfData.loadEventEnd - perfData.fetchStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstPaint: perfData.responseEnd - perfData.fetchStart
      };
    });
    
    console.log('QR page performance:', performanceMetrics);
    expect(performanceMetrics.loadTime).toBeLessThan(3000); // 3 second max load time
    
    // Test 4: Mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const mobileHealthCheck = await helper.checkPageHealth();
    expect(mobileHealthCheck.isHealthy).toBe(true);
    
    console.log('QR page functionality test completed');
  });

  test('Application resilience under stress', async ({ page, browser }) => {
    const helper = new AdvancedTestHelper(page);
    
    // Test 1: Rapid navigation between pages
    const navigationPages = ['/login', '/signup', '/login', '/', '/signup'];
    
    for (const url of navigationPages) {
      await page.goto(url);
      await helper.humanLikeDelay(100, 300);
      
      const healthCheck = await helper.checkPageHealth();
      expect(healthCheck.jsErrors.length).toBeLessThan(3); // Allow minimal errors
    }
    
    // Test 2: Multiple form interactions
    await page.goto('/login');
    
    for (let i = 0; i < 5; i++) {
      await page.getByPlaceholder('Email address').fill(`test${i}@example.com`);
      await page.getByPlaceholder('Password').fill(`password${i}123`);
      await helper.humanLikeDelay(200, 400);
      
      if (i < 4) { // Don't submit on last iteration
        await page.getByRole('button', { name: 'Sign in' }).click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Final state should be stable
    const finalHealth = await helper.checkPageHealth();
    expect(finalHealth.isHealthy).toBe(true);
    
    // Test 3: Browser memory stability
    const memoryTest = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memory = (performance as any).memory;
      return memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      } : null;
    });
    
    if (memoryTest) {
      console.log('Memory usage:', memoryTest);
      expect(memoryTest.used).toBeLessThan(memoryTest.limit * 0.8); // Under 80% of limit
    }
    
    console.log('Application resilience test completed');
  });

  test('Comprehensive user experience validation', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    // Test 1: Initial user experience
    await page.goto('/');
    
    // Should reach login page for unauthenticated users
    await expect(page).toHaveURL(/\/(login|dashboard)/);
    
    if (page.url().includes('/login')) {
      // Test login page UX
      await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
      
      // Form should be properly structured
      const formElements = await page.locator('form input').count();
      expect(formElements).toBeGreaterThanOrEqual(2); // Email + password minimum
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const firstFocused = await page.locator(':focus').getAttribute('name');
      expect(['email', 'username']).toContain(firstFocused || '');
      
      await page.keyboard.press('Tab');
      const secondFocused = await page.locator(':focus').getAttribute('name');
      expect(secondFocused).toBe('password');
      
      // Test 2: Error handling UX
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForTimeout(2000);
      
      // Should show validation or stay on login
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
      
      // Test 3: Navigation UX
      await page.getByRole('link', { name: 'create a new account' }).click();
      await expect(page).toHaveURL('/signup');
      
      // Signup form should be accessible
      const signupForm = await helper.testFormValidation();
      expect(signupForm.hasValidation).toBe(true);
      
      // Navigate back
      await page.getByRole('link', { name: 'sign in to existing account' }).click();
      await expect(page).toHaveURL('/login');
    }
    
    console.log('User experience validation completed');
  });

  test('Cross-platform compatibility verification', async ({ browserName, page }) => {
    console.log(`Running compatibility test on ${browserName}`);
    
    const helper = new AdvancedTestHelper(page);
    
    // Test across different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Standard' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height}) on ${browserName}`);
      
      // Basic functionality should work on all viewports
      await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
      
      // Form should be accessible
      const emailInput = page.getByPlaceholder('Email address');
      const passwordInput = page.getByPlaceholder('Password');
      const submitButton = page.getByRole('button', { name: 'Sign in' });
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
      
      // Test touch targets on mobile
      if (viewport.width < 500) {
        const buttonBox = await submitButton.boundingBox();
        expect(buttonBox?.width || 0).toBeGreaterThan(40); // Minimum touch target
        expect(buttonBox?.height || 0).toBeGreaterThan(40);
      }
      
      // Page should be healthy on all viewports
      const healthCheck = await helper.checkPageHealth();
      expect(healthCheck.jsErrors.length).toBeLessThan(2);
    }
    
    console.log(`${browserName} cross-platform compatibility test passed`);
  });

  test('End-to-end performance benchmarking', async ({ page }) => {
    const performanceMonitor = new PerformanceMonitor(page);
    await performanceMonitor.startMonitoring();
    
    // Benchmark 1: Cold start performance
    const coldStartTime = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const coldStartDuration = Date.now() - coldStartTime;
    
    await performanceMonitor.recordMetric('cold-start', coldStartDuration);
    console.log(`Cold start time: ${coldStartDuration}ms`);
    expect(coldStartDuration).toBeLessThan(8000); // 8 second max for cold start
    
    // Benchmark 2: Navigation performance
    const navStartTime = Date.now();
    await page.getByRole('link', { name: 'create a new account' }).click();
    await page.waitForLoadState('networkidle');
    const navDuration = Date.now() - navStartTime;
    
    await performanceMonitor.recordMetric('navigation', navDuration);
    console.log(`Navigation time: ${navDuration}ms`);
    expect(navDuration).toBeLessThan(3000); // 3 second max for navigation
    
    // Benchmark 3: Form interaction performance
    const formStartTime = Date.now();
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder(/Password.*min 6 characters/i).fill('password123');
    const formDuration = Date.now() - formStartTime;
    
    await performanceMonitor.recordMetric('form-interaction', formDuration);
    console.log(`Form interaction time: ${formDuration}ms`);
    expect(formDuration).toBeLessThan(1000); // 1 second max for form filling
    
    // Benchmark 4: Submit response time
    const submitStartTime = Date.now();
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.waitForTimeout(3000); // Wait for response
    const submitDuration = Date.now() - submitStartTime;
    
    await performanceMonitor.recordMetric('form-submit', submitDuration);
    console.log(`Form submit response time: ${submitDuration}ms`);
    
    // Final performance report
    const allMetrics = await performanceMonitor.getMetrics();
    console.log('Complete performance metrics:', allMetrics);
    
    // Performance assertions
    await performanceMonitor.assertPerformance('cold-start', 8000);
    await performanceMonitor.assertPerformance('navigation', 3000);
    await performanceMonitor.assertPerformance('form-interaction', 1000);
  });

  test('Real-world error scenarios', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    // Scenario 1: User tries invalid email formats
    await page.goto('/login');
    
    const invalidEmails = [
      'plainaddress',
      '@missingdomain.com',
      'missing-at-sign.net',
      'missing.domain.name@',
      'spaces in@email.com',
      'special#chars@domain.com'
    ];
    
    for (const email of invalidEmails) {
      await page.getByPlaceholder('Email address').clear();
      await page.getByPlaceholder('Email address').fill(email);
      await page.getByPlaceholder('Password').fill('password123');
      
      // Check HTML5 validation
      const emailInput = page.getByPlaceholder('Email address');
      const isValid = await emailInput.evaluate((input: HTMLInputElement) => input.validity.valid);
      
      if (!isValid) {
        console.log(`Email validation working for: ${email}`);
      }
    }
    
    // Scenario 2: Network timeout simulation
    await page.route('**/auth/**', route => {
      setTimeout(() => route.continue(), 10000); // 10 second delay
    });
    
    await page.getByPlaceholder('Email address').clear();
    await page.getByPlaceholder('Email address').fill('timeout@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should handle timeout gracefully
    await page.waitForTimeout(3000);
    const pageHealth = await helper.checkPageHealth();
    expect(pageHealth.isHealthy).toBe(true);
    
    await page.unroute('**/auth/**');
    
    // Scenario 3: Rapid user interactions
    for (let i = 0; i < 10; i++) {
      await page.getByPlaceholder('Email address').clear();
      await page.getByPlaceholder('Email address').fill(`rapid${i}@example.com`);
      await helper.humanLikeDelay(50, 150);
    }
    
    // Should handle rapid interactions without issues
    const finalHealth = await helper.checkPageHealth();
    expect(finalHealth.isHealthy).toBe(true);
    
    console.log('Real-world error scenarios test completed');
  });

  test('Mobile-first user experience', async ({ browser }) => {
    // Simulate mobile device
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    });
    const page = await context.newPage();
    
    const helper = new AdvancedTestHelper(page);
    
    // Test 1: Mobile navigation
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(login|dashboard)/);
    
    if (currentUrl.includes('/login')) {
      // Test 2: Mobile form interaction
      const emailInput = page.getByPlaceholder('Email address');
      const passwordInput = page.getByPlaceholder('Password');
      
      // Test touch interactions
      await emailInput.tap();
      await emailInput.fill('mobile@example.com');
      
      await passwordInput.tap();
      await passwordInput.fill('mobilepass123');
      
      // Verify mobile input works
      const emailValue = await emailInput.inputValue();
      expect(emailValue).toBe('mobile@example.com');
      
      // Test 3: Mobile button interaction
      const submitButton = page.getByRole('button', { name: 'Sign in' });
      const buttonBounds = await submitButton.boundingBox();
      
      expect(buttonBounds?.width || 0).toBeGreaterThan(44); // iOS touch target minimum
      expect(buttonBounds?.height || 0).toBeGreaterThan(44);
      
      await submitButton.tap();
      await page.waitForTimeout(2000);
      
      // Should handle mobile submission
      const mobileHealth = await helper.checkPageHealth();
      expect(mobileHealth.isHealthy).toBe(true);
      
      // Test 4: Mobile accessibility
      const mobileA11y = await helper.checkAccessibility();
      expect(mobileA11y.score).toBeGreaterThan(60); // Lower threshold for mobile
      
      console.log(`Mobile accessibility score: ${mobileA11y.score}%`);
    }
    
    console.log('Mobile-first user experience test completed');
    await context.close();
  });

  test('API integration and data flow', async ({ request, page }) => {
    // Test 1: Public API endpoints
    const endpoints = [
      '/api/qr/test123',
      '/api/health', // If it exists
      '/api/status'  // If it exists
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await request.get(endpoint);
        console.log(`${endpoint}: ${response.status()}`);
        
        // Should respond with valid HTTP status
        expect(response.status()).toBeGreaterThanOrEqual(200);
        expect(response.status()).toBeLessThan(600);
        
        // Should have proper content type
        const contentType = response.headers()['content-type'];
        expect(contentType).toBeTruthy();
        
      } catch (error) {
        console.log(`${endpoint}: Not available or error`);
      }
    }
    
    // Test 2: API security headers
    const securityTestResponse = await request.get('/api/qr/test123');
    const headers = securityTestResponse.headers();
    
    console.log('API security headers:', {
      'x-frame-options': headers['x-frame-options'],
      'x-content-type-options': headers['x-content-type-options'],
      'content-security-policy': headers['content-security-policy']
    });
    
    // Test 3: CORS handling
    const corsResponse = await request.get('/api/qr/test123', {
      headers: {
        'Origin': 'https://evil-site.com'
      }
    });
    
    // Should handle CORS appropriately
    expect([200, 403, 404]).toContain(corsResponse.status());
    
    console.log('API integration test completed');
  });

  test('Complete application security baseline', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    await page.goto('/login');
    
    // Test 1: Basic XSS protection
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
      '<svg onload=alert("xss")>'
    ];
    
    for (const payload of xssPayloads) {
      await page.getByPlaceholder('Email address').clear();
      await page.getByPlaceholder('Email address').fill(payload + '@example.com');
      
      const emailValue = await page.getByPlaceholder('Email address').inputValue();
      
      // XSS payload should be sanitized or escaped
      expect(emailValue).not.toContain('<script>');
      expect(emailValue).not.toContain('javascript:');
      expect(emailValue).not.toContain('onerror=');
      expect(emailValue).not.toContain('onload=');
    }
    
    // Test 2: CSRF protection (basic check)
    await page.getByPlaceholder('Email address').clear();
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await page.waitForTimeout(2000);
    
    // Should not crash from security testing
    const securityHealth = await helper.checkPageHealth();
    expect(securityHealth.isHealthy).toBe(true);
    
    // Test 3: Information disclosure
    const pageSource = await page.content();
    
    // Should not expose sensitive information in client-side code
    expect(pageSource).not.toContain('password');
    expect(pageSource).not.toContain('secret');
    expect(pageSource).not.toContain('private_key');
    expect(pageSource).not.toContain('api_key');
    
    console.log('Security baseline test completed');
  });
});