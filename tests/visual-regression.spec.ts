/**
 * Visual Regression Testing for QR Generator App
 * Tests visual consistency of QR codes and critical UI components
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { MockAuthHelper } from './helpers/mock-auth';
import { generateTestEmail } from './helpers/supabase-auth';

test.describe('Visual Regression Tests', () => {
  let authHelper: AuthHelper;
  let mockAuth: MockAuthHelper;
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    mockAuth = new MockAuthHelper(page);
    testEmail = generateTestEmail('visual');
  });

  test.describe('QR Code Visual Consistency', () => {
    test('QR code generation produces consistent output', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Wait for QR code to generate
      await expect(page.locator('canvas')).toBeVisible();
      await page.waitForTimeout(1000); // Allow QR code to fully render
      
      // Take screenshot of just the QR code area
      await expect(page.locator('canvas')).toHaveScreenshot('qr-code-default.png');
    });

    test('QR code updates visually when title changes', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Change title
      const titleInput = page.getByRole('textbox', { name: /title/i });
      await titleInput.fill('Visual Test QR');
      await page.keyboard.press('Enter');
      
      // Wait for QR code to update
      await page.waitForTimeout(1000);
      
      await expect(page.locator('canvas')).toHaveScreenshot('qr-code-custom-title.png');
    });

    test('QR code displays correctly with maximum links', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Add multiple links to test QR code with complex data
      for (let i = 1; i <= 5; i++) {
        await page.getByRole('button', { name: /add link/i }).click();
        await page.getByPlaceholder(/title/i).fill(`Link ${i}`);
        await page.getByPlaceholder(/url/i).fill(`https://example${i}.com`);
        await page.getByRole('button', { name: /save/i }).click();
        await page.waitForTimeout(200);
      }
      
      // Wait for QR code to update with all links
      await page.waitForTimeout(1000);
      
      await expect(page.locator('canvas')).toHaveScreenshot('qr-code-max-links.png');
    });

    test('QR code page visual consistency', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Get the short link
      const shortLinkElement = page.locator('[data-testid="short-link"], .short-link, .qr-link').first();
      await shortLinkElement.waitFor({ state: 'visible' });
      
      const shortLinkText = await shortLinkElement.textContent();
      const shortCode = shortLinkText?.match(/\/q\/([a-zA-Z0-9]+)/)?.[1];
      
      if (shortCode) {
        // Visit the QR page directly
        await page.goto(`/q/${shortCode}`);
        
        // Take screenshot of the QR landing page
        await expect(page.locator('main')).toHaveScreenshot('qr-landing-page.png');
      }
    });
  });

  test.describe('UI Component Visual Consistency', () => {
    test('Login page visual consistency', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('main')).toHaveScreenshot('login-page.png');
    });

    test('Signup page visual consistency', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.locator('main')).toHaveScreenshot('signup-page.png');
    });

    test('Dashboard layout visual consistency', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Wait for page to fully load
      await expect(page.locator('canvas')).toBeVisible();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('main')).toHaveScreenshot('dashboard-layout.png');
    });

    test('Empty dashboard state', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Clear any existing links to show empty state
      const deleteButtons = page.locator('button:has-text("Delete"), button[aria-label*="delete"]');
      const count = await deleteButtons.count();
      
      for (let i = 0; i < count; i++) {
        await deleteButtons.first().click();
        await page.waitForTimeout(200);
      }
      
      await expect(page.locator('main')).toHaveScreenshot('dashboard-empty-state.png');
    });
  });

  test.describe('Responsive Design Visual Tests', () => {
    test('Mobile dashboard layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      await expect(page.locator('canvas')).toBeVisible();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('main')).toHaveScreenshot('dashboard-mobile.png');
    });

    test('Tablet dashboard layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
      
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      await expect(page.locator('canvas')).toBeVisible();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('main')).toHaveScreenshot('dashboard-tablet.png');
    });

    test('QR page mobile responsiveness', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Add a few links first
      await page.getByRole('button', { name: /add link/i }).click();
      await page.getByPlaceholder(/title/i).fill('Mobile Test Link');
      await page.getByPlaceholder(/url/i).fill('https://mobile.example.com');
      await page.getByRole('button', { name: /save/i }).click();
      
      // Get short code and visit QR page
      const shortLinkElement = page.locator('[data-testid="short-link"], .short-link, .qr-link').first();
      const shortLinkText = await shortLinkElement.textContent();
      const shortCode = shortLinkText?.match(/\/q\/([a-zA-Z0-9]+)/)?.[1];
      
      if (shortCode) {
        await page.goto(`/q/${shortCode}`);
        await expect(page.locator('main')).toHaveScreenshot('qr-page-mobile.png');
      }
    });
  });

  test.describe('Error State Visual Tests', () => {
    test('Login error state visual consistency', async ({ page }) => {
      await page.goto('/login');
      
      // Trigger error by submitting invalid credentials
      await page.getByPlaceholder('Email address').fill('invalid@example.com');
      await page.getByPlaceholder('Password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Wait for error message to appear
      await expect(page.locator('.bg-red-50, .error-message, [role="alert"]')).toBeVisible();
      
      await expect(page.locator('main')).toHaveScreenshot('login-error-state.png');
    });

    test('Form validation error states', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Try to add invalid link
      await page.getByRole('button', { name: /add link/i }).click();
      await page.getByPlaceholder(/title/i).fill('');
      await page.getByPlaceholder(/url/i).fill('invalid-url');
      await page.getByRole('button', { name: /save/i }).click();
      
      // Wait for validation errors
      await page.waitForTimeout(500);
      
      await expect(page.locator('form, .form-container, .modal')).toHaveScreenshot('form-validation-errors.png');
    });
  });

  test.describe('Loading State Visual Tests', () => {
    test('Dashboard loading state', async ({ page }) => {
      await mockAuth.mockAuthentication();
      
      // Intercept requests to slow them down
      await page.route('**/api/**', async (route) => {
        await page.waitForTimeout(1000);
        await route.continue();
      });
      
      await page.goto('/dashboard');
      
      // Capture loading state
      await expect(page.locator('main')).toHaveScreenshot('dashboard-loading.png');
      
      // Clean up route interception
      await page.unroute('**/api/**');
    });
  });

  test.describe('Theme and Style Consistency', () => {
    test('Color scheme consistency across pages', async ({ page }) => {
      const pages = ['/login', '/signup'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        // Check for consistent color usage
        const primaryButtons = page.locator('button[class*="bg-blue"], button[class*="primary"]');
        if (await primaryButtons.count() > 0) {
          await expect(primaryButtons.first()).toHaveScreenshot(`${pagePath.slice(1)}-primary-button.png`);
        }
      }
    });

    test('Typography consistency', async ({ page }) => {
      await page.goto('/dashboard');
      await mockAuth.mockAuthentication();
      
      // Check heading styles
      const headings = page.locator('h1, h2, h3');
      if (await headings.count() > 0) {
        await expect(headings.first()).toHaveScreenshot('typography-heading.png');
      }
    });
  });
});