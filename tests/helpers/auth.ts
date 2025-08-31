import { Page, expect } from '@playwright/test';

/**
 * Enhanced Authentication helpers for Playwright tests
 */

export class AuthHelper {
  private readonly defaultTimeout = 15000;
  
  constructor(private page: Page) {}

  /**
   * Login with email and password with better error handling
   * @param email - User email
   * @param password - User password
   */
  async login(email: string, password: string) {
    try {
      await this.page.goto('/login', { waitUntil: 'networkidle' });
      
      // Wait for login form to be visible
      await this.page.waitForSelector('input[placeholder*="Email"], input[type="email"]', { timeout: this.defaultTimeout });
      
      await this.page.getByPlaceholder('Email address').fill(email);
      await this.page.getByPlaceholder('Password').fill(password);
      
      // Click sign in and wait for network response
      const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/auth/') && response.request().method() === 'POST',
        { timeout: this.defaultTimeout }
      );
      
      await this.page.getByRole('button', { name: 'Sign in' }).click();
      
      try {
        await responsePromise;
      } catch (error) {
        console.warn('Auth response timeout, continuing with URL check');
      }
      
      // Wait for either dashboard redirect or error message
      await Promise.race([
        this.page.waitForURL('/dashboard', { timeout: this.defaultTimeout }),
        this.page.locator('[data-testid="error-message"], .error, .bg-red-50').waitFor({ timeout: 5000 })
      ]);
    } catch (error) {
      console.error(`Login failed for ${email}:`, error);
      throw error;
    }
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
   * Create a test user account with enhanced error handling
   * @param email - User email
   * @param password - User password
   */
  async signup(email: string, password: string) {
    try {
      await this.page.goto('/signup', { waitUntil: 'networkidle' });
      
      // Wait for signup form to be visible
      await this.page.waitForSelector('input[placeholder*="Email"], input[type="email"]', { timeout: this.defaultTimeout });
      
      await this.page.getByPlaceholder('Email address').fill(email);
      await this.page.getByPlaceholder('Password').fill(password);
      
      // If you have password confirmation field
      const confirmPasswordField = this.page.getByPlaceholder('Confirm password');
      if (await confirmPasswordField.isVisible()) {
        await confirmPasswordField.fill(password);
      }
      
      // Click sign up and wait for network response
      const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/auth/') && response.request().method() === 'POST',
        { timeout: this.defaultTimeout }
      );
      
      await this.page.getByRole('button', { name: /sign up|create account/i }).click();
      
      try {
        await responsePromise;
      } catch (error) {
        console.warn('Signup response timeout, continuing with URL check');
      }
      
      // Wait for success or error with extended timeout
      await Promise.race([
        this.page.waitForURL('/dashboard', { timeout: this.defaultTimeout }),
        this.page.waitForURL('/login', { timeout: this.defaultTimeout }),
        this.page.locator('[data-testid="error-message"], .error, .bg-red-50').waitFor({ timeout: 5000 })
      ]);
    } catch (error) {
      console.error(`Signup failed for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Mock authentication for testing without real Supabase
   */
  async mockAuth(email: string = 'test@example.com') {
    await this.page.addInitScript((userEmail) => {
      // Mock localStorage auth state
      localStorage.setItem('sb-test-auth-token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: {
          id: 'mock-user-id',
          email: userEmail,
          created_at: new Date().toISOString()
        }
      }));
      
      // Mock any global auth state
      (window as any).__mockAuth = {
        user: {
          id: 'mock-user-id', 
          email: userEmail
        },
        authenticated: true
      };
    }, email);
    
    // Navigate to dashboard which should now pass auth checks
    await this.page.goto('/dashboard');
  }

  /**
   * Clear all authentication state
   */
  async clearAuth() {
    await this.page.evaluate(() => {
      // Clear all auth-related storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear mock auth
      delete (window as any).__mockAuth;
    });
    
    await this.page.context().clearCookies();
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