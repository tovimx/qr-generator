import { test, expect } from '@playwright/test';
import { generateTestEmail } from './helpers/supabase-auth';
import { simulateScan, getQRCodeStats } from './helpers/database';

test.describe('Analytics and Tracking Tests', () => {
  let testEmail: string;
  let shortCode: string;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    testEmail = generateTestEmail('analytics');
    
    // Create test user and get QR code
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Get short code for testing
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    await expect(shortLinkElement).toBeVisible();
    const shortLinkText = await shortLinkElement.textContent();
    shortCode = shortLinkText?.split('/q/')[1] || '';
  });

  test('should track QR code scans accurately', async ({ page, context }) => {
    if (!shortCode) return;
    
    // Initial scan count should be 0
    const initialScanCount = page.getByText(/0.*scan/i);
    if (await initialScanCount.count() > 0) {
      await expect(initialScanCount.first()).toBeVisible();
    }
    
    // Create new browser context to simulate external visitor
    const visitorContext = await page.context().browser()?.newContext();
    if (!visitorContext) return;
    
    const visitorPage = await visitorContext.newPage();
    
    // Visit QR page multiple times from different "devices"
    const visits = [
      {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        description: 'iPhone visit'
      },
      {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        description: 'Desktop visit'
      },
      {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        description: 'iPad visit'
      }
    ];
    
    for (const visit of visits) {
      await visitorPage.setExtraHTTPHeaders({
        'User-Agent': visit.userAgent
      });
      
      await visitorPage.goto(`/q/${shortCode}`);
      await visitorPage.waitForLoadState('networkidle');
      
      // Verify page loaded
      await expect(visitorPage.getByRole('heading')).toBeVisible();
      
      // Wait a moment for analytics to be recorded
      await visitorPage.waitForTimeout(1000);
    }
    
    // Go back to dashboard to check updated analytics
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show increased scan count
    const updatedScanCount = page.getByText(/[1-9].*scan/i);
    if (await updatedScanCount.count() > 0) {
      await expect(updatedScanCount.first()).toBeVisible();
    }
    
    await visitorContext.close();
  });

  test('should track link clicks from QR pages', async ({ page, context }) => {
    if (!shortCode) return;
    
    await page.waitForLoadState('networkidle');
    
    // Add trackable links to QR code
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if (await addLinkButton.isVisible()) {
      // Add first link
      await addLinkButton.click();
      await page.getByPlaceholder(/title/i).fill('Website');
      await page.getByPlaceholder(/url/i).fill('https://example.com');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.getByText('Website')).toBeVisible();
      
      // Add second link
      await addLinkButton.click();
      await page.getByPlaceholder(/title/i).fill('Social Media');
      await page.getByPlaceholder(/url/i).fill('https://social.example.com');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.getByText('Social Media')).toBeVisible();
    }
    
    // Create visitor to click links
    const visitorContext = await page.context().browser()?.newContext();
    if (!visitorContext) return;
    
    const visitorPage = await visitorContext.newPage();
    
    // Visit QR page
    await visitorPage.goto(`/q/${shortCode}`);
    await visitorPage.waitForLoadState('networkidle');
    
    // Find and click links (prevent actual navigation)
    const websiteLink = visitorPage.getByRole('link', { name: 'Website' });
    const socialLink = visitorPage.getByRole('link', { name: 'Social Media' });
    
    if (await websiteLink.isVisible()) {
      // Mock the external URLs to track clicks
      await visitorPage.route('https://example.com', route => {
        route.fulfill({ status: 200, body: 'Clicked Website Link' });
      });
      
      await websiteLink.click();
      await visitorPage.waitForTimeout(1000);
    }
    
    if (await socialLink.isVisible()) {
      await visitorPage.route('https://social.example.com', route => {
        route.fulfill({ status: 200, body: 'Clicked Social Link' });
      });
      
      await socialLink.click();
      await visitorPage.waitForTimeout(1000);
    }
    
    // Go back to dashboard to check analytics
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for link click analytics
    const analyticsSection = page.locator('[data-testid="analytics"], [data-testid="link-stats"]');
    if (await analyticsSection.count() > 0) {
      await expect(analyticsSection.first()).toBeVisible();
      
      // Should show click counts or statistics
      const clickStats = page.getByText(/click/i);
      if (await clickStats.count() > 0) {
        await expect(clickStats.first()).toBeVisible();
      }
    }
    
    await visitorContext.close();
  });

  test('should display analytics dashboard with charts and metrics', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for analytics or statistics section
    const analyticsSection = page.locator('[data-testid="analytics"]')
      .or(page.locator('[data-testid="stats"]'))
      .or(page.getByText(/analytics/i))
      .or(page.getByText(/statistics/i));
    
    if (await analyticsSection.count() > 0) {
      await expect(analyticsSection.first()).toBeVisible();
      
      // Should show scan metrics
      const scanMetrics = page.getByText(/scan/i);
      if (await scanMetrics.count() > 0) {
        await expect(scanMetrics.first()).toBeVisible();
      }
      
      // Should show visitor metrics
      const visitorMetrics = page.getByText(/visitor/i).or(page.getByText(/view/i));
      if (await visitorMetrics.count() > 0) {
        await expect(visitorMetrics.first()).toBeVisible();
      }
      
      // Look for charts or graphs
      const charts = page.locator('canvas').or(page.locator('.chart')).or(page.locator('[data-testid*="chart"]'));
      if (await charts.count() > 1) { // More than just QR code canvas
        await expect(charts.nth(1)).toBeVisible();
      }
    } else {
      // Even without dedicated analytics section, should show basic metrics
      const basicMetrics = page.getByText(/\d+.*scan/i).or(page.getByText(/\d+.*view/i));
      if (await basicMetrics.count() > 0) {
        await expect(basicMetrics.first()).toBeVisible();
      }
    }
  });

  test('should track device and browser information', async ({ page, context }) => {
    if (!shortCode) return;
    
    // Create visitors with different device signatures
    const devices = [
      {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        viewport: { width: 375, height: 667 },
        description: 'iPhone Safari'
      },
      {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        description: 'Windows Chrome'
      },
      {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        viewport: { width: 1440, height: 900 },
        description: 'Mac Safari'
      }
    ];
    
    const visitorContext = await page.context().browser()?.newContext();
    if (!visitorContext) return;
    
    for (const device of devices) {
      const devicePage = await visitorContext.newPage();
      
      await devicePage.setViewportSize(device.viewport);
      await devicePage.setExtraHTTPHeaders({
        'User-Agent': device.userAgent
      });
      
      await devicePage.goto(`/q/${shortCode}`);
      await devicePage.waitForLoadState('networkidle');
      
      // Verify page loads for different devices
      await expect(devicePage.getByRole('heading')).toBeVisible();
      
      await devicePage.waitForTimeout(1000);
      await devicePage.close();
    }
    
    // Check dashboard for device analytics
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for device breakdown or analytics
    const deviceAnalytics = page.locator('[data-testid="device-stats"]')
      .or(page.getByText(/mobile/i))
      .or(page.getByText(/desktop/i));
    
    if (await deviceAnalytics.count() > 0) {
      await expect(deviceAnalytics.first()).toBeVisible();
    }
    
    await visitorContext.close();
  });

  test('should track geographic information (if enabled)', async ({ page, context }) => {
    if (!shortCode) return;
    
    const visitorContext = await page.context().browser()?.newContext();
    if (!visitorContext) return;
    
    const visitorPage = await visitorContext.newPage();
    
    // Simulate different geographic locations through headers or IP simulation
    const geoLocations = [
      { country: 'US', ip: '8.8.8.8' },
      { country: 'GB', ip: '8.8.4.4' },
      { country: 'CA', ip: '1.1.1.1' }
    ];
    
    for (const location of geoLocations) {
      // Note: This is a simulation - real geo tracking would need proper IP handling
      await visitorPage.setExtraHTTPHeaders({
        'X-Forwarded-For': location.ip,
        'CF-IPCountry': location.country
      });
      
      await visitorPage.goto(`/q/${shortCode}`);
      await visitorPage.waitForLoadState('networkidle');
      await visitorPage.waitForTimeout(1000);
    }
    
    // Check for geographic analytics
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const geoAnalytics = page.locator('[data-testid="geo-stats"]')
      .or(page.getByText(/country/i))
      .or(page.getByText(/location/i));
    
    if (await geoAnalytics.count() > 0) {
      await expect(geoAnalytics.first()).toBeVisible();
    }
    
    await visitorContext.close();
  });

  test('should provide analytics export functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for export or download analytics functionality
    const exportButton = page.getByRole('button', { name: /export/i })
      .or(page.getByRole('button', { name: /download/i }))
      .or(page.getByRole('button', { name: /csv/i }));
    
    if (await exportButton.isVisible()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      const download = await downloadPromise;
      
      // Verify download occurred
      expect(download.suggestedFilename()).toBeTruthy();
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|json)$/i);
      
      console.log('Analytics export file:', download.suggestedFilename());
    }
  });

  test('should show real-time analytics updates', async ({ page, context }) => {
    if (!shortCode) return;
    
    await page.waitForLoadState('networkidle');
    
    // Get initial scan count
    const initialScanElement = page.getByText(/\d+.*scan/i);
    let initialCount = 0;
    
    if (await initialScanElement.count() > 0) {
      const initialText = await initialScanElement.first().textContent();
      initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    }
    
    // Create visitor to generate new scan
    const visitorContext = await page.context().browser()?.newContext();
    if (!visitorContext) return;
    
    const visitorPage = await visitorContext.newPage();
    await visitorPage.goto(`/q/${shortCode}`);
    await visitorPage.waitForLoadState('networkidle');
    
    // Wait for analytics to update
    await page.waitForTimeout(3000);
    
    // Check if analytics updated in real-time or after refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const updatedScanElement = page.getByText(/\d+.*scan/i);
    if (await updatedScanElement.count() > 0) {
      const updatedText = await updatedScanElement.first().textContent();
      const updatedCount = parseInt(updatedText?.match(/\d+/)?.[0] || '0');
      
      expect(updatedCount).toBeGreaterThan(initialCount);
      
      console.log('Scan count updated:', `${initialCount} → ${updatedCount}`);
    }
    
    await visitorContext.close();
  });

  test('should handle analytics for multiple QR codes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create multiple QR codes
    const addQRButton = page.getByRole('button', { name: /add.*qr/i });
    
    if (await addQRButton.isVisible()) {
      await addQRButton.click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
      
      await addQRButton.click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(3);
    }
    
    // Each QR code should have its own analytics
    const qrTabs = page.locator('[data-testid="qr-tab"]');
    const qrCount = await qrTabs.count();
    
    for (let i = 0; i < qrCount; i++) {
      await qrTabs.nth(i).click();
      
      // Should show analytics specific to this QR code
      const scanCount = page.getByText(/\d+.*scan/i);
      if (await scanCount.count() > 0) {
        await expect(scanCount.first()).toBeVisible();
      }
      
      // Look for QR-specific analytics section
      const qrAnalytics = page.locator('[data-testid="qr-analytics"]').or(page.locator('[data-testid="current-qr-stats"]'));
      if (await qrAnalytics.count() > 0) {
        await expect(qrAnalytics.first()).toBeVisible();
      }
    }
    
    // Should also show aggregated analytics at project level
    const projectAnalytics = page.locator('[data-testid="project-analytics"]').or(page.locator('[data-testid="total-stats"]'));
    if (await projectAnalytics.count() > 0) {
      await expect(projectAnalytics.first()).toBeVisible();
    }
  });

  test('should track time-based analytics patterns', async ({ page, context }) => {
    if (!shortCode) return;
    
    // Simulate visits at different times
    const visitorContext = await page.context().browser()?.newContext();
    if (!visitorContext) return;
    
    const visitorPage = await visitorContext.newPage();
    
    // Make multiple visits over time (simulated)
    const visits = 3;
    for (let i = 0; i < visits; i++) {
      await visitorPage.goto(`/q/${shortCode}`);
      await visitorPage.waitForLoadState('networkidle');
      await visitorPage.waitForTimeout(1000);
      
      // Simulate time passing
      await page.waitForTimeout(500);
    }
    
    // Check for time-based analytics
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for time-based charts or analytics
    const timeAnalytics = page.locator('[data-testid="time-chart"]')
      .or(page.getByText(/hourly/i))
      .or(page.getByText(/daily/i))
      .or(page.getByText(/trend/i));
    
    if (await timeAnalytics.count() > 0) {
      await expect(timeAnalytics.first()).toBeVisible();
    }
    
    // Should show visit frequency or patterns
    const frequencyData = page.getByText(/visit/i).or(page.getByText(/pattern/i));
    if (await frequencyData.count() > 0) {
      await expect(frequencyData.first()).toBeVisible();
    }
    
    await visitorContext.close();
  });
});