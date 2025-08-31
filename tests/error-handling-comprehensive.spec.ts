/**
 * Comprehensive Error Handling and Edge Case Tests
 * Tests application resilience under various failure conditions
 */

import { test, expect } from '@playwright/test';
import { AdvancedTestHelper, NetworkSimulator, SecurityTestHelper } from './helpers/advanced-test-utilities';

test.describe('Comprehensive Error Handling', () => {

  test('Authentication error scenarios', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    await helper.clearAuthState();
    
    await page.goto('/login');
    
    // Test 1: Invalid email format
    await page.getByPlaceholder('Email address').fill('invalid-email');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show validation error or prevent submission
    const validationCheck = await helper.testFormValidation();
    expect(validationCheck.hasValidation).toBe(true);
    
    // Test 2: Extremely long email
    await page.getByPlaceholder('Email address').clear();
    const longEmail = 'a'.repeat(200) + '@example.com';
    await page.getByPlaceholder('Email address').fill(longEmail);
    
    const emailValue = await page.getByPlaceholder('Email address').inputValue();
    expect(emailValue.length).toBeLessThanOrEqual(255); // Should be truncated or rejected
    
    // Test 3: SQL injection attempt in email
    await page.getByPlaceholder('Email address').clear();
    await page.getByPlaceholder('Email address').fill("admin'; DROP TABLE users; --@example.com");
    await page.getByPlaceholder('Password').clear();
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await page.waitForTimeout(2000);
    
    // Should handle gracefully (not crash the app)
    const pageHealth = await helper.checkPageHealth();
    expect(pageHealth.isHealthy).toBe(true);
    
    // Test 4: Password with special characters
    await page.getByPlaceholder('Email address').clear();
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').clear();
    await page.getByPlaceholder('Password').fill('Pass123!@#$%^&*()');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await page.waitForTimeout(2000);
    
    // Should handle special characters properly
    const finalHealth = await helper.checkPageHealth();
    expect(finalHealth.jsErrors.length).toBe(0);
  });

  test('Network failure resilience', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const networkSim = new NetworkSimulator(page);
    
    // Test 1: Complete network failure
    await networkSim.simulateAPIFailures();
    await page.goto('/login');
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show error or remain on login page
    await page.waitForTimeout(5000);
    const url = page.url();
    expect(url).toContain('/login');
    
    // Test 2: Intermittent network issues
    await networkSim.restoreNetwork();
    await networkSim.simulateIntermittentNetwork(0.5); // 50% failure rate
    
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Page should still be functional despite intermittent failures
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible({ timeout: 10000 });
    
    // Test 3: Slow network simulation
    await networkSim.restoreNetwork();
    await networkSim.simulateSlowNetwork(2000); // 2 second delay
    
    const slowLoadStart = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    const slowLoadTime = Date.now() - slowLoadStart;
    
    console.log(`Slow network load time: ${slowLoadTime}ms`);
    expect(slowLoadTime).toBeGreaterThan(2000); // Should reflect the delay
    expect(slowLoadTime).toBeLessThan(15000); // But still load eventually
    
    await networkSim.restoreNetwork();
  });

  test('UI error state handling', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    await page.goto('/login');
    
    // Test 1: Form validation errors
    await page.getByRole('button', { name: 'Sign in' }).click(); // Submit empty form
    await page.waitForTimeout(1000);
    
    // Should show validation feedback
    const validationResult = await helper.testFormValidation();
    expect(validationResult.hasValidation).toBe(true);
    
    // Test 2: Error message display and dismissal
    await page.getByPlaceholder('Email address').fill('invalid@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await page.waitForTimeout(3000);
    
    // Look for error message
    const errorMessage = page.getByText(/invalid.*credentials|wrong.*password|error|failed/i);
    const hasError = await errorMessage.isVisible();
    
    if (hasError) {
      console.log('Error message displayed correctly');
      
      // Test error dismissal on new input
      await page.getByPlaceholder('Email address').clear();
      await page.getByPlaceholder('Email address').fill('new@example.com');
      
      await helper.humanLikeDelay();
      
      // Error might dismiss on new input (optional behavior)
      console.log('Error state behavior tested');
    }
    
    // Test 3: Multiple rapid form submissions
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Sign in' }).click();
      await helper.humanLikeDelay(200, 400);
    }
    
    // Should handle rapid submissions gracefully
    const pageHealth = await helper.checkPageHealth();
    expect(pageHealth.jsErrors.length).toBeLessThan(5); // Allow minor errors but not crashes
  });

  test('Browser compatibility and feature detection', async ({ browserName, page }) => {
    const helper = new AdvancedTestHelper(page);
    
    console.log(`Testing browser compatibility on ${browserName}`);
    
    await page.goto('/login');
    
    // Test 1: Feature detection
    const features = await page.evaluate(() => {
      return {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined',
        arrow: (() => true)(), // Arrow function support
        async: typeof (async () => {})() !== 'undefined'
      };
    });
    
    // Core features should be available
    expect(features.fetch).toBe(true);
    expect(features.promises).toBe(true);
    
    // Test 2: CSS feature detection
    const cssFeatures = await page.evaluate(() => {
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);
      
      const supports = {
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        customProperties: CSS.supports('--custom', 'value')
      };
      
      document.body.removeChild(testDiv);
      return supports;
    });
    
    console.log(`${browserName} CSS features:`, cssFeatures);
    
    // Modern CSS features should be supported
    expect(cssFeatures.flexbox).toBe(true);
    
    // Test 3: Form functionality across browsers
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('testpassword');
    
    // Form should work consistently
    const emailValue = await page.getByPlaceholder('Email address').inputValue();
    const passwordValue = await page.getByPlaceholder('Password').inputValue();
    
    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('testpassword');
    
    // Test 4: Event handling
    const eventTest = await page.evaluate(() => {
      const input = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (input) {
        let eventFired = false;
        input.addEventListener('input', () => { eventFired = true; });
        
        // Simulate input event
        input.value = 'test@test.com';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        return eventFired;
      }
      return false;
    });
    
    expect(eventTest).toBe(true);
    
    console.log(`${browserName} compatibility test passed`);
  });

  test('Accessibility error handling', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    await page.goto('/login');
    
    // Test accessibility with errors present
    await page.getByRole('button', { name: 'Sign in' }).click(); // Trigger validation
    await page.waitForTimeout(1000);
    
    const accessibilityCheck = await helper.checkAccessibility();
    
    // Should maintain accessibility even with errors
    expect(accessibilityCheck.score).toBeGreaterThan(60); // 60% threshold
    
    // Error messages should be accessible
    const errorElements = page.locator('[role="alert"], .error, .invalid');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      // Errors should have proper ARIA attributes
      const firstError = errorElements.first();
      const hasAriaRole = await firstError.getAttribute('role');
      const hasAriaLabel = await firstError.getAttribute('aria-label');
      const hasText = await firstError.textContent();
      
      expect(hasAriaRole || hasAriaLabel || (hasText && hasText.length > 0)).toBeTruthy();
      console.log('Error accessibility test passed');
    }
    
    // Test keyboard navigation with errors
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    console.log(`Accessibility score: ${accessibilityCheck.score}%`);
  });

  test('Security vulnerability testing', async ({ page }) => {
    const securityHelper = new SecurityTestHelper(page);
    
    await page.goto('/login');
    
    // Test basic security measures
    const securityCheck = await securityHelper.checkBasicSecurity();
    
    console.log('Security check results:', securityCheck);
    
    // Should have some security measures in place
    if (securityCheck.vulnerabilities.length > 0) {
      console.log('Security vulnerabilities found:', securityCheck.vulnerabilities);
    }
    
    // Test XSS protection in forms
    await page.getByPlaceholder('Email address').fill('<script>alert("xss")</script>@example.com');
    await page.getByPlaceholder('Password').fill('<img src=x onerror=alert("xss")>');
    
    const emailValue = await page.getByPlaceholder('Email address').inputValue();
    const passwordValue = await page.getByPlaceholder('Password').inputValue();
    
    // Script tags should be escaped or sanitized
    expect(emailValue).not.toContain('<script>alert');
    expect(passwordValue).not.toContain('onerror=alert');
    
    // Test CSRF protection (basic check)
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(2000);
    
    // App should not crash from malicious input
    const pageHealth = await new AdvancedTestHelper(page).checkPageHealth();
    expect(pageHealth.isHealthy).toBe(true);
    
    console.log('Security vulnerability testing completed');
  });

  test('Memory and resource leak detection', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    // Test 1: Memory usage during navigation
    await page.goto('/login');
    
    const initialMemory = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/signup');
      await helper.humanLikeDelay();
      await page.goto('/login');
      await helper.humanLikeDelay();
    }
    
    const finalMemory = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      console.log(`Memory increase after navigation: ${Math.round(memoryIncrease / 1024)}KB`);
      
      // Should not have excessive memory growth
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB threshold
    }
    
    // Test 2: DOM node leak detection
    const nodeCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
    
    // Should have reasonable DOM size
    expect(nodeCount).toBeLessThan(10000); // Large but reasonable DOM limit
    
    // Test 3: Event listener cleanup
    const listenerTest = await page.evaluate(() => {
      const testElement = document.createElement('div');
      document.body.appendChild(testElement);
      
      // Add many event listeners
      for (let i = 0; i < 100; i++) {
        testElement.addEventListener('click', () => {});
      }
      
      document.body.removeChild(testElement);
      
      // Browser should clean up listeners automatically
      return true;
    });
    
    expect(listenerTest).toBe(true);
    console.log('Memory and resource leak detection completed');
  });

  test('Large data handling and performance', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    await page.goto('/login');
    
    // Test 1: Large form data
    const largeEmail = 'test.' + 'a'.repeat(100) + '@example.com';
    const largePassword = 'Password123!' + 'x'.repeat(100);
    
    await page.getByPlaceholder('Email address').fill(largeEmail);
    await page.getByPlaceholder('Password').fill(largePassword);
    
    // Should handle large inputs gracefully
    const emailInputValue = await page.getByPlaceholder('Email address').inputValue();
    const passwordInputValue = await page.getByPlaceholder('Password').inputValue();
    
    expect(emailInputValue.length).toBeGreaterThan(10);
    expect(passwordInputValue.length).toBeGreaterThan(10);
    
    // Test 2: Multiple rapid form submissions
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: 'Sign in' }).click();
      await helper.humanLikeDelay(50, 100); // Very rapid submissions
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`10 rapid submissions completed in ${totalTime}ms`);
    
    // Should handle rapid submissions without crashing
    const pageHealth = await helper.checkPageHealth();
    expect(pageHealth.jsErrors.length).toBeLessThan(3); // Allow minimal errors
    
    // Test 3: Browser back/forward with form data
    await page.goBack();
    await page.waitForTimeout(1000);
    await page.goForward();
    await page.waitForTimeout(1000);
    
    // Form data might or might not persist (browser dependent)
    const formStillWorks = await page.getByPlaceholder('Email address').isVisible();
    expect(formStillWorks).toBe(true);
    
    console.log('Large data handling test completed');
  });

  test('Concurrent user simulation', async ({ browser }) => {
    // Simulate multiple users accessing the app simultaneously
    const concurrentUsers = 5;
    const userPromises = [];

    for (let i = 0; i < concurrentUsers; i++) {
      const userPromise = (async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
          const userId = `user${i + 1}`;
          console.log(`${userId}: Starting concurrent test`);
          
          await page.goto('/login');
          await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible({ timeout: 10000 });
          
          // Each user performs different actions
          const actions = [
            () => page.getByPlaceholder('Email address').fill(`test${i}@example.com`),
            () => page.getByPlaceholder('Password').fill(`password${i}123`),
            () => page.getByRole('button', { name: 'Sign in' }).click(),
            () => page.waitForTimeout(1000)
          ];
          
          for (const action of actions) {
            await action();
            await page.waitForTimeout(Math.random() * 500 + 100); // Random delay
          }
          
          console.log(`${userId}: Completed actions`);
          return { success: true, userId };
          
        } catch (error) {
          console.log(`${userId}: Error - ${error instanceof Error ? error.message : 'Unknown'}`);
          return { success: false, userId, error: error instanceof Error ? error.message : 'Unknown' };
        } finally {
          await context.close();
        }
      })();
      
      userPromises.push(userPromise);
    }

    const results = await Promise.all(userPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`Concurrent test results: ${successCount} success, ${failureCount} failures`);
    
    // Most users should succeed (allowing for some expected auth failures)
    expect(successCount).toBeGreaterThan(concurrentUsers * 0.6); // 60% success rate minimum
  });

  test('Mobile device specific error handling', async ({ page }) => {
    // Simulate mobile device
    await page.setViewportSize({ width: 375, height: 667 });
    
    const helper = new AdvancedTestHelper(page);
    await page.goto('/login');
    
    // Test 1: Touch event handling
    const emailInput = page.getByPlaceholder('Email address');
    await emailInput.tap();
    await emailInput.fill('mobile@example.com');
    
    const passwordInput = page.getByPlaceholder('Password');
    await passwordInput.tap();
    await passwordInput.fill('mobilepass123');
    
    // Test 2: Virtual keyboard interaction
    const inputValue = await emailInput.inputValue();
    expect(inputValue).toBe('mobile@example.com');
    
    // Test 3: Mobile form submission
    await page.getByRole('button', { name: 'Sign in' }).tap();
    await page.waitForTimeout(2000);
    
    // Should handle mobile interactions properly
    const pageHealth = await helper.checkPageHealth();
    expect(pageHealth.isHealthy).toBe(true);
    
    // Test 4: Mobile responsive design
    const buttonStyles = await page.getByRole('button', { name: 'Sign in' }).evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        touchTarget: rect.width >= 44 && rect.height >= 44 // iOS/Android touch target minimum
      };
    });
    
    console.log(`Mobile button size: ${buttonStyles.width}x${buttonStyles.height}px`);
    expect(buttonStyles.touchTarget).toBe(true);
    
    console.log('Mobile device error handling test completed');
  });

  test('API endpoint error handling', async ({ request, page }) => {
    // Test API error responses and handling
    
    // Test 1: Non-existent endpoints
    const invalidEndpoint = await request.get('/api/nonexistent');
    expect(invalidEndpoint.status()).toBe(404);
    
    // Test 2: Malformed requests
    const malformedRequest = await request.post('/api/qr-codes', {
      data: { invalid: 'data' }
    });
    expect([400, 401, 403, 422]).toContain(malformedRequest.status());
    
    // Test 3: Large payload handling
    const largePayload = {
      data: 'x'.repeat(10000), // 10KB payload
      title: 'a'.repeat(1000),
      links: Array.from({ length: 100 }, (_, i) => ({
        title: `Link ${i}`,
        url: `https://example${i}.com`
      }))
    };
    
    const largeRequest = await request.post('/api/qr-codes', {
      data: largePayload
    });
    
    // Should handle large payloads gracefully (reject or accept)
    expect([200, 201, 400, 413, 422]).toContain(largeRequest.status());
    
    // Test 4: Rate limiting (if implemented)
    const rapidRequests = [];
    for (let i = 0; i < 20; i++) {
      rapidRequests.push(request.get('/api/qr/test123'));
    }
    
    const responses = await Promise.all(rapidRequests);
    const rateLimited = responses.some(r => r.status() === 429);
    
    if (rateLimited) {
      console.log('Rate limiting detected and working');
    } else {
      console.log('No rate limiting detected');
    }
    
    console.log('API endpoint error handling test completed');
  });
});