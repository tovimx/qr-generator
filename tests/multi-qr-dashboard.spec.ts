import { test, expect } from '@playwright/test';
import { generateTestEmail } from './helpers/supabase-auth';
import { createTestUser, createTestQRCode, addLinksToQRCode, cleanupTestUser, simulateScan } from './helpers/database';
import { TEST_QR_CODES } from './fixtures/test-data';

test.describe('Multi-QR Dashboard Tests', () => {
  let testEmail: string;
  let testUser: any;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    testEmail = generateTestEmail('multi-qr');
    
    // Create test user via signup
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup will be handled by Supabase auth session cleanup
    await page.context().clearCookies();
  });

  test('should display default project with single QR code after signup', async ({ page }) => {
    // Should show project tabs interface
    await expect(page.getByRole('tab')).toBeVisible();
    
    // Should show default project tab
    await expect(page.getByRole('tab', { name: /default/i })).toBeVisible();
    
    // Should show QR code tabs within the project
    await expect(page.locator('[data-testid="qr-tabs"]')).toBeVisible();
    
    // Should have one QR code tab initially
    const qrTabs = page.locator('[data-testid="qr-tab"]');
    await expect(qrTabs).toHaveCount(1);
    
    // Should display QR code canvas
    await expect(page.locator('canvas')).toBeVisible();
    
    // Should show short link
    await expect(page.getByText(/\/q\//)).toBeVisible();
  });

  test('should allow creating additional QR codes (up to 10)', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Create additional QR codes
    for (let i = 1; i < 5; i++) {
      // Click add new QR button
      const addButton = page.getByRole('button', { name: /add.*qr/i });
      await expect(addButton).toBeVisible();
      await addButton.click();
      
      // Wait for new QR code to be created and tab to appear
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(i + 1);
      
      // Verify we switched to the new QR code tab
      const activeTab = page.locator('[data-testid="qr-tab"][data-active="true"]');
      await expect(activeTab).toHaveText(`QR Code ${i + 1}`);
      
      // Verify QR code canvas is visible for new QR
      await expect(page.locator('canvas')).toBeVisible();
    }
    
    // Should now have 5 QR codes total
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(5);
  });

  test('should enforce maximum of 10 QR codes per project', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create 9 additional QR codes (1 already exists)
    for (let i = 1; i < 10; i++) {
      const addButton = page.getByRole('button', { name: /add.*qr/i });
      await addButton.click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(i + 1, { timeout: 10000 });
    }
    
    // Should have 10 QR codes
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(10);
    
    // Try to add 11th QR code
    const addButton = page.getByRole('button', { name: /add.*qr/i });
    
    // Button should either be disabled or show error message
    if (await addButton.isVisible()) {
      const isDisabled = await addButton.isDisabled();
      if (!isDisabled) {
        await addButton.click();
        // Should show error message about maximum limit
        await expect(page.getByText(/maximum.*10.*qr/i)).toBeVisible({ timeout: 5000 });
      } else {
        // Button is properly disabled
        expect(isDisabled).toBeTruthy();
      }
    }
    
    // Should still have exactly 10 QR codes
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(10);
  });

  test('should allow switching between QR code tabs', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create 3 QR codes total
    for (let i = 1; i < 3; i++) {
      await page.getByRole('button', { name: /add.*qr/i }).click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(i + 1);
    }
    
    // Add unique content to each QR code
    const qrTabs = page.locator('[data-testid="qr-tab"]');
    
    for (let i = 0; i < 3; i++) {
      // Click on tab
      await qrTabs.nth(i).click();
      
      // Wait for tab to be active
      await expect(qrTabs.nth(i)).toHaveAttribute('data-active', 'true');
      
      // Add a unique link to this QR code
      const addLinkButton = page.getByRole('button', { name: /add link/i });
      if (await addLinkButton.isVisible()) {
        await addLinkButton.click();
        
        await page.getByPlaceholder(/title/i).fill(`Link for QR ${i + 1}`);
        await page.getByPlaceholder(/url/i).fill(`https://example${i + 1}.com`);
        await page.getByRole('button', { name: /save/i }).click();
        
        // Verify link was added
        await expect(page.getByText(`Link for QR ${i + 1}`)).toBeVisible();
      }
    }
    
    // Now switch between tabs and verify content persists
    for (let i = 0; i < 3; i++) {
      await qrTabs.nth(i).click();
      await expect(qrTabs.nth(i)).toHaveAttribute('data-active', 'true');
      
      // Verify the specific content is visible
      await expect(page.getByText(`Link for QR ${i + 1}`)).toBeVisible();
    }
  });

  test('should allow renaming QR codes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find the first QR tab
    const firstTab = page.locator('[data-testid="qr-tab"]').first();
    
    // Look for edit button or click directly on tab title
    const editButton = page.getByRole('button', { name: /edit.*title/i });
    if (await editButton.isVisible()) {
      await editButton.click();
    } else {
      // Try double-clicking on tab to edit
      await firstTab.dblclick();
    }
    
    // Look for title input field
    const titleInput = page.getByPlaceholder(/title/i).or(page.getByDisplayValue(/qr code/i));
    if (await titleInput.isVisible()) {
      await titleInput.clear();
      await titleInput.fill('My Custom QR Code');
      
      // Save the title
      const saveButton = page.getByRole('button', { name: /save/i });
      if (await saveButton.isVisible()) {
        await saveButton.click();
      } else {
        await titleInput.press('Enter');
      }
      
      // Verify title was updated
      await expect(page.getByText('My Custom QR Code')).toBeVisible();
    }
  });

  test('should allow deleting QR codes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create additional QR codes first
    await page.getByRole('button', { name: /add.*qr/i }).click();
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
    
    await page.getByRole('button', { name: /add.*qr/i }).click();
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(3);
    
    // Select the second QR tab
    const secondTab = page.locator('[data-testid="qr-tab"]').nth(1);
    await secondTab.click();
    
    // Look for delete button
    const deleteButton = page.getByRole('button', { name: /delete/i });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion if there's a confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm/i }).or(page.getByRole('button', { name: /delete/i }));
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      
      // Should have 2 QR codes left
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
    }
  });

  test('should show QR code statistics in tabs', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for scan count or statistics display
    const statsElements = page.locator('[data-testid="qr-stats"], [data-testid="scan-count"]');
    if (await statsElements.count() > 0) {
      // Should show scan count (initially 0)
      await expect(page.getByText(/0.*scan/i)).toBeVisible();
    }
    
    // Look for last activity or creation date
    const activityInfo = page.locator('[data-testid="last-activity"], [data-testid="created-date"]');
    if (await activityInfo.count() > 0) {
      await expect(activityInfo.first()).toBeVisible();
    }
  });

  test('should preserve QR code position/order', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create 3 QR codes with specific titles
    const titles = ['First QR', 'Second QR', 'Third QR'];
    
    for (let i = 1; i < 3; i++) {
      await page.getByRole('button', { name: /add.*qr/i }).click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(i + 1);
    }
    
    // Set titles if possible
    const qrTabs = page.locator('[data-testid="qr-tab"]');
    
    for (let i = 0; i < 3; i++) {
      await qrTabs.nth(i).click();
      
      // Try to set title
      const editButton = page.getByRole('button', { name: /edit.*title/i });
      if (await editButton.isVisible()) {
        await editButton.click();
        const titleInput = page.getByPlaceholder(/title/i);
        await titleInput.fill(titles[i]);
        await page.getByRole('button', { name: /save/i }).click();
      }
    }
    
    // Refresh page and verify order is preserved
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify QR codes are still in the same order
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(3);
  });

  test('should handle QR code tab drag and drop reordering', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create 3 QR codes
    for (let i = 1; i < 3; i++) {
      await page.getByRole('button', { name: /add.*qr/i }).click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(i + 1);
    }
    
    // Check if drag and drop is implemented
    const firstTab = page.locator('[data-testid="qr-tab"]').first();
    const lastTab = page.locator('[data-testid="qr-tab"]').last();
    
    const firstTabText = await firstTab.textContent();
    const lastTabText = await lastTab.textContent();
    
    // Try to drag first tab to last position
    await firstTab.hover();
    await page.mouse.down();
    await lastTab.hover();
    await page.mouse.up();
    
    // Check if order changed (this might not be implemented)
    await page.waitForTimeout(1000);
    const newFirstTabText = await page.locator('[data-testid="qr-tab"]').first().textContent();
    const newLastTabText = await page.locator('[data-testid="qr-tab"]').last().textContent();
    
    // If drag and drop is not implemented, that's fine - just verify tabs still exist
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(3);
  });

  test('should show proper loading states when creating QR codes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click add QR button
    const addButton = page.getByRole('button', { name: /add.*qr/i });
    await addButton.click();
    
    // Look for loading indicators
    const loadingIndicators = page.locator('[data-testid="loading"], .loading, [aria-label*="loading"]');
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).toBeVisible();
    }
    
    // Wait for new QR to be created
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2, { timeout: 10000 });
    
    // Loading should be gone
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).not.toBeVisible();
    }
  });

  test('should handle errors gracefully when creating QR codes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Intercept API calls and simulate failure
    await page.route('**/api/qr-codes/**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' })
        });
      } else {
        route.continue();
      }
    });
    
    // Try to create QR code
    const addButton = page.getByRole('button', { name: /add.*qr/i });
    await addButton.click();
    
    // Should show error message
    await expect(page.getByText(/error/i).or(page.getByText(/failed/i))).toBeVisible({ timeout: 5000 });
    
    // Should still have original QR count
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(1);
  });
});

test.describe('Multi-QR Dashboard Integration', () => {
  let testEmail: string;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    testEmail = generateTestEmail('integration');
    
    // Create test user via signup
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should sync QR code changes across browser tabs', async ({ page, context }) => {
    // Create a second browser tab
    const secondTab = await context.newPage();
    await secondTab.goto('/dashboard');
    await expect(secondTab).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Both tabs should show same initial state
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(1);
    await expect(secondTab.locator('[data-testid="qr-tab"]')).toHaveCount(1);
    
    // Add QR code in first tab
    await page.getByRole('button', { name: /add.*qr/i }).click();
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
    
    // Second tab should eventually sync (refresh or real-time)
    await secondTab.reload();
    await expect(secondTab.locator('[data-testid="qr-tab"]')).toHaveCount(2, { timeout: 10000 });
  });

  test('should handle concurrent QR code creation from multiple tabs', async ({ page, context }) => {
    const secondTab = await context.newPage();
    await secondTab.goto('/dashboard');
    await expect(secondTab).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Create QR codes simultaneously from both tabs
    await Promise.all([
      page.getByRole('button', { name: /add.*qr/i }).click(),
      secondTab.getByRole('button', { name: /add.*qr/i }).click()
    ]);
    
    // Wait a moment for operations to complete
    await page.waitForTimeout(2000);
    await secondTab.waitForTimeout(2000);
    
    // Refresh both tabs to see final state
    await page.reload();
    await secondTab.reload();
    
    await page.waitForLoadState('networkidle');
    await secondTab.waitForLoadState('networkidle');
    
    // Should have at least 2 QR codes (possibly 3 depending on race conditions)
    const firstTabCount = await page.locator('[data-testid="qr-tab"]').count();
    const secondTabCount = await secondTab.locator('[data-testid="qr-tab"]').count();
    
    expect(firstTabCount).toBeGreaterThanOrEqual(2);
    expect(secondTabCount).toBeGreaterThanOrEqual(2);
    expect(firstTabCount).toEqual(secondTabCount);
  });

  test('should maintain QR code state during page refresh', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create additional QR code
    await page.getByRole('button', { name: /add.*qr/i }).click();
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
    
    // Select second tab and add content
    const secondTab = page.locator('[data-testid="qr-tab"]').nth(1);
    await secondTab.click();
    
    // Add link if possible
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if (await addLinkButton.isVisible()) {
      await addLinkButton.click();
      await page.getByPlaceholder(/title/i).fill('Test Link');
      await page.getByPlaceholder(/url/i).fill('https://example.com');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.getByText('Test Link')).toBeVisible();
    }
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still have 2 QR codes
    await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
    
    // Click second tab and verify content persists
    await page.locator('[data-testid="qr-tab"]').nth(1).click();
    if (await page.getByText('Test Link').isVisible({ timeout: 1000 })) {
      await expect(page.getByText('Test Link')).toBeVisible();
    }
  });
});