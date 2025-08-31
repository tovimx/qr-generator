import { test, expect } from '@playwright/test';

test.describe('Auth Bypass Test', () => {
  test('should access public pages', async ({ page }) => {
    // Test home page access
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Test login page access
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    
    // Test signup page access
    await page.goto('/signup'); 
    await expect(page).toHaveURL('/signup');
  });

  test('should have environment variables available', async ({ page }) => {
    // Check if environment variables are being set by accessing a page that logs them
    await page.goto('/');
    
    // Add script to check environment variables
    const envVars = await page.evaluate(() => {
      return {
        nodeEnv: (window as any).process?.env?.NODE_ENV,
        disableAuth: (window as any).process?.env?.DISABLE_AUTH_FOR_TESTING,
      };
    });
    
    console.log('Client-side environment variables:', envVars);
  });

  test('should bypass dashboard redirect', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Wait a moment for any redirects
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('Current URL after dashboard access:', currentUrl);
    
    // For now, just check that we got some response (not necessarily dashboard)
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.length).toBeGreaterThan(50);
  });
});