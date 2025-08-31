/**
 * Reliability and Error Handling E2E Tests
 * Tests network failures, edge cases, and error recovery scenarios
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { QRCodePage } from './helpers/qr-page';
import { ApiHelper } from './helpers/api';
import { DatabaseHelper } from './helpers/database';
import { generateTestEmail } from './helpers/supabase-auth';

test.describe('Reliability Tests', () => {
  let authHelper: AuthHelper;
  let qrPage: QRCodePage;
  let apiHelper: ApiHelper;
  let dbHelper: DatabaseHelper;
  let testEmail: string;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page);
    qrPage = new QRCodePage(page);
    apiHelper = new ApiHelper(page, request);
    dbHelper = new DatabaseHelper(page);
    testEmail = generateTestEmail('reliability');
  });

  test.afterEach(async () => {
    await dbHelper.cleanupTestData(testEmail);
    await apiHelper.clearNetworkMocks();
  });

  test('Network failure recovery during login', async ({ page }) => {
    await page.goto('/login');
    
    // Mock network failure for login attempt
    await apiHelper.mockNetworkFailure('/auth/v1/token*');
    
    // Attempt login - should show error
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill('Test123!@#');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show network error
    await expect(page.locator('.error-message, [role="alert"], .text-red-500')).toBeVisible();
    
    // Clear network mock and retry
    await apiHelper.clearNetworkMocks();
    
    // Create the user first via signup
    await page.goto('/signup');
    await authHelper.signup(testEmail, 'Test123!@#');
    
    // Should succeed this time
    await expect(page).toHaveURL('/dashboard');
  });

  test('API timeout handling', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Mock slow API response for link creation
    await apiHelper.mockSlowResponse('/api/qr-codes/*/links*', 10000); // 10 second delay
    
    // Attempt to add a link
    await page.getByRole('button', { name: /add link/i }).click();
    await page.getByPlaceholder(/title/i).fill('Timeout Test');
    await page.getByPlaceholder(/url/i).fill('https://timeout.com');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show loading state
    const saveButton = page.getByRole('button', { name: /save/i });
    await expect(saveButton).toBeDisabled({ timeout: 1000 });
    
    // Should eventually timeout and show error
    await expect(page.locator('.error-message, [role="alert"], .text-red-500')).toBeVisible({
      timeout: 15000
    });
  });

  test('Session expiration handling', async ({ page, context }) => {
    // Login successfully
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    await qrPage.verifyQRCodeDisplayed();
    
    // Simulate session expiration by clearing auth cookies
    await context.clearCookies();
    
    // Try to perform an authenticated action
    await page.reload();
    
    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
    
    // User can log back in
    await authHelper.login(testEmail, 'Test123!@#');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Database connection failure simulation', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Mock database/API errors
    await apiHelper.mockApiError('/api/qr-codes*', 500, {
      error: 'Internal Server Error',
      message: 'Database connection failed'
    });
    
    // Try to update QR code
    await qrPage.updateTitle('Database Error Test');
    
    // Should handle error gracefully
    await expect(page.locator('.error-message, [role="alert"], .text-red-500')).toBeVisible();
  });

  test('Malformed API response handling', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Mock malformed API response
    await apiHelper.mockApiError('/api/qr-codes/*/links*', 200, 'invalid-json-response');
    
    // Try to add a link
    await page.getByRole('button', { name: /add link/i }).click();
    await page.getByPlaceholder(/title/i).fill('Malformed Test');
    await page.getByPlaceholder(/url/i).fill('https://malformed.com');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should handle malformed response gracefully
    await expect(page.locator('.error-message, [role="alert"], .text-red-500')).toBeVisible();
  });

  test('Rate limiting handling', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Mock rate limiting response
    await apiHelper.mockApiError('/api/qr-codes/*/links*', 429, {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
    
    // Try to add multiple links rapidly
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /add link/i }).click();
      await page.getByPlaceholder(/title/i).fill(`Rate Limit Test ${i}`);
      await page.getByPlaceholder(/url/i).fill(`https://ratelimit${i}.com`);
      await page.getByRole('button', { name: /save/i }).click();
      
      if (i === 0) {
        // First request should show rate limit error
        await expect(page.getByText(/rate limit|too many/i)).toBeVisible();
      }
    }
  });

  test('Concurrent modification handling', async ({ page, context }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Open same QR code in two tabs
    const page2 = await context.newPage();
    const qrPage2 = new QRCodePage(page2);
    
    // Login in second tab
    await authHelper.login.call(new AuthHelper(page2), testEmail, 'Test123!@#');
    await qrPage2.goto();
    
    // Both tabs modify the same QR code simultaneously
    const promise1 = qrPage.updateTitle('Tab 1 Title');
    const promise2 = qrPage2.updateTitle('Tab 2 Title');
    
    await Promise.all([promise1, promise2]);
    
    // Both tabs should handle the concurrent modification
    // The app should show the latest state
    await page.reload();
    await page2.reload();
    
    // At least one of the titles should be visible
    const hasTab1 = await page.getByText('Tab 1 Title').isVisible().catch(() => false);
    const hasTab2 = await page.getByText('Tab 2 Title').isVisible().catch(() => false);
    
    expect(hasTab1 || hasTab2).toBe(true);
    
    await page2.close();
  });

  test('Browser back/forward navigation', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Navigate to different state
    await qrPage.updateTitle('Navigation Test');
    
    // Navigate to QR page
    const shortLink = await qrPage.getShortLink();
    const shortCode = shortLink.replace('/q/', '');
    await page.goto(`/q/${shortCode}`);
    
    // Use browser back
    await page.goBack();
    
    // Should be back on dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Use browser forward
    await page.goForward();
    
    // Should be back on QR page
    await expect(page).toHaveURL(`/q/${shortCode}`);
  });

  test('Page refresh during operations', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Start adding a link but don't save
    await page.getByRole('button', { name: /add link/i }).click();
    await page.getByPlaceholder(/title/i).fill('Refresh Test');
    await page.getByPlaceholder(/url/i).fill('https://refresh.com');
    
    // Refresh page before saving
    await page.reload();
    
    // Should be back to clean state
    await expect(page).toHaveURL('/dashboard');
    await qrPage.verifyQRCodeDisplayed();
    
    // Form data should be lost (expected behavior)
    await expect(page.getByText('Refresh Test')).not.toBeVisible();
  });

  test('Invalid QR code access', async ({ page }) => {
    // Try to access non-existent QR code
    await page.goto('/q/invalid-code-123');
    
    // Should show appropriate error or redirect
    // The behavior depends on implementation - might be 404 page or redirect
    const currentUrl = page.url();
    const isErrorPage = currentUrl.includes('404') || 
                       currentUrl.includes('not-found') ||
                       await page.getByText(/not found|invalid/i).isVisible().catch(() => false);
    
    expect(isErrorPage || currentUrl === 'http://localhost:3000/login').toBe(true);
  });

  test('JavaScript disabled fallback', async ({ browser }) => {
    // Create context with JavaScript disabled
    const context = await browser.newContext({
      javaScriptEnabled: false
    });
    
    const page = await context.newPage();
    
    // Try to access the application
    await page.goto('/');
    
    // Should show some form of graceful degradation or error message
    // Even with JS disabled, basic HTML should be accessible
    const hasContent = await page.locator('body').textContent();
    expect(hasContent?.length).toBeGreaterThan(0);
    
    await context.close();
  });

  test('Large data handling', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Test with very long URLs and titles
    const longTitle = 'A'.repeat(500); // Very long title
    const longUrl = 'https://example.com/' + 'path/'.repeat(100) + '?param=' + 'value'.repeat(100);
    
    await qrPage.updateTitle(longTitle);
    
    // Try to add link with long URL
    await page.getByRole('button', { name: /add link/i }).click();
    await page.getByPlaceholder(/title/i).fill('Long URL Test');
    await page.getByPlaceholder(/url/i).fill(longUrl);
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should either accept it or show validation error
    const hasError = await page.locator('.error-message, [role="alert"], .text-red-500').isVisible().catch(() => false);
    const hasLink = await page.getByText('Long URL Test').isVisible().catch(() => false);
    
    // Either should work or show appropriate error
    expect(hasError || hasLink).toBe(true);
  });

  test('Cross-browser compatibility checks', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Test basic functionality works
    await qrPage.verifyQRCodeDisplayed();
    await qrPage.updateTitle('Cross-browser Test');
    await qrPage.addLink('Browser Test', 'https://browser-test.com');
    
    // Verify QR code generation works
    const shortLink = await qrPage.getShortLink();
    expect(shortLink).toMatch(/\/q\/[a-zA-Z0-9]+/);
    
    // Test QR page functionality
    const shortCode = shortLink.replace('/q/', '');
    await qrPage.testQRCodeRedirect(shortCode);
    
    // Should work consistently across browsers
    await qrPage.verifyQRPageLinks([
      { title: 'Browser Test', url: 'https://browser-test.com' }
    ]);
  });

  test('Memory pressure handling', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Create memory pressure by performing many operations
    for (let i = 0; i < 20; i++) {
      // Add and remove links repeatedly
      await qrPage.addLink(`Memory Test ${i}`, `https://memory${i}.com`);
      
      if (i > 0) {
        await qrPage.deleteLink(`Memory Test ${i - 1}`);
      }
      
      // Small delay to prevent overwhelming
      await page.waitForTimeout(100);
    }
    
    // Application should still be responsive
    await qrPage.verifyQRCodeDisplayed();
    
    // Final link should exist
    await expect(page.getByText('Memory Test 19')).toBeVisible();
    
    // Clean up the last link
    await qrPage.deleteLink('Memory Test 19');
  });
});