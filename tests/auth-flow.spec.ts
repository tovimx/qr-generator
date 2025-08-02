import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Test user credentials - should be environment-specific in production
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#',
  name: 'Test User'
};

// Helper function to fill and submit signup form
async function fillSignupForm(page: Page, user = TEST_USER) {
  await page.getByPlaceholder('Email address').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign up' }).click();
}

// Helper function to fill and submit login form
async function fillLoginForm(page: Page, user = TEST_USER) {
  await page.getByPlaceholder('Email address').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from a clean state
    await page.goto('/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('should show signup link on login page', async ({ page }) => {
    await page.goto('/login');
    
    const signupLink = page.getByRole('link', { name: 'create a new account' });
    await expect(signupLink).toBeVisible();
    
    await signupLink.click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  });

  test('should validate email format on signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Try invalid email
    await page.getByPlaceholder('Email address').fill('invalid-email');
    await page.getByPlaceholder('Password').fill('ValidPassword123!');
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Should show validation error
    await expect(page.getByText('Please enter a valid email')).toBeVisible();
  });

  test('should validate password requirements on signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Try weak password
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('weak');
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Should show password requirements
    await expect(page.getByText(/password must be/i)).toBeVisible();
  });

  test('should create new account and redirect to dashboard', async ({ page }) => {
    await page.goto('/signup');
    
    // Generate unique email for this test run
    const uniqueEmail = `test-${Date.now()}@example.com`;
    
    await page.getByPlaceholder('Email address').fill(uniqueEmail);
    await page.getByPlaceholder('Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Should redirect to dashboard after successful signup
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Should see dashboard content
    await expect(page.getByRole('heading', { name: 'Your QR Code' })).toBeVisible();
    
  });

  test('should login with existing account', async ({ page }) => {
    await page.goto('/login');
    
    // Note: This assumes test@example.com exists in the test database
    // In production, you'd want to seed the database or create the user first
    await fillLoginForm(page);
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByPlaceholder('Email address').fill('wrong@example.com');
    await page.getByPlaceholder('Password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await fillLoginForm(page);
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Find and click logout button
    await page.getByRole('button', { name: /sign out/i }).click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    
    // Try to access dashboard again - should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await page.goto('/login');
    await fillLoginForm(page);
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should handle session expiration gracefully', async ({ page, context }) => {
    // Login
    await page.goto('/login');
    await fillLoginForm(page);
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Clear cookies to simulate session expiration
    await context.clearCookies();
    
    // Try to navigate to a protected page
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Protected Routes', () => {
  const protectedRoutes = [
    '/dashboard'
  ];

  for (const route of protectedRoutes) {
    test(`should redirect ${route} to login when not authenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL('/login');
    });
  }
});

test.describe('Authentication UI Elements', () => {
  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form
    await page.getByPlaceholder('Email address').fill(TEST_USER.email);
    await page.getByPlaceholder('Password').fill(TEST_USER.password);
    
    // Start monitoring for loading state
    const submitButton = page.getByRole('button', { name: 'Sign in' });
    
    // Click and check for loading state
    const responsePromise = page.waitForResponse(/\/auth\/v1\/token/);
    await submitButton.click();
    
    // Button should show loading state (disabled or spinner)
    await expect(submitButton).toBeDisabled();
    
    await responsePromise;
  });

  test('should have password field with proper type', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.getByPlaceholder('Password');
    
    // Verify password field exists and is hidden by default
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Note: If there's no password toggle in the UI, this test just verifies the field exists
  });
});