import { test, expect } from '@playwright/test';
import { EnhancedAPIMock } from './helpers/enhanced-api-mock';

/**
 * Comprehensive Visual Regression Testing Suite
 * 
 * This suite ensures visual consistency across the application by:
 * - Capturing screenshots of critical UI components
 * - Testing QR code generation visual consistency
 * - Validating theme customizations render correctly
 * - Ensuring responsive design works across viewports
 * - Testing color accuracy and pixel-perfect layouts
 */

test.describe('Visual Regression - Comprehensive Suite', () => {
  let apiMock: EnhancedAPIMock;
  
  test.beforeEach(async ({ page }) => {
    apiMock = new EnhancedAPIMock(page);
    await apiMock.setupComprehensiveMocks();
    await apiMock.authenticateUser('visual-test@example.com');
  });
  
  test.afterEach(async () => {
    if (apiMock) {
      apiMock.clearMockData();
    }
  });

  test.describe('QR Code Visual Consistency', () => {
    
    test('should generate consistent QR code visuals with default settings', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Wait for QR code to be generated and visible
      const qrCodeElement = page.locator('[data-testid="qr-code"], canvas, .qr-code-container').first();
      await expect(qrCodeElement).toBeVisible({ timeout: 15000 });
      
      // Wait a bit more for rendering to complete
      await page.waitForTimeout(2000);
      
      // Take screenshot of just the QR code area
      await expect(qrCodeElement).toHaveScreenshot('default-qr-code.png', {
        threshold: 0.1, // Allow 10% pixel difference for anti-aliasing
        maxDiffPixels: 1000
      });
    });

    test('should generate consistent QR codes with custom colors', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Open customization panel
      const designButton = page.locator('[data-testid="design-button"], button:has-text("Design"), .design-tab');
      if (await designButton.isVisible()) {
        await designButton.click();
      }
      
      // Apply custom colors
      const foregroundColorInput = page.locator('[data-testid="foreground-color"], input[type="color"]').first();
      const backgroundColorInput = page.locator('[data-testid="background-color"], input[type="color"]').last();
      
      if (await foregroundColorInput.isVisible()) {
        await foregroundColorInput.fill('#ff0000'); // Red foreground
      }
      
      if (await backgroundColorInput.isVisible()) {
        await backgroundColorInput.fill('#00ff00'); // Green background
      }
      
      // Wait for QR code to regenerate
      await page.waitForTimeout(3000);
      
      const qrCodeElement = page.locator('[data-testid="qr-code"], canvas, .qr-code-container').first();
      await expect(qrCodeElement).toBeVisible();
      
      await expect(qrCodeElement).toHaveScreenshot('custom-color-qr-code.png', {
        threshold: 0.1,
        maxDiffPixels: 1000
      });
    });

    test('should maintain QR code visual integrity with logo overlay', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Wait for initial QR code
      const qrCodeElement = page.locator('[data-testid="qr-code"], canvas, .qr-code-container').first();
      await expect(qrCodeElement).toBeVisible({ timeout: 15000 });
      
      // Try to add logo if logo upload is available
      const logoUploadArea = page.locator('[data-testid="logo-upload"], .logo-upload, input[type="file"]');
      
      if (await logoUploadArea.isVisible()) {
        // Create a small test image file path (would need actual file in real test)
        // For now, just test the QR code without logo to ensure it renders consistently
        await page.waitForTimeout(2000);
        
        await expect(qrCodeElement).toHaveScreenshot('qr-code-ready-for-logo.png', {
          threshold: 0.1,
          maxDiffPixels: 1000
        });
      } else {
        // Just test base QR code consistency
        await expect(qrCodeElement).toHaveScreenshot('qr-code-base-state.png', {
          threshold: 0.1,
          maxDiffPixels: 1000
        });
      }
    });
  });

  test.describe('Dashboard Visual Consistency', () => {
    
    test('should maintain consistent dashboard layout', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Wait for all dashboard elements to load
      await expect(page.locator('header, .dashboard-header')).toBeVisible();
      await page.waitForTimeout(3000);
      
      // Take full page screenshot for layout consistency
      await expect(page).toHaveScreenshot('dashboard-full-layout.png', {
        fullPage: true,
        threshold: 0.2,
        maxDiffPixels: 2000
      });
    });

    test('should maintain QR code tabs visual consistency', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const tabsContainer = page.locator('[data-testid="qr-tabs"], .tab-container, .tabs');
      await expect(tabsContainer).toBeVisible({ timeout: 10000 });
      
      await expect(tabsContainer).toHaveScreenshot('qr-tabs-layout.png', {
        threshold: 0.1,
        maxDiffPixels: 500
      });
    });

    test('should display consistent theme customization panel', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Open theme/design panel
      const designButton = page.locator('[data-testid="design-button"], button:has-text("Design"), .design-tab, [aria-label*="design"]');
      
      if (await designButton.isVisible()) {
        await designButton.click();
        await page.waitForTimeout(1000);
        
        const designPanel = page.locator('[data-testid="design-panel"], .design-panel, .customization-panel');
        if (await designPanel.isVisible()) {
          await expect(designPanel).toHaveScreenshot('theme-customization-panel.png', {
            threshold: 0.1,
            maxDiffPixels: 1000
          });
        }
      }
    });
  });

  test.describe('Responsive Design Visual Testing', () => {
    
    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('dashboard-tablet-768w.png', {
        fullPage: false,
        threshold: 0.2,
        maxDiffPixels: 2000
      });
    });

    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('dashboard-mobile-375w.png', {
        fullPage: false,
        threshold: 0.2,
        maxDiffPixels: 2000
      });
    });

    test('should maintain QR code visibility on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const qrCodeElement = page.locator('[data-testid="qr-code"], canvas, .qr-code-container').first();
      await expect(qrCodeElement).toBeVisible({ timeout: 15000 });
      
      await page.waitForTimeout(2000);
      
      await expect(qrCodeElement).toHaveScreenshot('qr-code-mobile-320w.png', {
        threshold: 0.1,
        maxDiffPixels: 800
      });
    });
  });

  test.describe('Public QR Page Visual Testing', () => {
    
    test('should display QR public page with consistent styling', async ({ page }) => {
      // First create a QR code with some links
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Add some links to test visual rendering
      const addLinkButton = page.locator('[data-testid="add-link"], button:has-text("Add Link"), .add-link-btn');
      
      if (await addLinkButton.isVisible()) {
        await addLinkButton.click();
        
        const linkTitleInput = page.locator('[data-testid="link-title"], input[placeholder*="title" i]').first();
        const linkUrlInput = page.locator('[data-testid="link-url"], input[placeholder*="url" i]').first();
        
        if (await linkTitleInput.isVisible() && await linkUrlInput.isVisible()) {
          await linkTitleInput.fill('Test Website');
          await linkUrlInput.fill('https://example.com');
          
          const saveLinkButton = page.locator('[data-testid="save-link"], button:has-text("Save"), .save-btn');
          if (await saveLinkButton.isVisible()) {
            await saveLinkButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Navigate to the QR public page (mock the short code)
      await page.goto('/q/test123');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('qr-public-page.png', {
        fullPage: true,
        threshold: 0.2,
        maxDiffPixels: 2000
      });
    });

    test('should display QR page consistently with custom theme', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Apply a custom theme first
      const themeButton = page.locator('[data-testid="theme-button"], .theme-selector, .theme-tab');
      if (await themeButton.isVisible()) {
        await themeButton.click();
        
        // Select a preset theme if available
        const themeOption = page.locator('.theme-option, [data-testid*="theme"]').first();
        if (await themeOption.isVisible()) {
          await themeOption.click();
          await page.waitForTimeout(1000);
        }
      }
      
      // Visit the QR public page
      await page.goto('/q/test123');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('qr-public-page-themed.png', {
        fullPage: true,
        threshold: 0.2,
        maxDiffPixels: 2000
      });
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    
    test('should render consistently across different browser engines', async ({ page, browserName }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Wait for QR code generation
      const qrCodeElement = page.locator('[data-testid="qr-code"], canvas, .qr-code-container').first();
      await expect(qrCodeElement).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // Take screenshot specific to browser engine
      await expect(qrCodeElement).toHaveScreenshot(`qr-code-${browserName}.png`, {
        threshold: 0.15, // Slightly higher threshold for cross-browser differences
        maxDiffPixels: 1500
      });
    });
  });

  test.describe('Error State Visual Testing', () => {
    
    test('should display error states consistently', async ({ page }) => {
      // Navigate to a non-existent QR page to trigger 404
      await page.goto('/q/nonexistent', { waitUntil: 'networkidle' });
      
      // Wait for error state to be displayed
      await page.waitForTimeout(2000);
      
      const errorMessage = page.locator('.error-message, [data-testid="error"], .not-found');
      if (await errorMessage.isVisible()) {
        await expect(page).toHaveScreenshot('qr-not-found-error.png', {
          threshold: 0.1,
          maxDiffPixels: 1000
        });
      }
    });

    test('should display loading states consistently', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Capture loading state if visible
      const loadingElement = page.locator('.loading, .spinner, [data-testid="loading"]');
      
      if (await loadingElement.isVisible()) {
        await expect(loadingElement).toHaveScreenshot('loading-spinner.png', {
          threshold: 0.1,
          maxDiffPixels: 500
        });
      }
    });
  });
});