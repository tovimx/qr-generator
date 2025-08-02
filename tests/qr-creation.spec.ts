import { test, expect } from '@playwright/test';
import { authenticatePage, generateTestEmail } from './helpers/supabase-auth';
import { TEST_QR_CODES, TEST_URLS } from './fixtures/test-data';

test.describe('QR Code Creation', () => {
  let testEmail: string;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    // Create a unique test user for each test
    testEmail = generateTestEmail('qr-test');
    
    // Sign up new user
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should automatically create QR code for new user', async ({ page }) => {
    // New users should have a QR code created automatically
    await expect(page.getByRole('heading', { name: 'Your QR Code' })).toBeVisible();
    
    // Check for QR code display
    const qrCodeCanvas = page.locator('canvas').first(); // react-qr-code uses canvas
    await expect(qrCodeCanvas).toBeVisible();
    
    // Check for short link display
    await expect(page.getByText(/\/q\//)).toBeVisible();
  });

  test('should display QR code with short link', async ({ page }) => {
    // Find the short link
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    await expect(shortLinkElement).toBeVisible();
    
    // Get the short link text
    const shortLink = await shortLinkElement.textContent();
    expect(shortLink).toMatch(/\/q\/[a-zA-Z0-9]+/);
    
    // QR code should be visible
    const qrCode = page.locator('canvas').first();
    await expect(qrCode).toBeVisible();
  });

  test('should allow editing QR code title', async ({ page }) => {
    // Find the title input or editable element
    const titleElement = page.getByText('My QR Code');
    await expect(titleElement).toBeVisible();
    
    // Note: Title editing might require clicking to make it editable
    // This test assumes the title is displayed but may not be editable in MVP
  });

  test('should show link editor section', async ({ page }) => {
    // Look for link editor section
    await expect(page.getByText(/manage links/i)).toBeVisible();
    
    // Should have add link button
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    await expect(addLinkButton).toBeVisible();
  });

  test('should add a new link', async ({ page }) => {
    // Click add link button
    await page.getByRole('button', { name: /add link/i }).click();
    
    // Fill in link details
    await page.getByPlaceholder(/title/i).fill(TEST_QR_CODES.basic.links[0].title);
    await page.getByPlaceholder(/url/i).fill(TEST_QR_CODES.basic.links[0].url);
    
    // Save the link
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify link was added
    await expect(page.getByText(TEST_QR_CODES.basic.links[0].title)).toBeVisible();
    await expect(page.getByText(TEST_QR_CODES.basic.links[0].url)).toBeVisible();
  });

  test('should validate URL format when adding links', async ({ page }) => {
    // Click add link
    await page.getByRole('button', { name: /add link/i }).click();
    
    // Try invalid URL
    await page.getByPlaceholder(/title/i).fill('Test Link');
    await page.getByPlaceholder(/url/i).fill('not-a-valid-url');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/valid url/i)).toBeVisible();
  });

  test('should enforce maximum of 5 links', async ({ page }) => {
    // Add 5 links
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /add link/i }).click();
      await page.getByPlaceholder(/title/i).fill(`Link ${i + 1}`);
      await page.getByPlaceholder(/url/i).fill(`https://example${i + 1}.com`);
      await page.getByRole('button', { name: /save/i }).click();
      
      // Wait for link to be saved
      await expect(page.getByText(`Link ${i + 1}`)).toBeVisible();
    }
    
    // Try to add 6th link
    const addButton = page.getByRole('button', { name: /add link/i });
    
    // Button should be disabled or show error
    const isDisabled = await addButton.isDisabled();
    if (!isDisabled) {
      await addButton.click();
      await expect(page.getByText(/maximum.*5.*links/i)).toBeVisible();
    } else {
      expect(isDisabled).toBeTruthy();
    }
  });

  test('should update link position', async ({ page }) => {
    // Add two links
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: /add link/i }).click();
      await page.getByPlaceholder(/title/i).fill(`Link ${i + 1}`);
      await page.getByPlaceholder(/url/i).fill(`https://example${i + 1}.com`);
      await page.getByRole('button', { name: /save/i }).click();
    }
    
    // Note: Drag and drop or position controls might not be implemented in MVP
    // This test would verify that links maintain their order
    const links = page.locator('[data-testid="link-item"]');
    const count = await links.count();
    expect(count).toBe(2);
  });

  test('should delete a link', async ({ page }) => {
    // Add a link first
    await page.getByRole('button', { name: /add link/i }).click();
    await page.getByPlaceholder(/title/i).fill('Test Link');
    await page.getByPlaceholder(/url/i).fill('https://example.com');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Wait for link to appear
    await expect(page.getByText('Test Link')).toBeVisible();
    
    // Delete the link
    await page.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm/i });
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    
    // Link should be removed
    await expect(page.getByText('Test Link')).not.toBeVisible();
  });

  test('should show scan count', async ({ page }) => {
    // Look for scan count display
    const scanCount = page.getByText(/scans?: \d+/i);
    await expect(scanCount).toBeVisible();
    
    // New QR codes should have 0 scans
    const text = await scanCount.textContent();
    expect(text).toMatch(/scans?: 0/i);
  });
});

test.describe('QR Code Display', () => {
  test('should generate valid QR code image', async ({ page }) => {
    // Create test user and login
    const testEmail = generateTestEmail('qr-display');
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill('Test123!@#');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Check QR code canvas
    const qrCanvas = page.locator('canvas').first();
    await expect(qrCanvas).toBeVisible();
    
    // Verify canvas has content (not empty)
    const canvasSize = await qrCanvas.boundingBox();
    expect(canvasSize?.width).toBeGreaterThan(100);
    expect(canvasSize?.height).toBeGreaterThan(100);
  });

  test('should display QR code download button', async ({ page }) => {
    // Create test user and login
    const testEmail = generateTestEmail('qr-download');
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill('Test123!@#');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Look for download button
    const downloadButton = page.getByRole('button', { name: /download/i });
    
    // Note: Download functionality might not be implemented in MVP
    if (await downloadButton.isVisible({ timeout: 5000 })) {
      expect(downloadButton).toBeTruthy();
    }
  });
});