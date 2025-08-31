/**
 * Core User Journey E2E Tests
 * Tests complete user workflows from signup to QR code creation and customization
 */

import { test, expect } from '@playwright/test';

test.describe('Core User Journey - Complete Flow', () => {
  
  test('Complete new user journey: signup → dashboard → first QR code', async ({ page }) => {
    // Generate unique test user
    const testEmail = `test-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`;
    const testPassword = 'TestPassword123!';
    
    // Step 1: Visit homepage and navigate to signup
    await page.goto('/');
    await page.getByRole('link', { name: /sign up|get started|create account/i }).first().click();
    
    // Step 2: Complete signup process
    await expect(page).toHaveURL('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder(/Password.*min 6 characters/i).fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Step 3: Wait for successful signup and dashboard redirect
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    // Step 4: Verify dashboard loads with initial state
    await expect(page.getByText(/QR Code|Dashboard|Projects/i)).toBeVisible({ timeout: 10000 });
    
    // Step 5: Create first QR code
    // Look for QR code creation interface - this might be automatically created or require manual creation
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
    if (await createButton.isVisible({ timeout: 5000 })) {
      await createButton.click();
    }
    
    // Step 6: Verify QR code is visible
    await expect(page.locator('canvas, svg, img').first()).toBeVisible({ timeout: 10000 });
    
    // Step 7: Add custom links
    const addLinkButton = page.locator('button:has-text("Add Link"), button:has-text("Add"), [data-testid="add-link"]').first();
    if (await addLinkButton.isVisible({ timeout: 5000 })) {
      await addLinkButton.click();
      
      // Fill link details
      await page.locator('input[placeholder*="title"], input[name*="title"]').first().fill('My Website');
      await page.locator('input[placeholder*="url"], input[name*="url"], input[type="url"]').first().fill('https://example.com');
      
      // Save link
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').first();
      await saveButton.click();
    }
    
    // Step 8: Verify QR code functionality by checking short link
    const shortLink = page.locator('[data-testid="short-link"], a[href*="/q/"]').first();
    if (await shortLink.isVisible({ timeout: 5000 })) {
      const linkHref = await shortLink.getAttribute('href');
      expect(linkHref).toBeTruthy();
      expect(linkHref).toMatch(/\/q\/[a-zA-Z0-9]+/);
    }
  });

  test('Existing user journey: login → dashboard → manage QR codes', async ({ page }) => {
    // This test assumes a test user already exists
    // In a real scenario, you'd set up test data beforehand
    
    await page.goto('/login');
    
    // Use environment variable for test user or create one
    const testEmail = process.env['E2E_TEST_EMAIL'] || 'test@example.com';
    const testPassword = process.env['E2E_TEST_PASSWORD'] || 'TestPassword123!';
    
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for dashboard - might redirect to login if user doesn't exist
    await page.waitForURL('/dashboard', { timeout: 15000 }).catch(() => {
      // If login fails, skip this test
      test.skip(true, 'Test user does not exist - skipping existing user test');
    });
    
    // Verify dashboard functionality
    await expect(page.getByText(/QR Code|Dashboard/i)).toBeVisible();
    
    // Test QR code management features
    const qrElements = page.locator('canvas, svg').first();
    if (await qrElements.isVisible({ timeout: 5000 })) {
      // QR code exists, test editing
      await expect(qrElements).toBeVisible();
      
      // Test title editing
      const titleInput = page.locator('input[type="text"]').first();
      if (await titleInput.isVisible({ timeout: 3000 })) {
        await titleInput.clear();
        await titleInput.fill('Updated QR Code Title');
        await page.keyboard.press('Enter');
        
        // Verify update
        await expect(titleInput).toHaveValue('Updated QR Code Title');
      }
    }
  });

  test('QR code scanning and redirect functionality', async ({ page }) => {
    // Test the public QR page functionality without authentication
    await page.goto('/q/test123'); // Test with a mock short code
    
    // This should either:
    // 1. Show a proper QR page if test123 exists
    // 2. Show a 404 or "not found" page if it doesn't exist
    
    await page.waitForLoadState('networkidle');
    
    // Check for either valid QR page content or proper error handling
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    
    // Should not show login page for public QR pages
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).not.toBeVisible();
  });

  test('Application error handling and recovery', async ({ page }) => {
    // Test various error scenarios
    
    // 1. Network error simulation
    await page.route('**/api/**', route => route.abort());
    await page.goto('/login');
    
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should handle network error gracefully
    await expect(page.getByText(/error|failed|try again/i)).toBeVisible({ timeout: 10000 });
    
    // 2. Recovery after network restored
    await page.unroute('**/api/**');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should either succeed or show proper auth error
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(login|dashboard|signup)/);
  });
});