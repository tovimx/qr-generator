import { test, expect } from '@playwright/test';
import { MockAuthHelper } from './helpers/mock-auth';

/**
 * QR Code Creation Tests with Mock Authentication
 * 
 * These tests focus on the QR code functionality itself rather than
 * the authentication system, using mocked auth state.
 */

test.describe('QR Code Creation (Mock Auth)', () => {
  let mockAuth: MockAuthHelper;

  test.beforeEach(async ({ page }) => {
    mockAuth = new MockAuthHelper(page);
    
    // Set up mocked authentication
    await mockAuth.setupAuthMocks();
    await mockAuth.navigateToDashboard();
  });

  test.afterEach(async ({ page }) => {
    await mockAuth.mockLogout();
  });

  test('should display QR code dashboard interface', async ({ page }) => {
    // Check that we're on the dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Look for common dashboard elements (adjust selectors based on actual UI)
    const dashboardHeading = page.locator('h1, h2, h3').first();
    await expect(dashboardHeading).toBeVisible();
    
    console.log('Dashboard interface loaded successfully with mock auth');
  });

  test('should render QR code canvas element', async ({ page }) => {
    // Look for QR code canvas (from react-qr-code or similar)
    const qrCanvas = page.locator('canvas').first();
    
    // Canvas might take a moment to render
    await expect(qrCanvas).toBeVisible({ timeout: 10000 });
    
    // Verify canvas has content (non-zero dimensions)
    const canvasSize = await qrCanvas.boundingBox();
    expect(canvasSize?.width).toBeGreaterThan(0);
    expect(canvasSize?.height).toBeGreaterThan(0);
    
    console.log('QR code canvas rendered successfully');
  });

  test('should display QR code title input field', async ({ page }) => {
    // Look for title input field
    const titleInput = page.getByPlaceholder(/title|name/i).or(
      page.locator('input[type="text"]').first()
    );
    
    await expect(titleInput).toBeVisible();
    
    console.log('QR code title input field found');
  });

  test('should allow editing QR code title', async ({ page }) => {
    // Find and interact with title field
    const titleInput = page.getByPlaceholder(/title|name/i).or(
      page.locator('input[type="text"]').first()
    );
    
    await titleInput.fill('Test QR Code');
    
    // Verify the value was set
    await expect(titleInput).toHaveValue('Test QR Code');
    
    console.log('QR code title edited successfully');
  });

  test('should show link management interface', async ({ page }) => {
    // Look for add link button or link management section
    const addLinkButton = page.getByRole('button', { name: /add link|add url|new link/i }).or(
      page.locator('button').filter({ hasText: /link/i })
    );
    
    await expect(addLinkButton).toBeVisible();
    
    console.log('Link management interface found');
  });

  test('should open link editor when add link is clicked', async ({ page }) => {
    // Find and click add link button
    const addLinkButton = page.getByRole('button', { name: /add link|add url|new link/i }).or(
      page.locator('button').filter({ hasText: /link/i })
    );
    
    await addLinkButton.click();
    
    // Look for link editor form
    const linkTitleInput = page.getByPlaceholder(/title|label/i);
    const linkUrlInput = page.getByPlaceholder(/url|link|http/i);
    
    // At least one should be visible
    await expect(linkTitleInput.or(linkUrlInput)).toBeVisible();
    
    console.log('Link editor opened successfully');
  });

  test('should display short link for QR code', async ({ page }) => {
    // Look for short link display
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/').or(
      page.locator('code, .font-mono').filter({ hasText: /q\// })
    );
    
    await expect(shortLinkElement).toBeVisible();
    
    console.log('Short link displayed successfully');
  });

  test('should have responsive design elements', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Dashboard should still be accessible
    await expect(page).toHaveURL('/dashboard');
    
    // QR code should still be visible
    const qrElement = page.locator('canvas').or(page.locator('[class*="qr"]'));
    await expect(qrElement).toBeVisible();
    
    console.log('Responsive design verified');
  });

  test('should handle page refresh gracefully', async ({ page }) => {
    // Refresh the page
    await page.reload();
    
    // Should remain authenticated (with our mock)
    await expect(page).toHaveURL('/dashboard');
    
    // Basic elements should still be present
    const mainContent = page.locator('main, .main, [role="main"]').or(
      page.locator('body > div').first()
    );
    await expect(mainContent).toBeVisible();
    
    console.log('Page refresh handled gracefully');
  });

  test('should have accessible navigation elements', async ({ page }) => {
    // Check for navigation elements
    const nav = page.locator('nav').or(page.getByRole('navigation'));
    
    // If navigation exists, it should be accessible
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
    
    // Check for logout functionality
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    
    // Logout might not always be visible but test if it's there
    if (await logoutButton.count() > 0) {
      await expect(logoutButton).toBeVisible();
    }
    
    console.log('Navigation elements checked');
  });
});