import { test, expect } from '@playwright/test';
import { EnhancedAPIMock } from './helpers/enhanced-api-mock';

/**
 * Enhanced Visual Regression Tests
 * 
 * Tests visual consistency of QR codes, UI components, and layouts
 * Uses comprehensive API mocking for reliable screenshot testing
 */

test.describe('Visual Regression - Enhanced QR Code Testing', () => {
  let apiMock: EnhancedAPIMock;
  
  test.beforeEach(async ({ page }) => {
    // Set up comprehensive API mocking
    apiMock = new EnhancedAPIMock(page);
    await apiMock.setupComprehensiveMocks();
    
    // Set consistent viewport for screenshots
    await page.setViewportSize({ width: 1200, height: 800 });
  });
  
  test.afterEach(async () => {
    if (apiMock) {
      apiMock.clearMockData();
    }
  });
  
  test.describe('QR Code Visual Consistency', () => {
    
    test('QR code generation produces consistent visual output', async ({ page }) => {
      // Mock authenticated user and add test QR code
      await apiMock.authenticateUser();
      const testQR = apiMock.addMockQRCode({
        shortCode: 'visualtest1',
        title: 'Visual Test QR Code',
        links: [
          { id: '1', title: 'Test Link 1', url: 'https://example.com', order: 1, isActive: true },
          { id: '2', title: 'Test Link 2', url: 'https://google.com', order: 2, isActive: true }
        ]
      });
      
      // Navigate to QR page
      await page.goto(`/q/${testQR.shortCode}`);
      await page.waitForLoadState('networkidle');
      
      // Wait for any QR code canvas/svg to render
      await page.waitForTimeout(2000);
      
      // Take screenshot of the full QR page
      await expect(page).toHaveScreenshot('qr-page-default.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
    
    test('QR code themes render consistently', async ({ page }) => {
      // Test different QR code themes
      const themes = [
        { name: 'light', colors: { primary: '#000000', background: '#ffffff' } },
        { name: 'dark', colors: { primary: '#ffffff', background: '#000000' } },
        { name: 'blue', colors: { primary: '#0066cc', background: '#f0f8ff' } }
      ];
      
      await apiMock.authenticateUser();
      
      for (const theme of themes) {
        const testQR = apiMock.addMockQRCode({
          shortCode: `theme-${theme.name}`,
          title: `${theme.name} Theme QR`,
          theme: theme.colors,
          links: [
            { id: '1', title: 'Themed Link', url: 'https://example.com', order: 1, isActive: true }
          ]
        });
        
        await page.goto(`/q/${testQR.shortCode}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        
        // Screenshot the themed QR page
        await expect(page).toHaveScreenshot(`qr-theme-${theme.name}.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      }
    });
    
    test('QR code with multiple links layout consistency', async ({ page }) => {
      await apiMock.authenticateUser();
      
      // Create QR with many links to test layout
      const testQR = apiMock.addMockQRCode({
        shortCode: 'multilink-test',
        title: 'Multi-Link QR Code Test',
        links: [
          { id: '1', title: 'Website', url: 'https://website.com', order: 1, isActive: true },
          { id: '2', title: 'Instagram', url: 'https://instagram.com/profile', order: 2, isActive: true },
          { id: '3', title: 'Twitter', url: 'https://twitter.com/profile', order: 3, isActive: true },
          { id: '4', title: 'LinkedIn', url: 'https://linkedin.com/in/profile', order: 4, isActive: true },
          { id: '5', title: 'Email Contact', url: 'mailto:contact@example.com', order: 5, isActive: true },
          { id: '6', title: 'Phone', url: 'tel:+1234567890', order: 6, isActive: true }
        ]
      });
      
      await page.goto(`/q/${testQR.shortCode}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Screenshot multi-link layout
      await expect(page).toHaveScreenshot('qr-multilink-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
  
  test.describe('Authentication Pages Visual Testing', () => {
    
    test('login page visual consistency', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Hide any dynamic elements that might cause flakiness
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          .loading, .spinner { display: none !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('login-page.png', {
        animations: 'disabled',
        mask: [page.locator('.timestamp, .version')] // Mask any timestamp/version elements
      });
    });
    
    test('signup page visual consistency', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          .loading, .spinner { display: none !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('signup-page.png', {
        animations: 'disabled',
        mask: [page.locator('.timestamp, .version')]
      });
    });
  });
  
  test.describe('Responsive Design Visual Testing', () => {
    
    test('QR page mobile responsive design', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await apiMock.authenticateUser();
      const mobileQR = apiMock.addMockQRCode({
        shortCode: 'mobile-test',
        title: 'Mobile QR Test',
        links: [
          { id: '1', title: 'Mobile Link 1', url: 'https://m.example.com', order: 1, isActive: true },
          { id: '2', title: 'Mobile Link 2', url: 'https://m.google.com', order: 2, isActive: true }
        ]
      });
      
      await page.goto(`/q/${mobileQR.shortCode}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('qr-mobile-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
    
    test('QR page tablet responsive design', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await apiMock.authenticateUser();
      const tabletQR = apiMock.addMockQRCode({
        shortCode: 'tablet-test',
        title: 'Tablet QR Test',
        links: [
          { id: '1', title: 'Tablet Link 1', url: 'https://tablet.example.com', order: 1, isActive: true },
          { id: '2', title: 'Tablet Link 2', url: 'https://tablet.google.com', order: 2, isActive: true }
        ]
      });
      
      await page.goto(`/q/${tabletQR.shortCode}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('qr-tablet-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
    
    test('login page mobile responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await page.addStyleTag({
        content: `* { animation-duration: 0s !important; }`
      });
      
      await expect(page).toHaveScreenshot('login-mobile.png', {
        animations: 'disabled'
      });
    });
  });
  
  test.describe('Error Pages Visual Testing', () => {
    
    test('404 QR code page visual consistency', async ({ page }) => {
      await page.goto('/q/nonexistent-qr-code-12345');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      // Should show some kind of error page
      await expect(page).toHaveScreenshot('qr-404-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
  
  test.describe('Dashboard Visual Testing (Mock)', () => {
    
    test('dashboard page layout with mock data', async ({ page }) => {
      await apiMock.authenticateUser();
      
      // Add multiple QR codes for realistic dashboard
      for (let i = 1; i <= 3; i++) {
        apiMock.addMockQRCode({
          shortCode: `dash-qr-${i}`,
          title: `Dashboard QR ${i}`,
          links: [
            { id: `${i}-1`, title: `Link ${i}`, url: `https://example${i}.com`, order: 1, isActive: true }
          ]
        });
      }
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Give dashboard time to load
      
      // Hide dynamic elements like timestamps
      await page.addStyleTag({
        content: `
          * { animation-duration: 0s !important; }
          .timestamp, .time, .date { opacity: 0 !important; }
          .loading, .spinner { display: none !important; }
        `
      });
      
      await expect(page).toHaveScreenshot('dashboard-layout.png', {
        fullPage: true,
        animations: 'disabled',
        mask: [page.locator('.timestamp, .time, .date, [data-time]')]
      });
    });
  });
  
  test.describe('Component Isolation Visual Testing', () => {
    
    test('QR code component isolation', async ({ page }) => {
      await apiMock.authenticateUser();
      const isolationQR = apiMock.addMockQRCode({
        shortCode: 'component-test',
        title: 'Component Test',
        links: [
          { id: '1', title: 'Isolated Link', url: 'https://isolated.com', order: 1, isActive: true }
        ]
      });
      
      await page.goto(`/q/${isolationQR.shortCode}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Try to isolate just the QR code component
      const qrContainer = page.locator('.qr-container, [data-testid="qr-code"], canvas, svg').first();
      
      if (await qrContainer.isVisible({ timeout: 5000 })) {
        await expect(qrContainer).toHaveScreenshot('qr-component-isolated.png', {
          animations: 'disabled'
        });
      } else {
        // Fallback to full page if component not found
        await expect(page).toHaveScreenshot('qr-component-fallback.png', {
          animations: 'disabled'
        });
      }
    });
  });
});

/**
 * Cross-Browser Visual Consistency Tests
 */
test.describe('Cross-Browser Visual Regression', () => {
  let apiMock: EnhancedAPIMock;
  
  test.beforeEach(async ({ page }) => {
    apiMock = new EnhancedAPIMock(page);
    await apiMock.setupComprehensiveMocks();
    await page.setViewportSize({ width: 1200, height: 800 });
  });
  
  test('login page renders consistently across browsers', async ({ page, browserName }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.addStyleTag({
      content: `
        * { animation-duration: 0s !important; }
        .loading { display: none !important; }
      `
    });
    
    // Include browser name in screenshot for comparison
    await expect(page).toHaveScreenshot(`login-${browserName}.png`, {
      animations: 'disabled',
      threshold: 0.3 // Allow for minor browser rendering differences
    });
  });
  
  test('QR page renders consistently across browsers', async ({ page, browserName }) => {
    await apiMock.authenticateUser();
    const crossBrowserQR = apiMock.addMockQRCode({
      shortCode: 'cross-browser-test',
      title: 'Cross Browser QR',
      links: [
        { id: '1', title: 'Cross Browser Link', url: 'https://crossbrowser.com', order: 1, isActive: true }
      ]
    });
    
    await page.goto(`/q/${crossBrowserQR.shortCode}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    
    await expect(page).toHaveScreenshot(`qr-page-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.3
    });
  });
});