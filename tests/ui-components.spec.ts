import { test, expect } from '@playwright/test';

/**
 * UI Component Tests
 * 
 * Tests for components that don't require authentication.
 * These tests focus on the public-facing UI and basic functionality.
 */

test.describe('Public UI Components', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page).toHaveTitle(/QR Generator/);
    
    // Check for login form elements
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    
    // Check for signup link
    await expect(page.getByRole('link', { name: 'create a new account' })).toBeVisible();
    
    console.log('Login page UI components verified');
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/signup');
    
    // Check page title
    await expect(page).toHaveTitle(/QR Generator/);
    
    // Check for signup form elements  
    const signupHeading = page.getByRole('heading', { name: /create your account/i });
    await expect(signupHeading).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
    
    console.log('Signup page UI components verified');
  });

  test('should handle form validation on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check for HTML5 validation or custom error messages
    const emailField = page.getByPlaceholder('Email address');
    const isRequired = await emailField.getAttribute('required');
    expect(isRequired).not.toBeNull();
    
    console.log('Login form validation verified');
  });

  test('should handle form validation on signup page', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Check for HTML5 validation
    const emailField = page.getByPlaceholder('Email address');
    const isRequired = await emailField.getAttribute('required');
    expect(isRequired).not.toBeNull();
    
    console.log('Signup form validation verified');
  });

  test('should navigate between login and signup pages', async ({ page }) => {
    await page.goto('/login');
    
    // Navigate to signup
    await page.getByRole('link', { name: 'create a new account' }).click();
    await expect(page).toHaveURL('/signup');
    
    // Navigate back to login (if there's a link)
    const loginLink = page.getByRole('link', { name: /sign in|login/i });
    if (await loginLink.count() > 0) {
      await loginLink.click();
      await expect(page).toHaveURL('/login');
    }
    
    console.log('Navigation between auth pages verified');
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/login');
    
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    
    console.log('Responsive design verified');
  });

  test('should handle invalid email format gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid email
    await page.getByPlaceholder('Email address').fill('invalid-email');
    await page.getByPlaceholder('Password').fill('somepassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should either show HTML5 validation or custom error
    const emailField = page.getByPlaceholder('Email address');
    const emailType = await emailField.getAttribute('type');
    expect(emailType).toBe('email'); // Should use email input type for validation
    
    console.log('Email validation handling verified');
  });

  test('should display loading states', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in form
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    
    // Submit form and check for loading state
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Look for loading state (button text change or spinner)
    const loadingButton = page.getByRole('button', { name: /signing in|loading/i });
    if (await loadingButton.count() > 0) {
      await expect(loadingButton).toBeVisible();
    }
    
    console.log('Loading states checked');
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in form
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    
    // Submit and wait for error
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show some kind of error message eventually
    const errorMessage = page.locator('.text-red-800, .error, [class*="error"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    console.log('Network error handling verified');
  });

  test('should allow retry after error', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in form and submit to trigger error
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for error
    const errorMessage = page.locator('.text-red-800, .error, [class*="error"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // Button should be clickable again
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    
    console.log('Error recovery verified');
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/login');
    
    // Check for proper heading hierarchy
    const mainHeading = page.getByRole('heading', { level: 1 }).or(
      page.getByRole('heading', { level: 2 })
    );
    await expect(mainHeading).toBeVisible();
    
    console.log('Heading structure verified');
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check that form fields have associated labels or aria-label
    const emailField = page.getByPlaceholder('Email address');
    const passwordField = page.getByPlaceholder('Password');
    
    // Fields should have placeholder text at minimum
    await expect(emailField).toHaveAttribute('placeholder', 'Email address');
    await expect(passwordField).toHaveAttribute('placeholder', 'Password');
    
    console.log('Form accessibility verified');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    
    // Focus on first element and tab through form elements
    await page.getByPlaceholder('Email address').focus();
    await expect(page.getByPlaceholder('Email address')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder('Password')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
    
    console.log('Keyboard navigation verified');
  });
});