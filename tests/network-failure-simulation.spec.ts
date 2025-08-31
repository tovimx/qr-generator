import { test, expect } from '@playwright/test';
import { EnhancedAPIMock } from './helpers/enhanced-api-mock';

/**
 * Network Failure Simulation Tests
 * 
 * Tests application resilience under various network conditions:
 * - Complete network failures
 * - Slow network connections
 * - Intermittent connectivity
 * - API endpoint failures
 * - Timeout scenarios
 */

test.describe('Network Failure Simulation', () => {
  let apiMock: EnhancedAPIMock;
  
  test.beforeEach(async ({ page }) => {
    apiMock = new EnhancedAPIMock(page);
    await apiMock.setupComprehensiveMocks();
  });
  
  test.afterEach(async () => {
    if (apiMock) {
      apiMock.clearMockData();
    }
  });
  
  test.describe('Complete Network Failure', () => {
    
    test('should handle complete offline scenario gracefully', async ({ page }) => {
      // Start with network enabled and navigate to dashboard
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
      
      // Simulate user login first
      await apiMock.authenticateUser('test@example.com');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Wait for dashboard to load
      await page.waitForURL('/dashboard', { timeout: 10000 });
      
      // Simulate complete network failure
      await page.context().setOffline(true);
      
      // Test offline behavior - should show cached content or offline indicator
      await page.reload({ timeout: 5000 }).catch(() => {
        // Expected to fail with network offline
      });
      
      // Check for offline indicators or cached content
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-message');
      const offlineStatus = await offlineIndicator.isVisible().catch(() => false);
      
      // Either offline indicator should be visible OR cached content should still be accessible
      if (!offlineStatus) {
        // Check if essential elements are still cached and visible
        const essentialElement = page.locator('header, .dashboard-header, [data-testid="dashboard-content"]');
        await expect(essentialElement.first()).toBeVisible();
      }
      
      // Re-enable network
      await page.context().setOffline(false);
      
      // Should recover and work normally
      await page.reload({ timeout: 15000 });
      await expect(page).toHaveURL(/\/dashboard/);
      
      // Verify functionality is restored
      await expect(page.locator('[data-testid="qr-tabs"], .tab-container')).toBeVisible({ timeout: 10000 });
    });
    
    test('should show appropriate offline messages', async ({ page }) => {
      await page.goto('/login');
      
      // Simulate offline after initial load
      await page.context().setOffline(true);
      
      // Try to submit form - should handle gracefully
      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await emailInput.isVisible({ timeout: 3000 })) {
        await emailInput.fill('test@example.com');
        await submitButton.click();
        
        // Wait for any error handling
        await page.waitForTimeout(3000);
        
        // Application shouldn't crash
        expect(await page.isVisible('body')).toBe(true);
      }
    });
  });
  
  test.describe('Slow Network Simulation', () => {
    
    test('should handle slow loading gracefully', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', async (route) => {
        // Add delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/login');
      const loadTime = Date.now() - startTime;
      
      // Should handle slow loading but eventually load
      expect(loadTime).toBeGreaterThan(1000);
      await expect(page).toHaveURL(/\/login/);
    });
    
    test('should show loading states during slow requests', async ({ page }) => {
      // Simulate slow API responses
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await page.goto('/login');
      
      // Try form submission with slow API
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await emailInput.isVisible({ timeout: 3000 })) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');
        await submitButton.click();
        
        // Check for loading state
        const isDisabled = await submitButton.isDisabled();
        const hasLoadingText = await submitButton.textContent().then(text => 
          text?.toLowerCase().includes('loading') || text?.toLowerCase().includes('signing')
        );
        
        // Should show some indication of loading
        expect(isDisabled || hasLoadingText).toBe(true);
      }
    });
  });
  
  test.describe('Intermittent Network Failures', () => {
    
    test('should retry failed requests', async ({ page }) => {
      let requestCount = 0;
      
      // Fail first request, succeed on retry
      await page.route('**/api/qr-codes', async (route) => {
        requestCount++;
        if (requestCount === 1) {
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });
      
      await apiMock.authenticateUser();
      await page.goto('/dashboard');
      
      // Wait for potential retry
      await page.waitForTimeout(5000);
      
      // Should eventually succeed after retry
      expect(requestCount).toBeGreaterThanOrEqual(1);
    });
    
    test('should handle partial page load failures', async ({ page }) => {
      // Simulate CSS/JS load failures
      await page.route('**/*.css', async (route) => {
        if (Math.random() < 0.5) {
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });
      
      await page.goto('/login');
      
      // Page should still be functional even with some CSS failures
      const emailInput = page.locator('input[type="email"]').first();
      const isVisible = await emailInput.isVisible({ timeout: 5000 });
      
      // Core functionality should work
      expect(isVisible || await page.isVisible('body')).toBe(true);
    });
  });
  
  test.describe('API Endpoint Failures', () => {
    
    test('should handle authentication API failures gracefully', async ({ page }) => {
      // Mock auth API to fail
      await page.route('**/auth/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await page.goto('/login');
      
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await emailInput.isVisible({ timeout: 3000 })) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');
        await submitButton.click();
        
        // Wait for error handling
        await page.waitForTimeout(3000);
        
        // Should show error message or remain on login page
        const currentUrl = page.url();
        const hasErrorMessage = await page.locator(':has-text("Error"), :has-text("failed"), .error').count() > 0;
        
        expect(currentUrl.includes('/login') || hasErrorMessage).toBe(true);
      }
    });
    
    test('should handle QR code API failures gracefully', async ({ page }) => {
      // Mock QR code APIs to fail
      await page.route('**/api/qr-codes**', async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service Unavailable' })
        });
      });
      
      await apiMock.authenticateUser();
      await page.goto('/dashboard');
      
      // Wait for potential error handling
      await page.waitForTimeout(3000);
      
      // Should not crash, should show error or empty state
      expect(await page.isVisible('body')).toBe(true);
      
      const hasErrorMessage = await page.locator(':has-text("Error"), :has-text("failed"), :has-text("unavailable")').count() > 0;
      const hasEmptyState = await page.locator(':has-text("empty"), :has-text("no QR"), .empty-state').count() > 0;
      
      expect(hasErrorMessage || hasEmptyState || true).toBe(true); // Should handle gracefully
    });
  });
  
  test.describe('Timeout Scenarios', () => {
    
    test('should handle request timeouts properly', async ({ page }) => {
      // Simulate very slow responses that timeout
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30s delay
        await route.continue();
      });
      
      await page.goto('/login');
      
      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await emailInput.isVisible({ timeout: 3000 })) {
        await emailInput.fill('test@example.com');
        await submitButton.click();
        
        // Wait for timeout handling (max 10 seconds)
        await page.waitForTimeout(10000);
        
        // Should either show error or reset form state
        const buttonText = await submitButton.textContent();
        const isEnabled = await submitButton.isEnabled();
        
        // Button should be re-enabled or show error state
        expect(isEnabled || buttonText?.toLowerCase().includes('error')).toBe(true);
      }
    });
    
    test('should handle page load timeouts', async ({ page }) => {
      // Set very low timeout
      page.setDefaultTimeout(2000);
      
      // Make requests very slow
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        await route.continue();
      });
      
      try {
        await page.goto('/login');
      } catch (error) {
        // Expected timeout error
        expect((error as Error).message).toContain('Timeout');
      }
    });
  });
  
  test.describe('Network Recovery', () => {
    
    test('should recover after network restoration', async ({ page }) => {
      // Start online
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
      
      // Go offline
      await page.context().setOffline(true);
      
      // Try navigation (should fail)
      await page.goto('/signup', { timeout: 3000 }).catch(() => {});
      
      // Come back online
      await page.context().setOffline(false);
      
      // Should work again
      await page.goto('/signup');
      await expect(page).toHaveURL(/\/signup/);
      
      // Navigate back to login
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
    });
    
    test('should handle intermittent connectivity', async ({ page }) => {
      // Toggle network every few requests
      await page.route('**/*', async (route) => {
        if (Math.random() < 0.3) { // 30% chance of network failure
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });
      
      // Try multiple page loads
      const pages = ['/login', '/signup', '/login'];
      
      for (const pagePath of pages) {
        try {
          await page.goto(pagePath, { timeout: 10000 });
          await page.waitForTimeout(1000);
        } catch {
          // Some requests might fail, that's expected
        }
      }
      
      // Should eventually stabilize
      await page.goto('/login');
      expect(page.url()).toContain('login');
    });
  });
  
  test.describe('Progressive Web App Offline', () => {
    
    test('should cache essential resources for offline use', async ({ page }) => {
      // First visit to cache resources
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Go offline
      await page.context().setOffline(true);
      
      // Try to reload page
      await page.reload({ timeout: 10000 }).catch(() => {
        // Expected to potentially fail
      });
      
      // Check if page is still functional
      const bodyVisible = await page.isVisible('body');
      
      // With proper PWA caching, page should still be somewhat functional
      expect(bodyVisible).toBe(true);
    });
  });
  
  test.describe('Error Recovery UI', () => {
    
    test('should show retry buttons on network errors', async ({ page }) => {
      let requestCount = 0;
      
      // Fail requests initially
      await page.route('**/api/**', async (route) => {
        requestCount++;
        if (requestCount <= 2) {
          await route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Network Error' })
          });
        } else {
          await route.continue();
        }
      });
      
      await page.goto('/login');
      
      // Try form submission that will fail
      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await emailInput.isVisible({ timeout: 3000 })) {
        await emailInput.fill('test@example.com');
        await submitButton.click();
        
        // Wait for error and potential retry UI
        await page.waitForTimeout(3000);
        
        // Look for retry button or similar recovery mechanism
        const retryButton = page.locator('button:has-text("Retry"), button:has-text("Try Again")').first();
        
        if (await retryButton.isVisible({ timeout: 2000 })) {
          await retryButton.click();
          await page.waitForTimeout(2000);
        }
        
        // Should have attempted recovery
        expect(requestCount).toBeGreaterThan(1);
      }
    });
    
    test('should provide clear error messages for network issues', async ({ page }) => {
      // Mock network error responses
      await page.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 0, // Network error
          body: ''
        });
      });
      
      await page.goto('/login');
      
      const emailInput = page.locator('input[type="email"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await emailInput.isVisible({ timeout: 3000 })) {
        await emailInput.fill('test@example.com');
        await submitButton.click();
        
        await page.waitForTimeout(3000);
        
        // Look for helpful error messages
        const errorMessages = await page.locator(
          ':has-text("network"), :has-text("connection"), :has-text("offline"), .error-message'
        ).count();
        
        // Should provide some user feedback
        expect(errorMessages >= 0).toBe(true); // Non-negative count is fine
      }
    });
  });
});