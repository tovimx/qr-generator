/**
 * Improved Authentication Flow Tests
 * Fixed to match actual application behavior
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Test user credentials (currently unused but kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#',
};

// Generate unique email for each test run
const generateTestEmail = () => `test-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`;

// Helper to wait for auth state changes
async function waitForAuthComplete(page: Page, timeout = 10000) {
  await page.waitForFunction(
    () => !document.body.textContent?.includes('Signing in...') && 
         !document.body.textContent?.includes('Creating account...'),
    { timeout }
  );
}

test.describe('Authentication Flow - Fixed', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // Ignore localStorage access errors
        console.log('Storage access denied, continuing without clearing');
      }
    });
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Verify page loads with correct elements
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'create a new account' })).toBeVisible();
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // Verify page loads with correct elements
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder(/Password.*min 6 characters/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'sign in to existing account' })).toBeVisible();
  });

  test('should navigate between login and signup pages', async ({ page }) => {
    // Start on login page
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    
    // Navigate to signup
    await page.getByRole('link', { name: 'create a new account' }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    
    // Navigate back to login
    await page.getByRole('link', { name: 'sign in to existing account' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('should validate email format with HTML5 validation', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill form with invalid email
    await page.getByPlaceholder('Email address').fill('invalid-email');
    await page.getByPlaceholder(/Password.*min 6 characters/).fill('validpassword123');
    
    // Try to submit - HTML5 validation should prevent submission
    const emailInput = page.getByPlaceholder('Email address');
    const validationMessage = await emailInput.evaluate((input: HTMLInputElement) => input.validationMessage);
    
    expect(validationMessage).toContain('valid email');
  });

  test('should validate password minimum length', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill form with short password
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder(/Password.*min 6 characters/).fill('123');
    
    // HTML5 validation should prevent submission
    const passwordInput = page.getByPlaceholder(/Password.*min 6 characters/);
    const validationMessage = await passwordInput.evaluate((input: HTMLInputElement) => input.validationMessage);
    
    expect(validationMessage).toContain('at least 6 characters');
  });

  test('should show loading state during signup', async ({ page }) => {
    await page.goto('/signup');
    
    const uniqueEmail = generateTestEmail();
    await page.getByPlaceholder('Email address').fill(uniqueEmail);
    await page.getByPlaceholder(/Password.*min 6 characters/).fill('validpassword123');
    
    // Click submit and immediately check for loading state
    const submitButton = page.getByRole('button', { name: 'Sign up' });
    await submitButton.click();
    
    // Should show loading text
    await expect(page.getByRole('button', { name: 'Creating account...' })).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('somepassword');
    
    // Click submit and check for loading state
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    await submitButton.click();
    
    // Should show loading text (even if auth fails, we should see the loading state)
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
  });

  test('should display auth errors from Supabase', async ({ page }) => {
    await page.goto('/login');
    
    // Try to login with invalid credentials
    await page.getByPlaceholder('Email address').fill('nonexistent@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for auth attempt to complete
    await waitForAuthComplete(page);
    
    // Should show error message
    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.locator('.text-red-800')).toBeVisible();
  });

  test('should handle signup with existing email', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to sign up with likely existing email
    await page.getByPlaceholder('Email address').fill('admin@example.com');
    await page.getByPlaceholder(/Password.*min 6 characters/).fill('validpassword123');
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Wait for auth attempt to complete
    await waitForAuthComplete(page);
    
    // Should show error or redirect (depends on Supabase configuration)
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/signup')) {
      // If stayed on auth page, should show error
      await expect(page.locator('.bg-red-50, .text-red-800').first()).toBeVisible({ timeout: 5000 });
    }
    // If redirected to dashboard, signup was successful (auto-confirmation enabled)
  });

  test('should maintain form state during validation errors', async ({ page }) => {
    await page.goto('/login');
    
    const email = 'test@example.com';
    const password = 'wrongpassword';
    
    await page.getByPlaceholder('Email address').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for potential error
    await waitForAuthComplete(page);
    
    // Form should maintain the email value
    await expect(page.getByPlaceholder('Email address')).toHaveValue(email);
    // Password field should be cleared (typical behavior)
    await expect(page.getByPlaceholder('Password')).toHaveValue('');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Simulate network failure
    await page.route('**/auth/**', route => route.abort());
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should handle network error and show loading state ended
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Authentication - User Experience', () => {
  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check for proper labeling
    const emailInput = page.getByPlaceholder('Email address');
    const passwordInput = page.getByPlaceholder('Password');
    
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('autoComplete', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/signup');
    
    // Email field should be focusable
    await page.getByPlaceholder('Email address').focus();
    await expect(page.getByPlaceholder('Email address')).toBeFocused();
    
    // Tab to password field
    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder(/Password.*min 6 characters/)).toBeFocused();
    
    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeFocused();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    
    // Should be able to submit with Enter key
    await page.getByPlaceholder('Password').press('Enter');
    
    // Should trigger form submission (loading state)
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Form should be visible and usable on mobile
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });
});