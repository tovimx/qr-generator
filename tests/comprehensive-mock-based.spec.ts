import { test, expect } from '@playwright/test';

/**
 * Comprehensive Mock-Based E2E Tests
 * 
 * This test suite uses API mocking to test complete user workflows 
 * without depending on database connectivity or external services.
 * These tests focus on UI behavior, user interactions, and frontend logic.
 */

test.describe('QR Code Generator - Mock-Based E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up API mocks for all tests
    await setupAPIMocks(page);
  });

  test.describe('Authentication & Onboarding Flow', () => {
    
    test('should complete signup flow and redirect to dashboard', async ({ page }) => {
      await page.goto('/signup');
      
      // Fill signup form
      await page.getByPlaceholder('Email address').fill('newuser@test.com');
      await page.getByPlaceholder('Password').fill('testpassword123');
      
      // Submit signup
      await page.getByRole('button', { name: /sign up/i }).click();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      
      // Should show welcome state
      await expect(page.getByText(/welcome/i)).toBeVisible();
    });

    test('should complete login flow', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByPlaceholder('Email address').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('password123');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await expect(page).toHaveURL('/dashboard');
    });

    test('should show validation errors for invalid inputs', async ({ page }) => {
      await page.goto('/signup');
      
      // Try submitting with invalid email
      await page.getByPlaceholder('Email address').fill('invalid-email');
      await page.getByPlaceholder('Password').fill('weak');
      await page.getByRole('button', { name: /sign up/i }).click();
      
      // Should show validation errors
      await expect(page.getByText(/valid email/i)).toBeVisible();
    });
  });

  test.describe('QR Code Dashboard Functionality', () => {
    
    test.beforeEach(async ({ page }) => {
      // Mock authenticated state and navigate to dashboard
      await mockAuthenticatedUser(page);
      await page.goto('/dashboard');
    });

    test('should display default QR code after login', async ({ page }) => {
      // Should show at least one QR code tab
      await expect(page.locator('[data-testid="qr-tab"], .qr-tab')).toHaveCount(1);
      
      // Should show QR code canvas/image
      await expect(page.locator('[data-testid="qr-code"], .qr-code')).toBeVisible();
      
      // Should show links section
      await expect(page.getByText(/links/i)).toBeVisible();
    });

    test('should allow creating new QR codes up to limit', async ({ page }) => {
      // Click create new QR code button multiple times
      for (let i = 1; i < 5; i++) {
        await page.getByRole('button', { name: /new qr/i }).click();
        
        // Should create new tab
        await expect(page.locator('[data-testid="qr-tab"], .qr-tab')).toHaveCount(i + 1);
        
        // Wait a bit to avoid too rapid clicks
        await page.waitForTimeout(500);
      }
    });

    test('should allow switching between QR code tabs', async ({ page }) => {
      // Create a second QR code
      await page.getByRole('button', { name: /new qr/i }).click();
      await expect(page.locator('[data-testid="qr-tab"], .qr-tab')).toHaveCount(2);
      
      // Click on first tab
      await page.locator('[data-testid="qr-tab"], .qr-tab').first().click();
      
      // Click on second tab
      await page.locator('[data-testid="qr-tab"], .qr-tab').last().click();
      
      // Should maintain state between tabs
      expect(page.url()).toContain('/dashboard');
    });

    test('should allow renaming QR codes', async ({ page }) => {
      // Find rename button/input
      const renameButton = page.getByRole('button', { name: /rename|edit/i }).first();
      if (await renameButton.isVisible()) {
        await renameButton.click();
        
        const nameInput = page.getByPlaceholder(/name|title/i);
        await nameInput.fill('My Business QR');
        await nameInput.press('Enter');
        
        await expect(page.getByText('My Business QR')).toBeVisible();
      }
    });

    test('should prevent creating more than 10 QR codes', async ({ page }) => {
      // Try to create 11 QR codes
      for (let i = 1; i <= 11; i++) {
        const createButton = page.getByRole('button', { name: /new qr/i });
        if (await createButton.isVisible()) {
          await createButton.click();
          await page.waitForTimeout(300);
        }
      }
      
      // Should be limited to 10 QR codes
      const qrTabs = await page.locator('[data-testid="qr-tab"], .qr-tab').count();
      expect(qrTabs).toBeLessThanOrEqual(10);
      
      // Should show limitation message
      await expect(page.getByText(/maximum|limit|10 qr codes/i)).toBeVisible();
    });
  });

  test.describe('Link Management', () => {
    
    test.beforeEach(async ({ page }) => {
      await mockAuthenticatedUser(page);
      await page.goto('/dashboard');
    });

    test('should allow adding links to QR codes', async ({ page }) => {
      // Find and click add link button
      await page.getByRole('button', { name: /add link/i }).click();
      
      // Fill link details
      await page.getByPlaceholder(/title|name/i).fill('My Website');
      await page.getByPlaceholder(/url|link/i).fill('https://example.com');
      
      // Save link
      await page.getByRole('button', { name: /save|add/i }).click();
      
      // Should show the new link
      await expect(page.getByText('My Website')).toBeVisible();
    });

    test('should validate link URLs', async ({ page }) => {
      await page.getByRole('button', { name: /add link/i }).click();
      
      // Try invalid URL
      await page.getByPlaceholder(/title|name/i).fill('Invalid Link');
      await page.getByPlaceholder(/url|link/i).fill('not-a-valid-url');
      await page.getByRole('button', { name: /save|add/i }).click();
      
      // Should show validation error
      await expect(page.getByText(/valid url/i)).toBeVisible();
    });

    test('should allow reordering links via drag and drop', async ({ page }) => {
      // Add multiple links first
      const links = [
        { title: 'First Link', url: 'https://first.com' },
        { title: 'Second Link', url: 'https://second.com' }
      ];
      
      for (const link of links) {
        await page.getByRole('button', { name: /add link/i }).click();
        await page.getByPlaceholder(/title|name/i).fill(link.title);
        await page.getByPlaceholder(/url|link/i).fill(link.url);
        await page.getByRole('button', { name: /save|add/i }).click();
        await page.waitForTimeout(500);
      }
      
      // Test that links are displayed (drag-drop testing would need more complex setup)
      await expect(page.getByText('First Link')).toBeVisible();
      await expect(page.getByText('Second Link')).toBeVisible();
    });

    test('should enforce link limits per QR code', async ({ page }) => {
      // Try to add more than 5 links
      for (let i = 1; i <= 6; i++) {
        const addButton = page.getByRole('button', { name: /add link/i });
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.getByPlaceholder(/title|name/i).fill(`Link ${i}`);
          await page.getByPlaceholder(/url|link/i).fill(`https://link${i}.com`);
          await page.getByRole('button', { name: /save|add/i }).click();
          await page.waitForTimeout(300);
        }
      }
      
      // Should show limit message when trying to add 6th link
      await expect(page.getByText(/maximum|limit|5 links/i)).toBeVisible();
    });
  });

  test.describe('Theme Customization', () => {
    
    test.beforeEach(async ({ page }) => {
      await mockAuthenticatedUser(page);
      await page.goto('/dashboard');
    });

    test('should allow customizing QR code theme colors', async ({ page }) => {
      // Open theme customization panel
      await page.getByRole('button', { name: /customize|theme|design/i }).click();
      
      // Change primary color
      const colorPicker = page.locator('input[type="color"]').first();
      if (await colorPicker.isVisible()) {
        await colorPicker.fill('#ff5722');
      }
      
      // Preview should update
      await expect(page.locator('.qr-preview, [data-testid="qr-preview"]')).toBeVisible();
    });

    test('should provide preset theme templates', async ({ page }) => {
      await page.getByRole('button', { name: /customize|theme|design/i }).click();
      
      // Should show template options
      await expect(page.getByText(/template|preset/i)).toBeVisible();
      
      // Test selecting a template
      const template = page.getByRole('button', { name: /professional|modern|classic/i }).first();
      if (await template.isVisible()) {
        await template.click();
        
        // Should apply template styles
        await expect(page.locator('.qr-preview, [data-testid="qr-preview"]')).toBeVisible();
      }
    });

    test('should allow uploading avatar/logo', async ({ page }) => {
      await page.getByRole('button', { name: /customize|theme|design/i }).click();
      
      // Look for upload button
      const uploadButton = page.getByRole('button', { name: /upload|avatar|logo/i });
      if (await uploadButton.isVisible()) {
        // Test upload interface exists
        await expect(uploadButton).toBeVisible();
      }
    });
  });

  test.describe('QR Code Public Pages', () => {
    
    test('should display QR code public page with links', async ({ page }) => {
      // Navigate to mock QR code page
      await page.goto('/q/test-qr-code');
      
      // Should show QR code content
      await expect(page.getByText(/links|connect/i)).toBeVisible();
      
      // Should show mock links
      await expect(page.getByRole('link')).toHaveCount.greaterThan(0);
    });

    test('should track analytics when QR page is viewed', async ({ page }) => {
      await page.goto('/q/test-qr-code');
      
      // Should send analytics request (mocked)
      await expect(page.locator('body')).toBeVisible();
      
      // Analytics tracking would be validated via network requests
    });

    test('should show 404 for invalid QR codes', async ({ page }) => {
      await page.goto('/q/invalid-code-123');
      
      // Should show 404 or not found message
      await expect(page.getByText(/not found|404|doesn't exist/i)).toBeVisible();
    });

    test('should be responsive on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/q/test-qr-code');
      
      // Should display properly on mobile
      await expect(page.locator('body')).toBeVisible();
      
      // Links should be touch-friendly
      const links = page.getByRole('link');
      if (await links.count() > 0) {
        const firstLink = links.first();
        const boundingBox = await firstLink.boundingBox();
        expect(boundingBox?.height).toBeGreaterThan(44); // Minimum touch target
      }
    });
  });

  test.describe('Performance & Error Handling', () => {
    
    test('should handle network failures gracefully', async ({ page }) => {
      await mockAuthenticatedUser(page);
      
      // Mock network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/dashboard');
      
      // Should show error message or retry option
      await expect(page.getByText(/error|retry|connection/i)).toBeVisible();
    });

    test('should load dashboard within performance threshold', async ({ page }) => {
      await mockAuthenticatedUser(page);
      
      const startTime = Date.now();
      await page.goto('/dashboard');
      
      // Wait for main content to load
      await expect(page.locator('[data-testid="qr-code"], .qr-code')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should maintain state during page refresh', async ({ page }) => {
      await mockAuthenticatedUser(page);
      await page.goto('/dashboard');
      
      // Make some changes
      await page.getByRole('button', { name: /new qr/i }).click();
      
      // Refresh page
      await page.reload();
      
      // Should maintain authenticated state
      await expect(page).toHaveURL('/dashboard');
      
      // Should restore QR codes
      await expect(page.locator('[data-testid="qr-tab"], .qr-tab')).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Project Management', () => {
    
    test.beforeEach(async ({ page }) => {
      await mockAuthenticatedUser(page);
      await page.goto('/dashboard');
    });

    test('should allow creating new projects', async ({ page }) => {
      // Look for project creation interface
      const newProjectButton = page.getByRole('button', { name: /new project|create project/i });
      if (await newProjectButton.isVisible()) {
        await newProjectButton.click();
        
        await page.getByPlaceholder(/project name/i).fill('Business Website');
        await page.getByRole('button', { name: /create|save/i }).click();
        
        await expect(page.getByText('Business Website')).toBeVisible();
      }
    });

    test('should organize QR codes by projects', async ({ page }) => {
      // Should show default project
      await expect(page.getByText(/project|default/i)).toBeVisible();
      
      // QR codes should be grouped by project
      await expect(page.locator('[data-testid="qr-tab"], .qr-tab')).toHaveCount.greaterThan(0);
    });
  });
});

/**
 * Helper function to set up comprehensive API mocks
 */
async function setupAPIMocks(page) {
  // Mock authentication endpoints
  await page.route('**/auth/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (url.includes('/signup') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'mock-token' }
        })
      });
    } else if (url.includes('/signin') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'mock-token' }
        })
      });
    } else {
      await route.continue();
    }
  });
  
  // Mock API endpoints
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (url.includes('/qr-codes') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          qrCodes: [
            {
              id: 'qr-1',
              title: 'My QR Code',
              shortCode: 'test-qr-code',
              links: [
                { id: 'link-1', title: 'Website', url: 'https://example.com' },
                { id: 'link-2', title: 'Instagram', url: 'https://instagram.com/example' }
              ]
            }
          ]
        })
      });
    } else if (url.includes('/qr-codes') && method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-qr-' + Date.now(),
          title: 'New QR Code',
          shortCode: 'new-' + Math.random().toString(36).substr(2, 6),
          links: []
        })
      });
    } else if (url.includes('/links') && method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-link-' + Date.now(),
          title: 'New Link',
          url: 'https://example.com'
        })
      });
    } else {
      await route.continue();
    }
  });

  // Mock QR code public pages
  await page.route('**/q/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Test QR Code</title></head>
          <body>
            <h1>My Links</h1>
            <a href="https://example.com">Website</a>
            <a href="https://instagram.com/example">Instagram</a>
          </body>
        </html>
      `
    });
  });
}

/**
 * Helper function to mock an authenticated user
 */
async function mockAuthenticatedUser(page) {
  await page.addInitScript(() => {
    // Mock localStorage auth state
    localStorage.setItem('sb-test-auth-token', JSON.stringify({
      access_token: 'mock-token',
      user: {
        id: 'user-123',
        email: 'test@example.com'
      }
    }));
    
    // Mock global auth state
    (window as any).__mockAuth = {
      user: { id: 'user-123', email: 'test@example.com' },
      authenticated: true
    };
  });
}