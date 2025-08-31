import { test, expect, Page, Route } from '@playwright/test';

test.describe('Dashboard Access with Mock Auth', () => {
  test.beforeEach(async ({ page }) => {
    // Set up comprehensive authentication mocking
    await setupComprehensiveAuthMocks(page);
  });

  test('should access dashboard with mocked authentication', async ({ page }) => {
    // Navigate directly to dashboard - middleware should be bypassed by our mocks
    await page.goto('/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that we're not redirected to login
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).not.toContain('/signup');
  });

  test('should display basic dashboard elements', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for any content that indicates successful page load
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(100); // Should have substantial content
    
    // Check for presence of interactive elements
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const links = await page.locator('a').count();
    
    // Dashboard should have interactive elements
    expect(buttons + inputs + links).toBeGreaterThan(0);
  });

  test('should not redirect to authentication pages', async ({ page }) => {
    // Test various dashboard-related paths
    const dashboardPaths = ['/dashboard', '/dashboard/'];
    
    for (const path of dashboardPaths) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Should stay on dashboard, not redirect to auth
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/login');
      expect(currentUrl).not.toContain('/signup');
    }
  });

  test('should handle page interactions without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Try clicking on any visible buttons (but not form submission buttons)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Click on first visible button that's not a submit button
      const safeButtons = buttons.locator('button:not([type="submit"])');
      const safeButtonCount = await safeButtons.count();
      
      if (safeButtonCount > 0) {
        await safeButtons.first().click();
        await page.waitForTimeout(1000); // Wait for any actions to complete
      }
    }
    
    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('_next') &&
      !error.includes('chunk') &&
      !error.toLowerCase().includes('network')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

async function setupComprehensiveAuthMocks(page: Page) {
  // Mock all authentication-related requests
  await page.route('**/auth/**', async (route: Route) => {
    const url = route.request().url();
    
    // Mock successful authentication responses
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          created_at: new Date().toISOString()
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600
        }
      })
    });
  });

  // Mock API endpoints to return data
  await page.route('**/api/**', async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (url.includes('/user') || url.includes('/me')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-123',
          email: 'test@example.com',
          qrCodes: []
        })
      });
    } else if (url.includes('/qr') || url.includes('/qr-codes')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          qrCodes: [
            {
              id: 'mock-qr-1',
              title: 'Test QR Code',
              shortCode: 'test123',
              links: [
                { id: 'link1', title: 'Website', url: 'https://example.com' }
              ]
            }
          ]
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }
  });

  // Set up authentication cookies/localStorage before navigation
  await page.addInitScript(() => {
    // Mock localStorage auth data
    localStorage.setItem('sb-test-auth-token', JSON.stringify({
      access_token: 'mock-access-token',
      user: {
        id: 'test-user-123',
        email: 'test@example.com'
      }
    }));

    // Mock any global auth state the app might check
    (window as unknown as Record<string, unknown>).__authUser = {
      id: 'test-user-123',
      email: 'test@example.com'
    };
  });

  // Set authentication cookies
  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: 'mock-access-token',
      domain: 'localhost',
      path: '/'
    },
    {
      name: 'sb-refresh-token', 
      value: 'mock-refresh-token',
      domain: 'localhost',
      path: '/'
    }
  ]);
}