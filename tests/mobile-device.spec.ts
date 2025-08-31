/**
 * Mobile Device Testing for QR Generator App
 * Tests mobile-specific interactions, touch gestures, and responsive behavior
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { MockAuthHelper } from './helpers/mock-auth';
import { generateTestEmail } from './helpers/supabase-auth';

// Mobile device configurations
const MOBILE_DEVICES = {
  iPhoneSE: { width: 375, height: 667, name: 'iPhone SE' },
  iPhone12: { width: 390, height: 844, name: 'iPhone 12' },
  iPhone12ProMax: { width: 428, height: 926, name: 'iPhone 12 Pro Max' },
  galaxyS21: { width: 360, height: 800, name: 'Galaxy S21' },
  pixel5: { width: 393, height: 851, name: 'Pixel 5' },
  iPadMini: { width: 768, height: 1024, name: 'iPad Mini' },
  iPadPro: { width: 1024, height: 1366, name: 'iPad Pro' }
};

test.describe('Mobile Device Testing', () => {
  let authHelper: AuthHelper;
  let mockAuth: MockAuthHelper;
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    mockAuth = new MockAuthHelper(page);
    testEmail = generateTestEmail('mobile');
  });

  test.describe('Touch Interactions and Gestures', () => {
    Object.entries(MOBILE_DEVICES).forEach(([deviceKey, device]) => {
      if (device.width < 500) { // Only test on phone-sized devices
        test(`touch interactions on ${device.name}`, async ({ page }) => {
          await page.setViewportSize({ width: device.width, height: device.height });
          await mockAuth.mockAuthentication();
          await page.goto('/dashboard');

          // Test touch tap on QR code title
          const titleInput = page.getByRole('textbox', { name: /title/i });
          await titleInput.tap();
          await expect(titleInput).toBeFocused();

          // Test touch typing
          await titleInput.fill('Touch Test QR');
          await page.keyboard.press('Enter');

          // Test touch tap on "Add Link" button
          const addLinkButton = page.getByRole('button', { name: /add link/i });
          await addLinkButton.tap();

          // Test form interactions with touch
          await page.getByPlaceholder(/title/i).tap();
          await page.getByPlaceholder(/title/i).fill('Mobile Link');

          await page.getByPlaceholder(/url/i).tap();
          await page.getByPlaceholder(/url/i).fill('https://mobile.example.com');

          // Test save with touch
          await page.getByRole('button', { name: /save/i }).tap();

          // Verify link was added
          await expect(page.getByText('Mobile Link')).toBeVisible();
        });
      }
    });

    test('swipe gestures on mobile carousel (if applicable)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Look for carousel or swipeable content
      const carouselElements = page.locator('[data-testid*="carousel"], .carousel, .swiper');
      if (await carouselElements.count() > 0) {
        const carousel = carouselElements.first();
        const boundingBox = await carousel.boundingBox();
        
        if (boundingBox) {
          // Perform swipe left gesture
          await page.mouse.move(boundingBox.x + boundingBox.width - 50, boundingBox.y + boundingBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(boundingBox.x + 50, boundingBox.y + boundingBox.height / 2);
          await page.mouse.up();

          await page.waitForTimeout(500);

          // Perform swipe right gesture
          await page.mouse.move(boundingBox.x + 50, boundingBox.y + boundingBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(boundingBox.x + boundingBox.width - 50, boundingBox.y + boundingBox.height / 2);
          await page.mouse.up();
        }
      }
    });

    test('pinch to zoom gesture on QR code', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      const qrCanvas = page.locator('canvas');
      await expect(qrCanvas).toBeVisible();

      const boundingBox = await qrCanvas.boundingBox();
      if (boundingBox) {
        const centerX = boundingBox.x + boundingBox.width / 2;
        const centerY = boundingBox.y + boundingBox.height / 2;

        // Simulate pinch out (zoom in)
        await page.evaluate(({ x, y }) => {
          const element = document.elementFromPoint(x, y);
          if (element) {
            element.dispatchEvent(new TouchEvent('touchstart', {
              touches: [
                new Touch({ identifier: 1, target: element, clientX: x - 10, clientY: y }),
                new Touch({ identifier: 2, target: element, clientX: x + 10, clientY: y })
              ]
            }));
            
            element.dispatchEvent(new TouchEvent('touchmove', {
              touches: [
                new Touch({ identifier: 1, target: element, clientX: x - 20, clientY: y }),
                new Touch({ identifier: 2, target: element, clientX: x + 20, clientY: y })
              ]
            }));
            
            element.dispatchEvent(new TouchEvent('touchend', { touches: [] }));
          }
        }, { x: centerX, y: centerY });
      }
    });
  });

  test.describe('Mobile-Specific UI Elements', () => {
    test('hamburger menu functionality on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Look for mobile hamburger menu
      const hamburgerMenu = page.locator('[data-testid="hamburger-menu"], .hamburger, button[aria-label*="menu"]');
      
      if (await hamburgerMenu.isVisible()) {
        await hamburgerMenu.tap();
        
        // Check if menu opens
        const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, nav[aria-expanded="true"]');
        await expect(mobileMenu).toBeVisible();
        
        // Test menu item navigation
        const menuItems = mobileMenu.locator('a, button');
        const itemCount = await menuItems.count();
        
        if (itemCount > 0) {
          await menuItems.first().tap();
          // Verify navigation or action occurred
        }
      }
    });

    test('mobile keyboard covers input fields properly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Open add link form
      await page.getByRole('button', { name: /add link/i }).tap();

      // Focus on URL input (typically at bottom of form)
      const urlInput = page.getByPlaceholder(/url/i);
      await urlInput.tap();

      // Simulate mobile keyboard appearance by reducing viewport height
      await page.setViewportSize({ width: 375, height: 400 });

      // Verify the input is still visible and accessible
      await expect(urlInput).toBeVisible();
      await urlInput.fill('https://keyboard-test.com');
      
      // Test form submission with reduced viewport
      await page.getByRole('button', { name: /save/i }).tap();
    });

    test('sticky headers remain accessible on mobile scroll', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Add multiple links to create scrollable content
      for (let i = 1; i <= 5; i++) {
        await page.getByRole('button', { name: /add link/i }).tap();
        await page.getByPlaceholder(/title/i).fill(`Link ${i}`);
        await page.getByPlaceholder(/url/i).fill(`https://example${i}.com`);
        await page.getByRole('button', { name: /save/i }).tap();
        await page.waitForTimeout(200);
      }

      // Look for sticky header elements
      const stickyHeader = page.locator('[data-testid="header"], header, .sticky, .fixed');
      
      if (await stickyHeader.count() > 0) {
        const initialHeaderPosition = await stickyHeader.first().boundingBox();
        
        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(500);
        
        const scrolledHeaderPosition = await stickyHeader.first().boundingBox();
        
        // Header should remain visible (sticky behavior)
        expect(scrolledHeaderPosition?.y).toBeLessThanOrEqual(initialHeaderPosition?.y || 0);
      }
    });
  });

  test.describe('Mobile Performance and Loading', () => {
    test('app loads quickly on slow mobile connections', async ({ page }) => {
      // Simulate slow 3G connection
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
        await route.continue();
      });

      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');
      
      // Wait for critical content
      await expect(page.locator('canvas')).toBeVisible();
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time even on slow connection
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    });

    test('images and assets load properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Check for broken images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const isLoaded = await image.evaluate((img: HTMLImageElement) => {
          return img.complete && img.naturalHeight !== 0;
        });
        expect(isLoaded).toBe(true);
      }

      // Check QR code canvas renders
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      const canvasContent = await canvas.evaluate((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      });
      
      expect(canvasContent).not.toBeNull();
    });

    test('mobile app handles network interruptions gracefully', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Start adding a link
      await page.getByRole('button', { name: /add link/i }).tap();
      await page.getByPlaceholder(/title/i).fill('Network Test');
      await page.getByPlaceholder(/url/i).fill('https://network-test.com');

      // Simulate network failure
      await page.route('**/api/**', (route) => route.abort('failed'));

      // Try to save (should handle gracefully)
      await page.getByRole('button', { name: /save/i }).tap();

      // Should show appropriate error message
      await expect(page.locator('.error, .text-red, [role="alert"]')).toBeVisible();

      // Restore network
      await page.unroute('**/api/**');

      // Retry should work
      await page.getByRole('button', { name: /save/i }).tap();
      // Should succeed or continue to show appropriate state
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('touch targets meet minimum size requirements', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Find all interactive elements
      const interactiveElements = page.locator('button, a, input, [role="button"], [tabindex="0"]');
      const elementCount = await interactiveElements.count();

      for (let i = 0; i < elementCount; i++) {
        const element = interactiveElements.nth(i);
        const boundingBox = await element.boundingBox();
        
        if (boundingBox) {
          // Touch targets should be at least 44px (iOS) or 48dp (Android)
          const minSize = 44;
          expect(boundingBox.width).toBeGreaterThanOrEqual(minSize);
          expect(boundingBox.height).toBeGreaterThanOrEqual(minSize);
        }
      }
    });

    test('mobile screen readers can navigate the app', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Test keyboard navigation (simulating screen reader)
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();

      // Test ARIA labels are present
      const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
      const ariaCount = await ariaElements.count();
      expect(ariaCount).toBeGreaterThan(0);

      // Test heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1); // Should have at least one h1
    });

    test('mobile app works with high contrast mode', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          * {
            background-color: black !important;
            color: white !important;
            border-color: white !important;
          }
          canvas {
            filter: invert(1);
          }
        `
      });

      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Verify critical elements are still visible
      await expect(page.locator('canvas')).toBeVisible();
      await expect(page.getByRole('button', { name: /add link/i })).toBeVisible();
      
      // Test interaction still works
      await page.getByRole('button', { name: /add link/i }).tap();
      await expect(page.getByPlaceholder(/title/i)).toBeVisible();
    });
  });

  test.describe('Cross-Device QR Code Functionality', () => {
    test('QR codes work when scanned from different mobile devices', async ({ page }) => {
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      // Create a QR code with links
      await page.getByRole('textbox', { name: /title/i }).fill('Mobile QR Test');
      
      await page.getByRole('button', { name: /add link/i }).click();
      await page.getByPlaceholder(/title/i).fill('Mobile Website');
      await page.getByPlaceholder(/url/i).fill('https://mobile-optimized.com');
      await page.getByRole('button', { name: /save/i }).click();

      // Get the QR code short link
      const shortLinkElement = page.locator('[data-testid="short-link"], .short-link, .qr-link').first();
      const shortLinkText = await shortLinkElement.textContent();
      const shortCode = shortLinkText?.match(/\/q\/([a-zA-Z0-9]+)/)?.[1];

      if (shortCode) {
        // Test with different mobile viewport sizes
        const mobileSizes = [
          { width: 375, height: 667 }, // iPhone SE
          { width: 390, height: 844 }, // iPhone 12
          { width: 360, height: 800 }  // Android
        ];

        for (const size of mobileSizes) {
          await page.setViewportSize(size);
          await page.goto(`/q/${shortCode}`);

          // Verify QR page loads and displays correctly
          await expect(page.getByText('Mobile Website')).toBeVisible();
          
          // Test link click
          const link = page.getByRole('link', { name: 'Mobile Website' });
          await expect(link).toHaveAttribute('href', 'https://mobile-optimized.com');
        }
      }
    });

    test('mobile QR page sharing functionality', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await mockAuth.mockAuthentication();
      await page.goto('/dashboard');

      const shortLinkElement = page.locator('[data-testid="short-link"], .short-link, .qr-link').first();
      const shortLinkText = await shortLinkElement.textContent();
      const shortCode = shortLinkText?.match(/\/q\/([a-zA-Z0-9]+)/)?.[1];

      if (shortCode) {
        await page.goto(`/q/${shortCode}`);

        // Look for share functionality
        const shareButton = page.locator('[data-testid="share"], button:has-text("Share"), .share-button');
        
        if (await shareButton.isVisible()) {
          await shareButton.tap();
          
          // Test native share API or fallback
          const shareResult = await page.evaluate(() => {
            return 'share' in navigator;
          });
          
          // At minimum, should not crash
          await expect(page.locator('body')).toBeVisible();
        }
      }
    });
  });
});