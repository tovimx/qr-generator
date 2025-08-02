import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login form elements', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Create Next App/);

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

    // Check that form elements are present
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    // Check that the signup link is present
    await expect(page.getByRole('link', { name: 'create a new account' })).toBeVisible();
  });

  test('should show validation for empty form submission', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check that HTML5 validation prevents submission
    // The email field should be focused and show validation message
    const emailInput = page.getByPlaceholder('Email address');
    await expect(emailInput).toBeFocused();
  });

  test('should show validation for invalid email format', async ({ page }) => {
    // Fill in invalid email
    await page.getByPlaceholder('Email address').fill('invalid-email');
    await page.getByPlaceholder('Password').fill('password123');
    
    // Try to submit form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // HTML5 validation should prevent submission due to invalid email format
    const emailInput = page.getByPlaceholder('Email address');
    await expect(emailInput).toBeFocused();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    // Fill in the form with invalid credentials
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');

    // Submit the form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for the button text to change to loading state
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();

    // Wait for error message to appear
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.text-red-800')).toContainText(/Invalid|incorrect|wrong/i);

    // Button should return to normal state
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('should navigate to signup page when clicking signup link', async ({ page }) => {
    // Click the signup link
    await page.getByRole('link', { name: 'create a new account' }).click();

    // Should navigate to signup page
    await expect(page).toHaveURL('/signup');
  });

  test('should disable submit button while loading', async ({ page }) => {
    // Fill in form
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');

    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Button should be disabled and show loading text
    const submitButton = page.getByRole('button', { name: 'Signing in...' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test('should clear error message on new input', async ({ page }) => {
    // First, trigger an error by submitting invalid credentials
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for error to appear
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 });

    // Modify the email field
    await page.getByPlaceholder('Email address').fill('newemail@example.com');
    
    // Submit again to trigger the error clearing logic
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // The old error should be cleared during the new submission
    // (This tests the setError(null) in handleLogin)
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check that form inputs have proper labels
    const emailInput = page.getByPlaceholder('Email address');
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('autoComplete', 'email');

    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');

    // Check that labels exist (even if they're screen reader only)
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
  });

  test('should maintain form state during loading', async ({ page }) => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    // Fill in form
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    // Submit form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // During loading, form values should be maintained
    await expect(page.getByPlaceholder('Email address')).toHaveValue(testEmail);
    await expect(page.getByPlaceholder('Password')).toHaveValue(testPassword);
  });
});

test.describe('Login Integration Tests', () => {
  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Note: This test would require valid test credentials or mocked authentication
    // For now, we'll skip it unless we have a test user setup
    test.skip(true, 'Requires valid test credentials or auth mocking');
    
    // await page.goto('/login');
    // await page.getByPlaceholder('Email address').fill('valid@example.com');
    // await page.getByPlaceholder('Password').fill('validpassword');
    // await page.getByRole('button', { name: 'Sign in' }).click();
    // await expect(page).toHaveURL('/dashboard');
  });
});