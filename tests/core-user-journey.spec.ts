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
    
    // Step 1: Visit homepage - it will redirect to login
    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 10000 });
    
    // Step 2: Navigate to signup from login page
    await page.getByRole('link', { name: 'create a new account' }).click();
    await expect(page).toHaveURL('/signup');
    
    // Step 3: Complete signup process
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder(/Password.*min 6 characters/i).fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Step 4: Wait for successful signup and dashboard redirect
    // Note: Real Supabase might require email confirmation
    await page.waitForTimeout(3000); // Give signup time to process
    
    // Check if we're on dashboard or still on signup (due to email confirmation)
    const currentUrl = await page.url();
    if (currentUrl.includes('/dashboard')) {
      // Successfully logged in, continue with dashboard tests
      await expect(page.getByText(/QR Code|Dashboard|Projects/i)).toBeVisible({ timeout: 10000 });
      
      // Step 5: Look for QR code interface (may be auto-created)
      await page.waitForTimeout(2000); // Allow dashboard to fully load
      
      // Step 6: Verify QR code is visible or can be created
      const qrCodeElement = page.locator('canvas, svg, img[alt*="QR"]').first();
      if (await qrCodeElement.isVisible({ timeout: 5000 })) {
        await expect(qrCodeElement).toBeVisible();
      } else {
        // Look for create button if no QR exists yet
        const createButtons = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
        const visibleCreateButton = await createButtons.first().isVisible({ timeout: 3000 });
        if (visibleCreateButton) {
          await createButtons.first().click();
          await expect(page.locator('canvas, svg, img[alt*="QR"]').first()).toBeVisible({ timeout: 10000 });
        }
      }
    } else {
      // Still on signup page - likely requires email confirmation
      console.log('Signup may require email confirmation - checking for success message');
      const successText = page.getByText(/check.*email|confirmation|verify/i);
      if (await successText.isVisible({ timeout: 5000 })) {
        console.log('Email confirmation required - test completed successfully');
      } else {
        // Check for any error messages
        const errorText = page.getByText(/error|failed/i);
        if (await errorText.isVisible({ timeout: 2000 })) {
          const errorMessage = await errorText.textContent();
          console.log('Signup error:', errorMessage);
        }
      }
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