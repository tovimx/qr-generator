/**
 * QR Code Page Object Model for E2E testing
 * Provides high-level methods for interacting with QR code functionality
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export interface QRCodeData {
  title: string;
  shortCode: string;
  links: LinkData[];
}

export interface LinkData {
  title: string;
  url: string;
  position?: number;
}

/**
 * Page Object for QR Code management
 */
export class QRCodePage {
  // Locators
  private readonly qrCodeDisplay: Locator;
  private readonly shortLinkDisplay: Locator;
  private readonly titleInput: Locator;
  private readonly addLinkButton: Locator;
  private readonly linkTitleInput: Locator;
  private readonly linkUrlInput: Locator;
  private readonly saveLinkButton: Locator;
  private readonly linkItems: Locator;
  private readonly scanCounter: Locator;
  private readonly downloadButton: Locator;
  private readonly shareButton: Locator;

  constructor(private page: Page) {
    // Initialize locators
    this.qrCodeDisplay = page.locator('[data-testid="qr-code-display"]').or(page.locator('canvas').first());
    this.shortLinkDisplay = page.locator('[data-testid="short-link"]').or(page.locator('text=/\\/q\\//'));
    this.titleInput = page.locator('[data-testid="qr-title"]').or(page.getByPlaceholder(/title/i));
    this.addLinkButton = page.locator('[data-testid="add-link-button"]').or(page.getByRole('button', { name: /add link/i }));
    this.linkTitleInput = page.getByPlaceholder(/title/i);
    this.linkUrlInput = page.getByPlaceholder(/url/i);
    this.saveLinkButton = page.getByRole('button', { name: /save/i });
    this.linkItems = page.locator('[data-testid="link-item"]');
    this.scanCounter = page.locator('[data-testid="scan-count"]').or(page.locator('text=/scans?:?\\s*\\d+/i'));
    this.downloadButton = page.getByRole('button', { name: /download/i });
    this.shareButton = page.getByRole('button', { name: /share/i });
  }

  /**
   * Navigate to dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify QR code is displayed
   */
  async verifyQRCodeDisplayed(): Promise<void> {
    await expect(this.qrCodeDisplay).toBeVisible();
    
    // If it's a canvas, verify it has content
    const isCanvas = await this.qrCodeDisplay.evaluate(el => el.tagName === 'CANVAS');
    if (isCanvas) {
      const hasContent = await this.qrCodeDisplay.evaluate((canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        return imageData?.data.some(pixel => pixel !== 0);
      });
      expect(hasContent).toBe(true);
    }
  }

  /**
   * Get the short link URL
   */
  async getShortLink(): Promise<string> {
    await expect(this.shortLinkDisplay).toBeVisible();
    const text = await this.shortLinkDisplay.textContent();
    const match = text?.match(/\\/q\\/[a-zA-Z0-9]+/);
    return match?.[0] || '';
  }

  /**
   * Update QR code title
   */
  async updateTitle(newTitle: string): Promise<void> {
    if (await this.titleInput.isVisible()) {
      await this.titleInput.fill(newTitle);
      await this.titleInput.blur();
      // Wait for auto-save
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Add a new link to the QR code
   */
  async addLink(title: string, url: string): Promise<void> {
    await this.addLinkButton.click();
    
    await this.linkTitleInput.fill(title);
    await this.linkUrlInput.fill(url);
    
    await this.saveLinkButton.click();
    
    // Wait for link to appear in the list
    await this.page.waitForSelector(`text="${title}"`, { timeout: 5000 });
  }

  /**
   * Add multiple links at once
   */
  async addMultipleLinks(links: LinkData[]): Promise<void> {
    for (const link of links) {
      await this.addLink(link.title, link.url);
      // Small delay between additions to avoid race conditions
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Edit an existing link
   */
  async editLink(oldTitle: string, newTitle: string, newUrl?: string): Promise<void> {
    const linkItem = this.page.locator(`text="${oldTitle}"`).locator('..').first();
    const editButton = linkItem.getByRole('button', { name: /edit/i });
    
    await editButton.click();
    
    await this.linkTitleInput.fill(newTitle);
    if (newUrl) {
      await this.linkUrlInput.fill(newUrl);
    }
    
    await this.saveLinkButton.click();
    
    // Wait for updated link to appear
    await this.page.waitForSelector(`text="${newTitle}"`, { timeout: 5000 });
  }

  /**
   * Delete a link
   */
  async deleteLink(title: string): Promise<void> {
    const linkItem = this.page.locator(`text="${title}"`).locator('..').first();
    const deleteButton = linkItem.getByRole('button', { name: /delete/i });
    
    await deleteButton.click();
    
    // Handle confirmation dialog if present
    const confirmButton = this.page.getByRole('button', { name: /confirm|delete|yes/i });
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    
    // Wait for link to be removed
    await this.page.waitForFunction(
      (linkTitle) => !document.body.textContent?.includes(linkTitle),
      title,
      { timeout: 5000 }
    );
  }

  /**
   * Get current scan count
   */
  async getScanCount(): Promise<number> {
    if (await this.scanCounter.isVisible()) {
      const text = await this.scanCounter.textContent();
      const match = text?.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }
    return 0;
  }

  /**
   * Get all current links
   */
  async getLinks(): Promise<LinkData[]> {
    const links: LinkData[] = [];
    const linkElements = this.linkItems;
    
    const count = await linkElements.count();
    for (let i = 0; i < count; i++) {
      const element = linkElements.nth(i);
      const title = await element.locator('[data-testid="link-title"]').textContent() || '';
      const url = await element.locator('[data-testid="link-url"]').textContent() || '';
      
      links.push({ title, url, position: i });
    }
    
    return links;
  }

  /**
   * Verify link validation error
   */
  async verifyLinkValidationError(expectedError: string): Promise<void> {
    const errorElement = this.page.locator('.error-message, [role="alert"], .text-red-500');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedError);
  }

  /**
   * Download QR code
   */
  async downloadQRCode(): Promise<void> {
    if (await this.downloadButton.isVisible()) {
      const downloadPromise = this.page.waitForEvent('download');
      await this.downloadButton.click();
      const download = await downloadPromise;
      
      // Verify download started
      expect(download.suggestedFilename()).toMatch(/qr.*\.(png|jpg|jpeg|svg)$/i);
    }
  }

  /**
   * Share QR code
   */
  async shareQRCode(): Promise<string | null> {
    if (await this.shareButton.isVisible()) {
      await this.shareButton.click();
      
      // Check if native share API was used
      const sharedUrl = await this.page.evaluate(() => {
        return (window as any).lastSharedUrl || null;
      });
      
      return sharedUrl;
    }
    return null;
  }

  /**
   * Test QR code redirect
   */
  async testQRCodeRedirect(shortCode: string): Promise<void> {
    // Navigate to the QR code URL
    await this.page.goto(`/q/${shortCode}`);
    
    // Should show the QR page with links
    await this.page.waitForLoadState('networkidle');
    
    // Verify we're on the QR page
    const url = this.page.url();
    expect(url).toContain(`/q/${shortCode}`);
  }

  /**
   * Click a link on the QR page and verify analytics
   */
  async clickLinkAndVerifyAnalytics(linkTitle: string): Promise<void> {
    const linkElement = this.page.getByRole('link', { name: linkTitle });
    await expect(linkElement).toBeVisible();
    
    // Click the link (will open in new tab)
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      linkElement.click()
    ]);
    
    // Verify the new page opened correctly
    await newPage.waitForLoadState('networkidle');
    const newUrl = newPage.url();
    expect(newUrl).not.toContain('/q/'); // Should redirect away from QR page
    
    await newPage.close();
  }

  /**
   * Verify QR page displays all links correctly
   */
  async verifyQRPageLinks(expectedLinks: LinkData[]): Promise<void> {
    for (const link of expectedLinks) {
      const linkElement = this.page.getByRole('link', { name: link.title });
      await expect(linkElement).toBeVisible();
      
      // Verify the href attribute
      const href = await linkElement.getAttribute('href');
      expect(href).toBe(link.url);
    }
  }

  /**
   * Test maximum links limit
   */
  async testMaxLinksLimit(maxLinks = 5): Promise<void> {
    // Add maximum number of links
    for (let i = 1; i <= maxLinks; i++) {
      await this.addLink(`Link ${i}`, `https://example${i}.com`);
    }
    
    // Try to add one more - should fail or be disabled
    const addButton = this.addLinkButton;
    const isDisabled = await addButton.isDisabled();
    
    if (!isDisabled) {
      await addButton.click();
      // Should show error message about maximum links
      await this.verifyLinkValidationError('maximum');
    }
  }

  /**
   * Verify responsive design
   */
  async verifyResponsiveDesign(): Promise<void> {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.verifyQRCodeDisplayed();
    
    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.verifyQRCodeDisplayed();
    
    // Test desktop viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.verifyQRCodeDisplayed();
  }
}