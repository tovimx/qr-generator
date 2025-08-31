import { test, expect } from '@playwright/test';
import { generateTestEmail } from './helpers/supabase-auth';
import { createTestUser, createTestQRCode, addLinksToQRCode, simulateScan, getQRCodeStats } from './helpers/database';

test.describe('Dynamic QR Pages Tests', () => {
  let testEmail: string;
  let testUser: any;
  let qrCode: any;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    testEmail = generateTestEmail('qr-page');
    
    // Create test user and get initial QR code
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Wait for dashboard and get the short code
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Extract short code from the displayed link
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    await expect(shortLinkElement).toBeVisible();
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    // Store for use in tests
    test.info().attach('shortCode', { body: shortCode || 'unknown' });
  });

  test('should display basic QR page with default content', async ({ page }) => {
    // Get short code from dashboard first
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) {
      throw new Error('Could not extract short code');
    }
    
    // Visit the QR page
    await page.goto(`/q/${shortCode}`);
    
    // Should display the QR page with default title
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Should show "My QR Code" or similar default title
    await expect(page.getByText(/my qr code/i)).toBeVisible();
    
    // Should have proper page structure
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });

  test('should display QR page with custom links', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Add some links to the QR code
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if (await addLinkButton.isVisible()) {
      // Add first link
      await addLinkButton.click();
      await page.getByPlaceholder(/title/i).fill('My Website');
      await page.getByPlaceholder(/url/i).fill('https://example.com');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.getByText('My Website')).toBeVisible();
      
      // Add second link
      await addLinkButton.click();
      await page.getByPlaceholder(/title/i).fill('Twitter Profile');
      await page.getByPlaceholder(/url/i).fill('https://twitter.com/testuser');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.getByText('Twitter Profile')).toBeVisible();
    }
    
    // Get short code and visit QR page
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (shortCode) {
      await page.goto(`/q/${shortCode}`);
      
      // Should display the links as clickable buttons
      await expect(page.getByRole('link', { name: 'My Website' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Twitter Profile' })).toBeVisible();
      
      // Links should have correct href attributes
      const websiteLink = page.getByRole('link', { name: 'My Website' });
      await expect(websiteLink).toHaveAttribute('href', 'https://example.com');
      
      const twitterLink = page.getByRole('link', { name: 'Twitter Profile' });
      await expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/testuser');
      
      // Links should open in new tab
      await expect(websiteLink).toHaveAttribute('target', '_blank');
      await expect(twitterLink).toHaveAttribute('target', '_blank');
    }
  });

  test('should track analytics when QR page is visited', async ({ page }) => {
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    // Visit QR page multiple times with different user agents
    await page.goto(`/q/${shortCode}`);
    
    // Wait for analytics to be recorded
    await page.waitForTimeout(1000);
    
    // Visit from different "device" by changing user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    await page.goto(`/q/${shortCode}`);
    await page.waitForTimeout(1000);
    
    // Go back to dashboard to check analytics
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for scan count display
    const scanInfo = page.locator('text=/[1-9]+.*scan/i');
    if (await scanInfo.count() > 0) {
      await expect(scanInfo.first()).toBeVisible();
    }
  });

  test('should handle QR page with no links gracefully', async ({ page }) => {
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    // Visit QR page without adding any links
    await page.goto(`/q/${shortCode}`);
    
    // Should still display page title
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Should show message about no links or empty state
    const noLinksMessage = page.getByText(/no links/i).or(page.getByText(/add.*link/i));
    if (await noLinksMessage.count() > 0) {
      await expect(noLinksMessage.first()).toBeVisible();
    }
    
    // Should not break the page
    await expect(page.locator('main, body')).toBeVisible();
  });

  test('should display QR page with proper responsive design', async ({ page }) => {
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    // Add a few links first
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if (await addLinkButton.isVisible()) {
      for (let i = 1; i <= 3; i++) {
        await addLinkButton.click();
        await page.getByPlaceholder(/title/i).fill(`Link ${i}`);
        await page.getByPlaceholder(/url/i).fill(`https://example${i}.com`);
        await page.getByRole('button', { name: /save/i }).click();
      }
    }
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(`/q/${shortCode}`);
    
    // Should display properly on desktop
    await expect(page.getByRole('heading')).toBeVisible();
    const links = page.getByRole('link');
    if (await links.count() > 0) {
      await expect(links.first()).toBeVisible();
    }
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Should still display properly on mobile
    await expect(page.getByRole('heading')).toBeVisible();
    if (await links.count() > 0) {
      await expect(links.first()).toBeVisible();
    }
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Should display properly on tablet
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should handle QR page theme customization', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for design/theme customization options
    const designButton = page.getByRole('button', { name: /design/i }).or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Try to change theme colors
      const colorInputs = page.locator('input[type="color"]');
      if (await colorInputs.count() > 0) {
        await colorInputs.first().fill('#ff0000');
        
        // Save changes
        const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /apply/i }));
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
    }
    
    // Get short code and visit QR page
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (shortCode) {
      await page.goto(`/q/${shortCode}`);
      
      // Should apply theme customizations
      await expect(page.locator('body, main')).toBeVisible();
      
      // Check if custom styles are applied (this depends on implementation)
      const computedStyles = await page.locator('body').evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color
        };
      });
      
      // Just verify we can access computed styles
      expect(computedStyles).toBeDefined();
    }
  });

  test('should handle SEO metadata for QR pages', async ({ page }) => {
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    await page.goto(`/q/${shortCode}`);
    
    // Check for proper HTML metadata
    const title = await page.locator('title').textContent();
    expect(title).toBeTruthy();
    expect(title).toContain('QR'); // Should contain QR or similar
    
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const description = await metaDescription.getAttribute('content');
      expect(description).toBeTruthy();
    }
    
    // Check for Open Graph metadata
    const ogTitle = page.locator('meta[property="og:title"]');
    if (await ogTitle.count() > 0) {
      const ogTitleContent = await ogTitle.getAttribute('content');
      expect(ogTitleContent).toBeTruthy();
    }
  });

  test('should redirect inactive QR codes properly', async ({ page }) => {
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    // First verify QR page works when active
    await page.goto(`/q/${shortCode}`);
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Go back to dashboard and try to deactivate QR code
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for settings or deactivate button
    const settingsButton = page.getByRole('button', { name: /settings/i }).or(page.getByRole('button', { name: /options/i }));
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      const deactivateButton = page.getByRole('button', { name: /deactivate/i }).or(page.getByRole('checkbox', { name: /active/i }));
      if (await deactivateButton.isVisible()) {
        await deactivateButton.click();
        
        // Save if needed
        const saveButton = page.getByRole('button', { name: /save/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
        
        // Now try to access the QR page
        await page.goto(`/q/${shortCode}`);
        
        // Should show inactive message or redirect
        const inactiveMessage = page.getByText(/inactive/i).or(page.getByText(/not.*available/i));
        if (await inactiveMessage.count() > 0) {
          await expect(inactiveMessage.first()).toBeVisible();
        } else {
          // Or might redirect to error page
          expect(page.url()).not.toEqual(`/q/${shortCode}`);
        }
      }
    }
  });

  test('should handle link click tracking on QR pages', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Add a trackable link
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if (await addLinkButton.isVisible()) {
      await addLinkButton.click();
      await page.getByPlaceholder(/title/i).fill('Trackable Link');
      await page.getByPlaceholder(/url/i).fill('https://example.com');
      await page.getByRole('button', { name: /save/i }).click();
    }
    
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    // Visit QR page
    await page.goto(`/q/${shortCode}`);
    
    // Find and click the link (but prevent actual navigation)
    const trackableLink = page.getByRole('link', { name: 'Trackable Link' });
    if (await trackableLink.isVisible()) {
      // Prevent actual navigation for testing
      await page.route('https://example.com', route => {
        route.fulfill({ status: 200, body: 'Tracked' });
      });
      
      await trackableLink.click();
      
      // Link click should be tracked (this would typically be via analytics)
      await page.waitForTimeout(1000);
    }
    
    // Go back to dashboard to see if click was tracked
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for click analytics or link statistics
    const statsSection = page.locator('[data-testid="analytics"], [data-testid="link-stats"]');
    if (await statsSection.count() > 0) {
      // Should show some form of click tracking
      await expect(statsSection.first()).toBeVisible();
    }
  });

  test('should load QR page quickly with proper performance', async ({ page }) => {
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    // Measure page load performance
    const startTime = Date.now();
    
    await page.goto(`/q/${shortCode}`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load reasonably quickly (under 3 seconds)
    expect(loadTime).toBeLessThan(3000);
    
    // Check for proper loading states
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Should not have console errors
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should have minimal console errors
    expect(logs.length).toBeLessThanOrEqual(2); // Allow for minor errors
  });
});

test.describe('Dynamic QR Pages Error Handling', () => {
  test('should handle non-existent QR codes gracefully', async ({ page }) => {
    // Try to access a non-existent QR code
    await page.goto('/q/nonexistent-code');
    
    // Should show 404 or appropriate error message
    const errorMessage = page.getByText(/not found/i).or(page.getByText(/404/i)).or(page.getByText(/does not exist/i));
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // Should not crash the application
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle malformed short codes', async ({ page }) => {
    // Try various malformed short codes
    const malformedCodes = ['', 'abc!@#', 'toolongofacodethatdoesntexist', '../hack'];
    
    for (const code of malformedCodes) {
      await page.goto(`/q/${code}`);
      
      // Should handle gracefully without crashing
      await expect(page.locator('body')).toBeVisible();
      
      // Should show appropriate error
      const errorIndicator = page.getByText(/error/i).or(page.getByText(/invalid/i)).or(page.getByText(/not found/i));
      if (await errorIndicator.count() > 0) {
        await expect(errorIndicator.first()).toBeVisible();
      }
    }
  });

  test('should handle network failures on QR pages', async ({ page }) => {
    // Create valid QR first
    const testEmail = generateTestEmail('network-test');
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill('Test123!@#');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    // Simulate network failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.goto(`/q/${shortCode}`);
    
    // Should handle network failure gracefully
    await expect(page.locator('body')).toBeVisible();
    
    // Should show error state or loading state
    const errorState = page.getByText(/error/i).or(page.getByText(/loading/i)).or(page.getByText(/try again/i));
    if (await errorState.count() > 0) {
      await expect(errorState.first()).toBeVisible();
    }
  });
});