/**
 * Test Data Factory for QR Generator App
 * Provides reusable test data generation and setup utilities
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

export interface TestQRCode {
  title: string;
  shortCode?: string;
  links: TestLink[];
  theme?: string;
  description?: string;
}

export interface TestLink {
  title: string;
  url: string;
  position?: number;
  isActive?: boolean;
}

export interface TestProject {
  name: string;
  description?: string;
  qrCodes?: TestQRCode[];
}

/**
 * Factory for creating test users with various configurations
 */
export class UserFactory {
  private static userCounter = 0;

  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    this.userCounter++;
    const timestamp = Date.now();
    
    return {
      email: `test.user.${this.userCounter}.${timestamp}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${this.userCounter}`,
      ...overrides
    };
  }

  static createBusinessUser(): TestUser {
    return this.createUser({
      email: `business.${Date.now()}@company.com`,
      name: 'Business Manager'
    });
  }

  static createFreelancerUser(): TestUser {
    return this.createUser({
      email: `freelancer.${Date.now()}@portfolio.com`,
      name: 'Freelance Developer'
    });
  }

  static createEventOrganizerUser(): TestUser {
    return this.createUser({
      email: `organizer.${Date.now()}@events.com`,
      name: 'Event Organizer'
    });
  }

  static createInvalidUser(): TestUser {
    return {
      email: 'invalid-email-format',
      password: '123',
      name: 'Invalid User'
    };
  }
}

/**
 * Factory for creating test QR codes with various configurations
 */
export class QRCodeFactory {
  private static qrCounter = 0;

  static createBasicQR(overrides: Partial<TestQRCode> = {}): TestQRCode {
    this.qrCounter++;
    
    return {
      title: `Test QR Code ${this.qrCounter}`,
      links: [],
      ...overrides
    };
  }

  static createBusinessCardQR(): TestQRCode {
    return this.createBasicQR({
      title: 'Business Card QR',
      links: [
        { title: 'Company Website', url: 'https://company.com' },
        { title: 'LinkedIn Profile', url: 'https://linkedin.com/in/business' },
        { title: 'Email Contact', url: 'mailto:contact@company.com' },
        { title: 'Phone', url: 'tel:+1234567890' }
      ]
    });
  }

  static createRestaurantMenuQR(): TestQRCode {
    return this.createBasicQR({
      title: 'Bella Vista Restaurant',
      links: [
        { title: 'View Menu', url: 'https://restaurant.com/menu' },
        { title: 'Make Reservation', url: 'https://opentable.com/restaurant' },
        { title: 'Order Online', url: 'https://ubereats.com/restaurant' },
        { title: 'Contact Us', url: 'tel:+1234567890' },
        { title: 'Leave Review', url: 'https://google.com/maps/restaurant' }
      ]
    });
  }

  static createEventQR(): TestQRCode {
    return this.createBasicQR({
      title: 'Tech Conference 2024',
      links: [
        { title: 'Register for Event', url: 'https://eventbrite.com/tech-conference' },
        { title: 'Event Schedule', url: 'https://conference.com/schedule' },
        { title: 'Venue Information', url: 'https://venue.com/location' },
        { title: 'Contact Organizer', url: 'mailto:organizer@conference.com' }
      ]
    });
  }

  static createPortfolioQR(): TestQRCode {
    return this.createBasicQR({
      title: 'Jane Doe - Web Developer',
      links: [
        { title: 'Portfolio Website', url: 'https://janedoe.dev' },
        { title: 'GitHub Profile', url: 'https://github.com/janedoe' },
        { title: 'LinkedIn', url: 'https://linkedin.com/in/janedoe' },
        { title: 'Email Contact', url: 'mailto:jane@janedoe.dev' }
      ]
    });
  }

  static createMaxLinksQR(): TestQRCode {
    const links: TestLink[] = [];
    for (let i = 1; i <= 5; i++) {
      links.push({
        title: `Link ${i}`,
        url: `https://example${i}.com`,
        position: i
      });
    }

    return this.createBasicQR({
      title: 'Maximum Links QR',
      links
    });
  }

  static createLongContentQR(): TestQRCode {
    return this.createBasicQR({
      title: 'Very Long QR Code Title That Tests Character Limits And Display Issues In Various Layouts',
      links: [
        {
          title: 'Very Long Link Title That Tests Display Layout And Truncation Behavior',
          url: 'https://very-long-domain-name-for-testing-purposes.com/very/long/path/that/might/cause/layout/issues?parameter=value&another=parameter&third=parameter'
        },
        {
          title: 'Another Extremely Long Link Title For Testing Edge Cases',
          url: 'https://another-very-long-domain-name.com/extremely/long/path/structure'
        }
      ]
    });
  }
}

/**
 * Factory for creating test links with various configurations
 */
export class LinkFactory {
  static createWebsiteLink(title: string = 'Website', domain: string = 'example.com'): TestLink {
    return {
      title,
      url: `https://${domain}`,
      isActive: true
    };
  }

  static createSocialMediaLinks(): TestLink[] {
    return [
      { title: 'Twitter', url: 'https://twitter.com/handle' },
      { title: 'Facebook', url: 'https://facebook.com/page' },
      { title: 'Instagram', url: 'https://instagram.com/profile' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/profile' },
      { title: 'YouTube', url: 'https://youtube.com/channel' }
    ];
  }

  static createContactLinks(): TestLink[] {
    return [
      { title: 'Email', url: 'mailto:contact@example.com' },
      { title: 'Phone', url: 'tel:+1234567890' },
      { title: 'WhatsApp', url: 'https://wa.me/1234567890' },
      { title: 'Telegram', url: 'https://t.me/username' }
    ];
  }

  static createInvalidLinks(): TestLink[] {
    return [
      { title: 'Invalid URL', url: 'not-a-valid-url' },
      { title: 'Empty Title', url: 'https://example.com' },
      { title: 'JavaScript Protocol', url: 'javascript:alert("XSS")' },
      { title: 'Data Protocol', url: 'data:text/html,<script>alert("XSS")</script>' }
    ];
  }

  static createMaliciousLinks(): TestLink[] {
    return [
      { title: '<script>alert("XSS")</script>', url: 'https://example.com' },
      { title: 'Malicious Link', url: 'javascript:void(0)' },
      { title: 'SQL Injection"; DROP TABLE users; --', url: 'https://example.com' }
    ];
  }
}

/**
 * Factory for creating test projects
 */
export class ProjectFactory {
  private static projectCounter = 0;

  static createProject(overrides: Partial<TestProject> = {}): TestProject {
    this.projectCounter++;
    
    return {
      name: `Test Project ${this.projectCounter}`,
      description: `Description for test project ${this.projectCounter}`,
      qrCodes: [],
      ...overrides
    };
  }

  static createBusinessProject(): TestProject {
    return this.createProject({
      name: 'Business Campaign',
      description: 'QR codes for business marketing campaign',
      qrCodes: [
        QRCodeFactory.createBusinessCardQR(),
        QRCodeFactory.createEventQR()
      ]
    });
  }
}

/**
 * Utility class for setting up test scenarios
 */
export class TestScenarioBuilder {
  constructor(private page: Page) {}

  async createUserWithQRCode(userType: 'basic' | 'business' | 'freelancer' | 'event' = 'basic'): Promise<{
    user: TestUser;
    qrCode: TestQRCode;
  }> {
    let user: TestUser;
    let qrCode: TestQRCode;

    switch (userType) {
      case 'business':
        user = UserFactory.createBusinessUser();
        qrCode = QRCodeFactory.createBusinessCardQR();
        break;
      case 'freelancer':
        user = UserFactory.createFreelancerUser();
        qrCode = QRCodeFactory.createPortfolioQR();
        break;
      case 'event':
        user = UserFactory.createEventOrganizerUser();
        qrCode = QRCodeFactory.createEventQR();
        break;
      default:
        user = UserFactory.createUser();
        qrCode = QRCodeFactory.createBasicQR();
    }

    return { user, qrCode };
  }

  async setupCompleteQRCode(qrCode: TestQRCode): Promise<void> {
    // Update title
    const titleInput = this.page.getByRole('textbox', { name: /title/i });
    await titleInput.fill(qrCode.title);
    await this.page.keyboard.press('Enter');

    // Add all links
    for (const link of qrCode.links) {
      await this.page.getByRole('button', { name: /add link/i }).click();
      await this.page.getByPlaceholder(/title/i).fill(link.title);
      await this.page.getByPlaceholder(/url/i).fill(link.url);
      await this.page.getByRole('button', { name: /save/i }).click();
      await this.page.waitForTimeout(200); // Allow UI to update
    }
  }

  async createMaximumDataScenario(): Promise<void> {
    const qrCode = QRCodeFactory.createLongContentQR();
    await this.setupCompleteQRCode(qrCode);
  }

  async createPerformanceTestScenario(): Promise<void> {
    const qrCode = QRCodeFactory.createMaxLinksQR();
    await this.setupCompleteQRCode(qrCode);
  }
}

/**
 * Utility class for test data cleanup
 */
export class TestDataCleanup {
  static testEmails: string[] = [];
  static testShortCodes: string[] = [];

  static registerTestEmail(email: string): void {
    this.testEmails.push(email);
  }

  static registerTestShortCode(shortCode: string): void {
    this.testShortCodes.push(shortCode);
  }

  static async cleanupTestData(page: Page): Promise<void> {
    // This would typically make API calls to clean up test data
    // For now, we'll just clear the registered data
    
    for (const email of this.testEmails) {
      // In a real implementation, you might call an API endpoint to delete the user
      console.log(`Cleanup: Would delete user with email ${email}`);
    }

    for (const shortCode of this.testShortCodes) {
      // In a real implementation, you might call an API endpoint to delete the QR code
      console.log(`Cleanup: Would delete QR code with short code ${shortCode}`);
    }

    // Clear the arrays
    this.testEmails = [];
    this.testShortCodes = [];
  }
}

/**
 * Utility class for test assertions and validations
 */
export class TestValidationHelper {
  constructor(private page: Page) {}

  async validateQRCodeStructure(expectedQRCode: TestQRCode): Promise<void> {
    // Validate title
    const titleInput = this.page.getByRole('textbox', { name: /title/i });
    const actualTitle = await titleInput.inputValue();
    if (actualTitle !== expectedQRCode.title) {
      throw new Error(`Expected title "${expectedQRCode.title}", but got "${actualTitle}"`);
    }

    // Validate links count
    const linkElements = this.page.locator('[data-testid="link-item"], .link-item');
    const actualLinkCount = await linkElements.count();
    const expectedLinkCount = expectedQRCode.links.length;
    
    if (actualLinkCount !== expectedLinkCount) {
      throw new Error(`Expected ${expectedLinkCount} links, but found ${actualLinkCount}`);
    }

    // Validate each link
    for (let i = 0; i < expectedQRCode.links.length; i++) {
      const expectedLink = expectedQRCode.links[i];
      const linkElement = linkElements.nth(i);
      
      const linkText = await linkElement.textContent();
      if (!linkText?.includes(expectedLink.title)) {
        throw new Error(`Expected link "${expectedLink.title}" not found at position ${i}`);
      }
    }
  }

  async validateQRPageStructure(expectedLinks: TestLink[]): Promise<void> {
    for (const expectedLink of expectedLinks) {
      const linkElement = this.page.getByRole('link', { name: expectedLink.title });
      const href = await linkElement.getAttribute('href');
      
      if (href !== expectedLink.url) {
        throw new Error(`Expected link "${expectedLink.title}" to have href "${expectedLink.url}", but got "${href}"`);
      }
    }
  }

  async validateAccessibility(): Promise<void> {
    // Check for basic accessibility requirements
    const h1Count = await this.page.locator('h1').count();
    if (h1Count === 0) {
      throw new Error('Page should have at least one h1 element');
    }

    const interactiveElements = this.page.locator('button, a, input, [tabindex="0"]');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = interactiveElements.nth(i);
      const ariaLabel = await element.getAttribute('aria-label');
      const textContent = await element.textContent();
      
      if (!ariaLabel && !textContent?.trim()) {
        throw new Error(`Interactive element at index ${i} lacks accessible text`);
      }
    }
  }
}

/**
 * Performance measurement utilities
 */
export class PerformanceTestHelper {
  constructor(private page: Page) {}

  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async measureQRCodeGenerationTime(): Promise<number> {
    const startTime = Date.now();
    await this.page.locator('canvas').waitFor({ state: 'visible' });
    return Date.now() - startTime;
  }

  async measureMemoryUsage(): Promise<Record<string, number> | null> {
    return await this.page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as unknown as {memory: Record<string, number>})['memory'];
      }
      return null;
    });
  }

  async measureNetworkRequests(): Promise<number> {
    let requestCount = 0;
    
    this.page.on('request', () => {
      requestCount++;
    });
    
    await this.page.waitForTimeout(1000);
    return requestCount;
  }
}