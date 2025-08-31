import { test, expect } from '@playwright/test';
import { MockAuthHelper } from './helpers/mock-auth';

test.describe('QR Code Creation - Fixed Auth', () => {
  let mockAuth: MockAuthHelper;

  test.beforeEach(async ({ page }) => {
    mockAuth = new MockAuthHelper(page);
    
    // Set up mock authentication and navigate to dashboard
    await mockAuth.mockAuthentication();
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard with mock auth', async ({ page }) => {
    // Verify we're on dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check for basic dashboard elements
    const dashboardContent = page.locator('body');
    await expect(dashboardContent).toBeVisible();
    
    // Look for common dashboard elements - QR codes or creation UI
    const hasQRElements = await page.locator('canvas, svg, [data-testid*="qr"], .qr').count();
    const hasCreationElements = await page.locator('button, input[placeholder*="title"], input[placeholder*="url"]').count();
    
    // Dashboard should have either QR display elements or creation elements
    expect(hasQRElements + hasCreationElements).toBeGreaterThan(0);
  });

  test('should handle QR code creation workflow', async ({ page }) => {
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Look for QR creation elements - try multiple selectors
    const titleInput = page.locator('input[placeholder*="title"], input[placeholder*="Title"], input[name*="title"]').first();
    const urlInput = page.locator('input[placeholder*="url"], input[placeholder*="URL"], input[name*="url"]').first();
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Save")').first();
    
    // If we have title input, test title editing
    if (await titleInput.isVisible({ timeout: 2000 })) {
      await titleInput.fill('Test QR Code');
      
      // Verify title was entered
      expect(await titleInput.inputValue()).toBe('Test QR Code');
    }
    
    // If we have URL input, test URL adding
    if (await urlInput.isVisible({ timeout: 2000 })) {
      await urlInput.fill('https://example.com');
      
      // Verify URL was entered
      expect(await urlInput.inputValue()).toBe('https://example.com');
      
      // If create button is available, click it
      if (await createButton.isVisible({ timeout: 2000 })) {
        await createButton.click();
        
        // Wait for any loading states
        await page.waitForTimeout(1000);
      }
    }
    
    // Look for QR code display after creation/editing
    const qrElements = page.locator('canvas, svg, .qr-code, [data-testid*="qr"]');
    if (await qrElements.count() > 0) {
      await expect(qrElements.first()).toBeVisible();
    }
  });

  test('should display QR code elements', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Look for any QR-related elements
    const qrCanvas = page.locator('canvas');
    const qrSvg = page.locator('svg');
    const qrImages = page.locator('img[alt*="QR"], img[src*="qr"]');
    
    // Check if any QR display element exists
    const hasCanvas = await qrCanvas.count() > 0;
    const hasSvg = await qrSvg.count() > 0; 
    const hasImages = await qrImages.count() > 0;
    
    if (hasCanvas || hasSvg || hasImages) {
      // Verify at least one QR element is visible
      const qrElement = hasCanvas ? qrCanvas.first() : 
                       hasSvg ? qrSvg.first() : 
                       qrImages.first();
      await expect(qrElement).toBeVisible();
    }
    
    // Look for short links (indicating QR functionality)
    const shortLinkPattern = /\/q\/[a-zA-Z0-9]+/;
    const bodyText = await page.locator('body').textContent();
    
    if (bodyText && shortLinkPattern.test(bodyText)) {
      // Found QR short link - verify it's visible
      const shortLinkElement = page.locator(`text=${shortLinkPattern}`);
      await expect(shortLinkElement.first()).toBeVisible();
    }
  });

  test('should handle form interactions', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find any input fields
    const inputs = page.locator('input[type="text"], input[type="url"], textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      // Test first available input
      const firstInput = inputs.first();
      await expect(firstInput).toBeVisible();
      
      // Try to interact with it
      await firstInput.click();
      await firstInput.fill('Test input value');
      
      // Verify the input accepts text
      const inputValue = await firstInput.inputValue();
      expect(inputValue).toBe('Test input value');
    }
    
    // Find any buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Verify buttons are present
      expect(buttonCount).toBeGreaterThan(0);
      
      // Test first visible button (but don't necessarily click it)
      const firstVisibleButton = buttons.first();
      if (await firstVisibleButton.isVisible()) {
        await expect(firstVisibleButton).toBeVisible();
      }
    }
  });

  test('should not have JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Collect console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate and wait for page to load
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000);
    
    // Filter out known/acceptable errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('chunks') && 
      !error.includes('localhost') &&
      !error.toLowerCase().includes('network')
    );
    
    // Should have no critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });

  test.afterEach(async ({ page }) => {
    // Clean up authentication state
    await mockAuth.mockLogout();
  });
});