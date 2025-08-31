/**
 * Enhanced Test Utilities and Helpers
 * Provides robust utilities for E2E testing
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded and interactive
 */
export async function waitForPageReady(page: Page, timeout = 30000) {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForFunction(() => document.readyState === 'complete', { timeout });
  
  // Wait for any React hydration to complete
  await page.waitForFunction(() => {
    const body = document.body;
    return !body.textContent?.includes('Loading...') && 
           !body.textContent?.includes('Signing in...') && 
           !body.textContent?.includes('Creating account...');
  }, { timeout: 5000 }).catch(() => {
    // Continue if this check fails - might not be applicable to all pages
  });
}

/**
 * Enhanced form filling with validation
 */
export class FormHelper {
  constructor(private page: Page) {}

  async fillAndValidateField(selector: string, value: string, expectedValue?: string) {
    const field = this.page.locator(selector);
    await field.fill(value);
    await expect(field).toHaveValue(expectedValue || value);
    return field;
  }

  async submitForm(submitSelector: string, expectedLoadingText?: string) {
    const submitButton = this.page.locator(submitSelector);
    await submitButton.click();
    
    if (expectedLoadingText) {
      await expect(this.page.getByText(expectedLoadingText)).toBeVisible({ timeout: 2000 })
        .catch(() => {
          // Loading state might be too fast to catch - this is OK
        });
    }
    
    return submitButton;
  }

  async waitForFormCompletion(timeout = 10000) {
    await this.page.waitForFunction(() => 
      !document.body.textContent?.includes('Signing in...') && 
      !document.body.textContent?.includes('Creating account...') &&
      !document.body.textContent?.includes('Loading...'),
      { timeout }
    );
  }
}

/**
 * Authentication helper with better error handling
 */
export class AuthHelper {
  private formHelper: FormHelper;

  constructor(private page: Page) {
    this.formHelper = new FormHelper(page);
  }

  async clearAuthState() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Clear any Supabase auth state
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    });
  }

  async navigateToLogin() {
    await this.page.goto('/login');
    await waitForPageReady(this.page);
    await expect(this.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  }

  async navigateToSignup() {
    await this.page.goto('/signup');
    await waitForPageReady(this.page);
    await expect(this.page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  }

  async fillLoginForm(email: string, password: string) {
    await this.formHelper.fillAndValidateField('input[placeholder="Email address"]', email);
    await this.formHelper.fillAndValidateField('input[placeholder="Password"]', password);
  }

  async fillSignupForm(email: string, password: string) {
    await this.formHelper.fillAndValidateField('input[placeholder="Email address"]', email);
    await this.formHelper.fillAndValidateField('input[placeholder*="Password"]', password);
  }

  async submitLogin() {
    await this.formHelper.submitForm('button[type="submit"]', 'Signing in...');
    await this.formHelper.waitForFormCompletion();
  }

  async submitSignup() {
    await this.formHelper.submitForm('button[type="submit"]', 'Creating account...');
    await this.formHelper.waitForFormCompletion();
  }

  async attemptLogin(email: string, password: string) {
    await this.navigateToLogin();
    await this.fillLoginForm(email, password);
    await this.submitLogin();
  }

  async attemptSignup(email: string, password: string) {
    await this.navigateToSignup();
    await this.fillSignupForm(email, password);
    await this.submitSignup();
  }

  async isOnDashboard() {
    const currentUrl = this.page.url();
    return currentUrl.includes('/dashboard');
  }

  async isOnLoginPage() {
    const currentUrl = this.page.url();
    return currentUrl.includes('/login');
  }

  async hasAuthError() {
    const errorElements = this.page.locator('.bg-red-50, .text-red-800, [data-testid="error"]');
    return await errorElements.count() > 0;
  }
}

/**
 * Test data generator for unique values
 */
export class TestDataGenerator {
  static generateUniqueEmail(prefix = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}@example.com`;
  }

  static generatePassword(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static generateQRCodeData() {
    const timestamp = Date.now();
    return {
      title: `Test QR Code ${timestamp}`,
      links: [
        {
          title: `Website ${timestamp}`,
          url: `https://test-${timestamp}.com`
        },
        {
          title: `Contact ${timestamp}`,
          url: `mailto:test-${timestamp}@example.com`
        }
      ]
    };
  }
}

/**
 * Screenshot and debug helper
 */
export class DebugHelper {
  constructor(private page: Page) {}

  async takeScreenshot(name: string, fullPage = true) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `debug-${name}-${timestamp}.png`;
    const path = `test-results/screenshots/${filename}`;
    
    await this.page.screenshot({ 
      path, 
      fullPage,
      animations: 'disabled' // Reduce flakiness
    });
    
    console.log(`Screenshot saved: ${path}`);
    return path;
  }

  async logPageState() {
    const url = this.page.url();
    const title = await this.page.title();
    const errors = await this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).testErrors || [];
    });
    
    console.log('Page State:', { url, title, errors });
  }

  async captureConsoleErrors() {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    this.page.on('pageerror', err => {
      errors.push(err.message);
    });
    
    return errors;
  }
}

/**
 * Network helper for API testing
 */
export class NetworkHelper {
  constructor(private page: Page) {}

  async interceptAuthRequests() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requests: any[] = [];
    
    await this.page.route('**/auth/**', route => {
      requests.push({
        url: route.request().url(),
        method: route.request().method(),
        headers: route.request().headers(),
        timestamp: Date.now()
      });
      route.continue();
    });
    
    return requests;
  }

  async simulateNetworkFailure() {
    await this.page.route('**/auth/**', route => route.abort());
  }

  async simulateSlowNetwork(delayMs = 2000) {
    await this.page.route('**/auth/**', async route => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      route.continue();
    });
  }

  async waitForApiCall(urlPattern: string, timeout = 10000) {
    return this.page.waitForResponse(
      response => response.url().includes(urlPattern),
      { timeout }
    );
  }
}

/**
 * Accessibility testing helper
 */
export class AccessibilityHelper {
  constructor(private page: Page) {}

  async checkFormAccessibility() {
    // Check for proper labels
    const inputs = this.page.locator('input');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      
      if (id) {
        const label = this.page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        if (!hasLabel && !ariaLabel && !placeholder) {
          throw new Error(`Input with id "${id}" has no accessible label`);
        }
      }
    }
  }

  async checkKeyboardNavigation() {
    const focusableElements = this.page.locator(
      'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    const count = await focusableElements.count();
    
    if (count > 0) {
      // Focus first element
      await focusableElements.first().focus();
      await expect(focusableElements.first()).toBeFocused();
      
      // Tab through elements
      for (let i = 1; i < count; i++) {
        await this.page.keyboard.press('Tab');
        await expect(focusableElements.nth(i)).toBeFocused();
      }
    }
  }

  async checkColorContrast() {
    // Basic check for common color issues
    const result = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const issues: string[] = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const color = style.color;
        
        // Very basic check - in reality you'd use a proper contrast checker
        if (bg === 'white' && color === 'white') {
          issues.push(`Element has white text on white background: ${el.tagName}`);
        }
        if (bg === 'black' && color === 'black') {
          issues.push(`Element has black text on black background: ${el.tagName}`);
        }
      });
      
      return issues;
    });
    
    return result;
  }
}

/**
 * Performance testing helper
 */
export class PerformanceHelper {
  constructor(private page: Page) {}

  async measurePageLoad() {
    const startTime = Date.now();
    
    await this.page.goto('/', { waitUntil: 'networkidle' });
    
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    const totalTime = Date.now() - startTime;
    
    return {
      ...metrics,
      totalTime
    };
  }

  async measureFormSubmission() {
    const startTime = performance.now();
    
    // This would be called before form submission
    return {
      start: () => performance.now(),
      end: () => performance.now() - startTime
    };
  }
}

/**
 * Mock data helper
 */
export class MockHelper {
  constructor(private page: Page) {}

  async mockSuccessfulAuth() {
    await this.page.route('**/auth/v1/token**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            id: 'mock-user-id',
            email: 'test@example.com'
          }
        })
      });
    });
  }

  async mockFailedAuth() {
    await this.page.route('**/auth/v1/token**', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_credentials',
          error_description: 'Invalid login credentials'
        })
      });
    });
  }
}