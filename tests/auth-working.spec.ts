/**
 * Working Authentication Flow Tests
 * Tests that match the actual application implementation
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication - Working Implementation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Ignore localStorage access errors
        console.log('Storage access denied, continuing without clearing');
      }
    });
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Verify core page elements match actual HTML
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'create a new account' })).toBeVisible();
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // Verify signup page elements
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder(/Password.*min 6 characters/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'sign in to existing account' })).toBeVisible();
  });

  test('should navigate between auth pages', async ({ page }) => {
    // Start on login
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    
    // Go to signup
    await page.getByRole('link', { name: 'create a new account' }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    
    // Go back to login
    await page.getByRole('link', { name: 'sign in to existing account' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('should have proper form structure and attributes', async ({ page }) => {
    await page.goto('/login');
    
    // Check form attributes
    const emailInput = page.getByPlaceholder('Email address');
    const passwordInput = page.getByPlaceholder('Password');
    
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('autoComplete', 'email');
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });

  test('should show loading state during login attempt', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('somepassword');
    
    // Submit and immediately check for loading state
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show loading text briefly
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible({ timeout: 1000 });
  });

  test('should show loading state during signup attempt', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill form with unique email
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.getByPlaceholder('Email address').fill(uniqueEmail);
    await page.getByPlaceholder(/Password.*min 6 characters/).fill('password123');
    
    // Submit and check loading state
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Should show loading text briefly
    await expect(page.getByRole('button', { name: 'Creating account...' })).toBeVisible({ timeout: 1000 });
  });

  test('should maintain form styling and accessibility', async ({ page }) => {
    await page.goto('/login');
    
    // Check form styling classes are applied
    const emailInput = page.getByPlaceholder('Email address');
    const passwordInput = page.getByPlaceholder('Password');
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    
    // Verify inputs have Tailwind styling classes
    await expect(emailInput).toHaveClass(/border-gray-300/);
    await expect(passwordInput).toHaveClass(/border-gray-300/);
    await expect(submitButton).toHaveClass(/bg-indigo-600/);
    
    // Check accessibility - inputs should have labels
    await expect(page.locator('label[for="email"]')).toBeHidden(); // sr-only class
    await expect(page.locator('label[for="password"]')).toBeHidden(); // sr-only class
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Focus email field
    await page.getByPlaceholder('Email address').focus();
    await expect(page.getByPlaceholder('Email address')).toBeFocused();
    
    // Tab to password
    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('Password')).toBeFocused();
    
    // Tab to button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
    
    // Should be able to activate with Enter
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByPlaceholder('Password').press('Enter');
    
    // Should trigger form submission (loading state)
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible({ timeout: 1000 });
  });

  test('should handle form validation errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Try to login with invalid credentials - this will likely show an error
    await page.getByPlaceholder('Email address').fill('invalid@test.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for the loading state to complete
    await page.waitForFunction(() => 
      !document.body.textContent?.includes('Signing in...'), 
      { timeout: 10000 }
    );
    
    // Should still be on login page (auth failed) or show error
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
    
    // Form should retain email value
    await expect(page.getByPlaceholder('Email address')).toHaveValue('invalid@test.com');
  });

  test('should be responsive on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Form should still be visible and usable
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    
    // Should be able to fill form
    await page.getByPlaceholder('Email address').fill('mobile@test.com');
    await page.getByPlaceholder('Password').fill('password123');
    
    // Button should be clickable
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });
});

test.describe('Authentication - Form Behavior', () => {
  test('should clear password on failed login attempts', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('incorrectpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for auth attempt to complete
    await page.waitForFunction(() => 
      !document.body.textContent?.includes('Signing in...'), 
      { timeout: 10000 }
    );
    
    // Password field should be cleared for security
    await expect(page.getByPlaceholder('Password')).toHaveValue('');
  });

  test('should disable submit button during form submission', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    await submitButton.click();
    
    // Button should become disabled during loading
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });

  test('should handle network timeouts gracefully', async ({ page }) => {
    // Simulate slow network by delaying auth requests
    await page.route('**/auth/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/login');
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show loading state
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
    
    // Should eventually return to normal state (regardless of auth result)
    await expect(page.getByRole('button', { name: /Sign in/ })).toBeVisible({ timeout: 15000 });
  });
});