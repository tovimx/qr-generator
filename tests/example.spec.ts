import { test, expect } from '@playwright/test';

test.describe('QR Generator App - Basic Navigation', () => {
  test('should visit localhost:3000 and verify homepage', async ({ page }) => {
    // Visit the homepage
    await page.goto('/');

    // Check that the page loads successfully
    await expect(page).toHaveTitle(/Create Next App/);

    // Example: Check for common homepage elements
    // (These would need to be updated based on your actual homepage content)
    
    // You can check for specific text content
    // await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Or check that certain elements exist
    // await expect(page.locator('nav')).toBeVisible();
    
    console.log('Successfully visited localhost:3000');
  });

  test('should navigate to login page', async ({ page }) => {
    // Start from homepage
    await page.goto('/');

    // Navigate to login (this assumes there's a login link/button on homepage)
    await page.goto('/login');

    // Verify we're on the login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    
    console.log('Successfully navigated to login page');
  });

  test('should visit all auth pages', async ({ page }) => {
    // Test login page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

    // Test signup page  
    await page.goto('/signup');
    // Add expectations based on your signup page content
    
    console.log('Successfully visited all auth pages');
  });
});

test.describe('QR Generator App - Network and Performance', () => {
  test('should load the app within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Expect page to load within 10 seconds (more realistic for first load)
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Wait a bit for any async errors
    await page.waitForTimeout(1000);
    
    // Check that there are no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});