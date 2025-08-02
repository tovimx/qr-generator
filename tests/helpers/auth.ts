import { Page, expect } from '@playwright/test';

/**
 * Authentication helpers for Playwright tests
 */

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   */
  async login(email: string, password: string) {
    await this.page.goto('/login');
    
    await this.page.getByPlaceholder('Email address').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for either dashboard redirect or error message
    await Promise.race([
      this.page.waitForURL('/dashboard'),
      this.page.locator('.bg-red-50').waitFor({ timeout: 5000 })
    ]);
  }

  /**
   * Login and verify successful authentication
   * @param email - User email  
   * @param password - User password
   */
  async loginAndVerify(email: string, password: string) {
    await this.login(email, password);
    await expect(this.page).toHaveURL('/dashboard');
  }

  /**
   * Logout the current user
   */
  async logout() {
    // Navigate to dashboard first if not already there
    await this.page.goto('/dashboard');
    
    // Look for logout button (adjust selector based on your UI)
    await this.page.getByRole('button', { name: /logout|sign out/i }).click();
    
    // Verify redirect to login or home page
    await Promise.race([
      this.page.waitForURL('/login'),
      this.page.waitForURL('/')
    ]);
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.goto('/dashboard');
      await this.page.waitForURL('/dashboard', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a test user account
   * @param email - User email
   * @param password - User password
   */
  async signup(email: string, password: string) {
    await this.page.goto('/signup');
    
    await this.page.getByPlaceholder('Email address').fill(email);
    await this.page.getByPlaceholder('Password').fill(password);
    
    // If you have password confirmation field
    const confirmPasswordField = this.page.getByPlaceholder('Confirm password');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(password);
    }
    
    await this.page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Wait for success or error
    await Promise.race([
      this.page.waitForURL('/dashboard'),
      this.page.waitForURL('/login'),
      this.page.locator('.bg-red-50').waitFor({ timeout: 5000 })
    ]);
  }
}

/**
 * Test user credentials for different test scenarios
 */
export const TEST_USERS = {
  valid: {
    email: 'test@example.com',
    password: 'testpassword123'
  },
  invalid: {
    email: 'invalid@example.com', 
    password: 'wrongpassword'
  },
  new: {
    email: `test+${Date.now()}@example.com`,
    password: 'newuserpassword123'
  }
};

/**
 * Wait for network requests to complete
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Take a screenshot for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `tests/screenshots/debug-${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Clear all cookies and local storage
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}