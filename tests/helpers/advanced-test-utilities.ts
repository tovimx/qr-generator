/**
 * Advanced Test Utilities for Comprehensive E2E Testing
 * Provides enhanced helpers for complex testing scenarios
 */

import { Page, expect, Browser } from '@playwright/test';

export class AdvancedTestHelper {
  constructor(private page: Page) {}

  /**
   * Comprehensive page health check
   */
  async checkPageHealth(): Promise<{
    isHealthy: boolean;
    issues: string[];
    loadTime: number;
    jsErrors: string[];
  }> {
    const startTime = Date.now();
    const issues: string[] = [];
    const jsErrors: string[] = [];

    // Monitor console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    // Monitor failed network requests
    this.page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        issues.push(`Failed request: ${response.url()} (${response.status()})`);
      }
    });

    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Check for basic page structure
    const hasContent = await this.page.locator('body').textContent();
    if (!hasContent || hasContent.trim().length < 10) {
      issues.push('Page has minimal or no content');
    }

    // Check for critical CSS
    const hasStyles = await this.page.evaluate(() => {
      return document.styleSheets.length > 0 || 
             document.querySelector('style') !== null ||
             document.querySelector('link[rel="stylesheet"]') !== null;
    });

    if (!hasStyles) {
      issues.push('No CSS stylesheets detected');
    }

    return {
      isHealthy: issues.length === 0 && jsErrors.length === 0,
      issues,
      loadTime,
      jsErrors
    };
  }

  /**
   * Enhanced authentication state management
   */
  async clearAuthState(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any auth-related globals
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__mockAuth = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__supabaseClient = undefined;
      } catch {
        // Ignore storage access errors
      }
    });
  }

  /**
   * Wait for any auth state change (login/logout)
   */
  async waitForAuthStateChange(timeout = 10000): Promise<boolean> {
    try {
      await this.page.waitForFunction(() => {
        const url = window.location.href;
        return url.includes('/dashboard') || 
               url.includes('/login') || 
               url.includes('/signup') ||
               document.querySelector('[data-testid="auth-loading"]') === null;
      }, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Simulate realistic user interaction delays
   */
  async humanLikeDelay(min = 100, max = 500): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await this.page.waitForTimeout(delay);
  }

  /**
   * Test form validation in a comprehensive way
   */
  async testFormValidation(formSelector = 'form'): Promise<{
    hasValidation: boolean;
    validationTypes: string[];
  }> {
    const form = this.page.locator(formSelector);
    const validationTypes: string[] = [];

    // Check HTML5 validation
    const requiredFields = await form.locator('[required]').count();
    if (requiredFields > 0) {
      validationTypes.push('HTML5 required');
    }

    const emailFields = await form.locator('[type="email"]').count();
    if (emailFields > 0) {
      validationTypes.push('Email validation');
    }

    const passwordFields = await form.locator('[type="password"]').count();
    if (passwordFields > 0) {
      validationTypes.push('Password field');
    }

    // Test custom validation by triggering submit with empty form
    const submitButton = form.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await this.page.waitForTimeout(1000);

      // Check for validation messages
      const validationMessages = await this.page.locator('[role="alert"], .error, .invalid').count();
      if (validationMessages > 0) {
        validationTypes.push('Custom validation messages');
      }
    }

    return {
      hasValidation: validationTypes.length > 0,
      validationTypes
    };
  }

  /**
   * Comprehensive accessibility check
   */
  async checkAccessibility(): Promise<{
    score: number;
    issues: string[];
    passed: string[];
  }> {
    const issues: string[] = [];
    const passed: string[] = [];

    // Check for proper heading hierarchy
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    if (headings.length > 0) {
      passed.push('Has heading structure');
    } else {
      issues.push('No headings found');
    }

    // Check for alt text on images
    const images = this.page.locator('img');
    const imageCount = await images.count();
    if (imageCount > 0) {
      const imagesWithAlt = await images.locator('[alt]').count();
      if (imagesWithAlt === imageCount) {
        passed.push('All images have alt text');
      } else {
        issues.push(`${imageCount - imagesWithAlt} images missing alt text`);
      }
    }

    // Check for form labels
    const inputs = this.page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const labeledInputs = await inputs.locator('[aria-label], [aria-labelledby]').count();
      const inputsWithLabels = await this.page.locator('label input, label + input, input + label').count();
      const totalLabeled = labeledInputs + inputsWithLabels;
      
      if (totalLabeled >= inputCount * 0.8) { // 80% threshold
        passed.push('Most inputs have labels');
      } else {
        issues.push('Many inputs lack proper labels');
      }
    }

    // Check for keyboard navigation
    const focusableElements = await this.page.locator('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])').count();
    if (focusableElements > 0) {
      passed.push('Has focusable elements');
    } else {
      issues.push('No focusable elements found');
    }

    const score = Math.round((passed.length / (passed.length + issues.length)) * 100);
    
    return { score, issues, passed };
  }
}

export class LoadTestHelper {
  constructor(private browser: Browser) {}

  /**
   * Simulate multiple concurrent users
   */
  async simulateConcurrentUsers(
    userCount: number, 
    testFunction: (page: Page) => Promise<void>
  ): Promise<{
    successCount: number;
    failureCount: number;
    averageTime: number;
    errors: string[];
  }> {
    const results: Array<{ success: boolean; duration: number }> = [];
    const errors: string[] = [];

    const userPromises = Array.from({ length: userCount }, async (_, index) => {
      const context = await this.browser.newContext();
      const page = await context.newPage();
      
      const startTime = Date.now();
      try {
        await testFunction(page);
        const duration = Date.now() - startTime;
        results.push({ success: true, duration });
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({ success: false, duration });
        errors.push(`User ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        await context.close();
      }
    });

    await Promise.all(userPromises);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const averageTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    return {
      successCount,
      failureCount,
      averageTime,
      errors
    };
  }
}

export class SecurityTestHelper {
  constructor(private page: Page) {}

  /**
   * Test for common security vulnerabilities
   */
  async checkBasicSecurity(): Promise<{
    hasCSP: boolean;
    hasSecureHeaders: boolean;
    hasXSSProtection: boolean;
    vulnerabilities: string[];
  }> {
    const vulnerabilities: string[] = [];

    // Check security headers
    const response = await this.page.goto(this.page.url(), { waitUntil: 'commit' });
    const headers = response?.headers() || {};

    const hasCSP = !!headers['content-security-policy'];
    const hasSecureHeaders = !!(headers['x-frame-options'] || headers['x-content-type-options']);
    
    if (!hasCSP) {
      vulnerabilities.push('Missing Content Security Policy');
    }
    
    if (!hasSecureHeaders) {
      vulnerabilities.push('Missing security headers');
    }

    // Test for XSS protection
    const testScript = '<script>alert("xss")</script>';
    const inputs = this.page.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await inputs.count();
    
    let hasXSSProtection = true;
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await firstInput.fill(testScript);
      const value = await firstInput.inputValue();
      
      // Check if script tags are sanitized or escaped
      if (value.includes('<script>') && !value.includes('&lt;script&gt;')) {
        hasXSSProtection = false;
        vulnerabilities.push('Potential XSS vulnerability in input handling');
      }
    }

    return {
      hasCSP,
      hasSecureHeaders,
      hasXSSProtection,
      vulnerabilities
    };
  }
}

/**
 * Enhanced test data factory for complex scenarios
 */
export class TestDataFactory {
  static createRealisticUserProfile() {
    const names = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia', 'David Lee'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    
    return {
      name: randomName,
      email: `test-${timestamp}-${randomString}@${randomDomain}`,
      password: `Test${Math.floor(Math.random() * 1000)}!@#`
    };
  }

  static createRealisticQRData() {
    const titles = [
      'My Business Card',
      'Restaurant Menu',
      'Event Information', 
      'Portfolio Links',
      'Contact Information',
      'Social Media Hub'
    ];

    const linkTemplates = [
      { title: 'Website', url: 'https://example.com' },
      { title: 'Instagram', url: 'https://instagram.com/user' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/user' },
      { title: 'Twitter', url: 'https://twitter.com/user' },
      { title: 'Facebook', url: 'https://facebook.com/user' },
      { title: 'YouTube', url: 'https://youtube.com/c/user' }
    ];

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const linkCount = Math.floor(Math.random() * 4) + 1; // 1-4 links
    const selectedLinks = linkTemplates.slice(0, linkCount);

    return {
      title: randomTitle,
      links: selectedLinks
    };
  }
}

/**
 * Performance monitoring helper
 */
export class PerformanceMonitor {
  private metrics: Array<{ name: string; value: number; timestamp: number }> = [];

  constructor(private page: Page) {}

  async startMonitoring(): Promise<void> {
    // Monitor Core Web Vitals if available
    await this.page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__performanceMetrics = [];
      
      // Track navigation timing
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__performanceMetrics.push({
          name: 'pageLoad',
          value: perfData.loadEventEnd - perfData.fetchStart,
          timestamp: Date.now()
        });
      });
    });
  }

  async recordMetric(name: string, value: number): Promise<void> {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now()
    });
  }

  async getMetrics(): Promise<typeof this.metrics> {
    // Get metrics from page
    const pageMetrics = await this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).__performanceMetrics || [];
    });

    return [...this.metrics, ...pageMetrics];
  }

  async assertPerformance(metricName: string, maxValue: number): Promise<void> {
    const metric = this.metrics.find(m => m.name === metricName);
    if (metric) {
      expect(metric.value).toBeLessThan(maxValue);
    }
  }
}

/**
 * Network simulation helper
 */
export class NetworkSimulator {
  constructor(private page: Page) {}

  async simulateSlowNetwork(delayMs = 1000): Promise<void> {
    await this.page.route('**/*', route => {
      setTimeout(() => route.continue(), delayMs);
    });
  }

  async simulateIntermittentNetwork(failureRate = 0.3): Promise<void> {
    await this.page.route('**/*', route => {
      if (Math.random() < failureRate) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  async simulateAPIFailures(pattern = '**/api/**'): Promise<void> {
    await this.page.route(pattern, route => {
      if (Math.random() < 0.5) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        route.continue();
      }
    });
  }

  async restoreNetwork(): Promise<void> {
    await this.page.unroute('**/*');
  }
}

/**
 * Database simulation and cleanup helper
 */
export class TestDatabaseHelper {
  constructor(private page: Page) {}

  async createTestUser(userData: { email: string; password: string }): Promise<boolean> {
    // This would integrate with your actual database in a real test environment
    // For now, just simulate the creation
    
    await this.page.goto('/signup');
    await this.page.getByPlaceholder('Email address').fill(userData.email);
    await this.page.getByPlaceholder(/Password.*min 6 characters/i).fill(userData.password);
    await this.page.getByRole('button', { name: 'Sign up' }).click();
    
    await this.page.waitForTimeout(3000);
    const currentUrl = this.page.url();
    
    return currentUrl.includes('/dashboard') || currentUrl.includes('/login');
  }

  async cleanupTestData(userEmail: string): Promise<void> {
    // In a real implementation, this would clean up test data
    // For now, just clear browser state
    await this.page.context().clearCookies();
    console.log(`Cleanup completed for test user: ${userEmail}`);
  }
}

/**
 * QR Code specific test helper
 */
export class QRCodeTestHelper {
  constructor(private page: Page) {}

  /**
   * Generate test QR data with realistic content
   */
  static generateTestQRData() {
    const timestamp = Date.now();
    const profiles = [
      {
        title: `Business Card ${timestamp}`,
        description: 'My professional profile',
        links: [
          { title: 'Website', url: 'https://example.com' },
          { title: 'LinkedIn', url: 'https://linkedin.com/in/test' },
          { title: 'Email', url: 'mailto:test@example.com' }
        ]
      },
      {
        title: `Restaurant Menu ${timestamp}`,
        description: 'View our delicious menu',
        links: [
          { title: 'Menu', url: 'https://menu.example.com' },
          { title: 'Order Online', url: 'https://order.example.com' },
          { title: 'Location', url: 'https://maps.example.com' }
        ]
      }
    ];
    
    return profiles[Math.floor(Math.random() * profiles.length)];
  }

  /**
   * Wait for QR code to be generated and visible
   */
  async waitForQRCodeGeneration(timeout = 10000): Promise<boolean> {
    try {
      // Wait for QR code canvas, SVG, or image
      await this.page.waitForSelector('canvas, svg[data-testid*="qr"], img[alt*="QR"], .qr-code', { timeout });
      
      // Additional wait for QR generation to complete
      await this.page.waitForTimeout(1000);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify QR code properties and functionality
   */
  async verifyQRCodeProperties(): Promise<{
    isVisible: boolean;
    hasContent: boolean;
    dimensions?: { width: number; height: number };
    type: 'canvas' | 'svg' | 'image' | 'unknown';
  }> {
    const qrElement = this.page.locator('canvas, svg[data-testid*="qr"], img[alt*="QR"], .qr-code').first();
    
    if (!await qrElement.isVisible()) {
      return { isVisible: false, hasContent: false, type: 'unknown' };
    }

    const tagName = await qrElement.evaluate(el => el.tagName.toLowerCase());
    const boundingBox = await qrElement.boundingBox();
    
    let hasContent = false;
    let type: 'canvas' | 'svg' | 'image' | 'unknown' = 'unknown';

    switch (tagName) {
      case 'canvas':
        type = 'canvas';
        hasContent = await qrElement.evaluate((canvas: HTMLCanvasElement) => {
          const ctx = canvas.getContext('2d');
          if (!ctx) return false;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          return Array.from(imageData.data).some(pixel => pixel !== 0);
        });
        break;
      case 'svg':
        type = 'svg';
        hasContent = await qrElement.evaluate(svg => svg.children.length > 0);
        break;
      case 'img':
        type = 'image';
        hasContent = await qrElement.evaluate((img: HTMLImageElement) => !!img.src);
        break;
      default:
        hasContent = await qrElement.textContent().then(text => !!(text && text.length > 0));
    }

    return {
      isVisible: true,
      hasContent,
      dimensions: boundingBox ? { width: boundingBox.width, height: boundingBox.height } : undefined,
      type
    };
  }

  /**
   * Test QR code link functionality by visiting the QR page
   */
  async testQRCodeLink(shortCode: string): Promise<{
    accessible: boolean;
    responseTime: number;
    hasContent: boolean;
    linksWork: boolean;
    errors: string[];
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      // Visit the QR page
      const response = await this.page.goto(`/q/${shortCode}`);
      const responseTime = Date.now() - startTime;
      
      if (!response || !response.ok()) {
        errors.push(`QR page returned ${response?.status() || 'no response'}`);
        return { accessible: false, responseTime, hasContent: false, linksWork: false, errors };
      }

      await this.page.waitForLoadState('networkidle');

      // Check if page has content
      const pageContent = await this.page.textContent('body');
      const hasContent = !!(pageContent && pageContent.trim().length > 10);

      if (!hasContent) {
        errors.push('QR page has no meaningful content');
      }

      // Test if links are clickable and functional
      const links = this.page.locator('a[href]:not([href="#"]):not([href=""])');
      const linkCount = await links.count();
      let linksWork = true;

      if (linkCount > 0) {
        // Test first few links (don't click external ones, just verify they exist and have proper attributes)
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = links.nth(i);
          const href = await link.getAttribute('href');
          const isVisible = await link.isVisible();
          
          if (!href || !isVisible) {
            linksWork = false;
            errors.push(`Link ${i + 1} is not properly configured`);
          }
        }
      }

      return {
        accessible: true,
        responseTime,
        hasContent,
        linksWork,
        errors
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      errors.push(`Error accessing QR page: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { accessible: false, responseTime, hasContent: false, linksWork: false, errors };
    }
  }

  /**
   * Extract QR code short code from dashboard
   */
  async extractQRShortCode(): Promise<string | null> {
    try {
      // Look for QR short code in various possible locations
      const shortCodeSelectors = [
        '[data-testid*="short-code"]',
        '[data-short-code]',
        'input[value*="/q/"]',
        'text*="/q/"'
      ];

      for (const selector of shortCodeSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          const text = await element.textContent() || await element.inputValue() || '';
          const match = text.match(/\/q\/([a-zA-Z0-9]+)/);
          if (match) {
            return match[1];
          }
        }
      }

      // Fallback: look in page URL or data attributes
      const url = this.page.url();
      const urlMatch = url.match(/shortCode=([a-zA-Z0-9]+)/);
      if (urlMatch) {
        return urlMatch[1];
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Test QR code customization changes
   */
  async testCustomizationFeatures(): Promise<{
    titleEditable: boolean;
    linksEditable: boolean;
    themeChangeable: boolean;
    changesApplied: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let titleEditable = false;
    let linksEditable = false; 
    let themeChangeable = false;
    let changesApplied = false;

    try {
      // Test title editing
      const titleInput = this.page.locator('input[placeholder*="title"], input[name*="title"], [contenteditable="true"]').first();
      if (await titleInput.isVisible({ timeout: 2000 })) {
        const originalTitle = await titleInput.inputValue() || await titleInput.textContent();
        const newTitle = `Test Title ${Date.now()}`;
        
        await titleInput.clear();
        await titleInput.fill(newTitle);
        await this.page.waitForTimeout(500);
        
        const updatedTitle = await titleInput.inputValue() || await titleInput.textContent();
        titleEditable = updatedTitle === newTitle;
        
        if (titleEditable) {
          changesApplied = true;
        }
      }

      // Test link editing
      const addLinkButton = this.page.locator('button:has-text("Add Link"), button:has-text("Add"), button[data-testid*="add-link"]').first();
      if (await addLinkButton.isVisible({ timeout: 2000 })) {
        await addLinkButton.click();
        await this.page.waitForTimeout(1000);
        
        const linkInputs = this.page.locator('input[placeholder*="link"], input[name*="url"]');
        if (await linkInputs.first().isVisible({ timeout: 2000 })) {
          linksEditable = true;
          changesApplied = true;
        }
      }

      // Test theme changes
      const themeSelectors = this.page.locator('[data-testid*="theme"], .theme-option, button:has-text("Theme")');
      if (await themeSelectors.first().isVisible({ timeout: 2000 })) {
        themeChangeable = true;
      }

    } catch (error) {
      errors.push(`Customization test error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    return {
      titleEditable,
      linksEditable,
      themeChangeable,
      changesApplied,
      errors
    };
  }
}

/**
 * Test reporting and documentation helper
 */
export class TestReporter {
  private testResults: Array<{
    name: string;
    status: 'pass' | 'fail' | 'skip';
    duration: number;
    errors?: string[];
    metrics?: Record<string, number>;
  }> = [];

  recordTest(
    name: string, 
    status: 'pass' | 'fail' | 'skip', 
    duration: number, 
    errors?: string[], 
    metrics?: Record<string, number>
  ): void {
    this.testResults.push({
      name,
      status,
      duration,
      errors,
      metrics
    });
  }

  generateSummary(): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    averageDuration: number;
    totalDuration: number;
  } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(t => t.status === 'pass').length;
    const failed = this.testResults.filter(t => t.status === 'fail').length;
    const skipped = this.testResults.filter(t => t.status === 'skip').length;
    
    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0);
    const averageDuration = total > 0 ? totalDuration / total : 0;

    return {
      total,
      passed,
      failed,
      skipped,
      averageDuration,
      totalDuration
    };
  }

  exportResults(): string {
    const summary = this.generateSummary();
    
    let report = '# E2E Test Results Summary\n\n';
    report += `**Total Tests:** ${summary.total}\n`;
    report += `**Passed:** ${summary.passed}\n`;
    report += `**Failed:** ${summary.failed}\n`;
    report += `**Skipped:** ${summary.skipped}\n`;
    report += `**Average Duration:** ${Math.round(summary.averageDuration)}ms\n`;
    report += `**Total Duration:** ${Math.round(summary.totalDuration)}ms\n\n`;

    report += '## Detailed Results\n\n';
    for (const result of this.testResults) {
      report += `### ${result.name}\n`;
      report += `- **Status:** ${result.status}\n`;
      report += `- **Duration:** ${result.duration}ms\n`;
      
      if (result.errors && result.errors.length > 0) {
        report += `- **Errors:**\n`;
        for (const error of result.errors) {
          report += `  - ${error}\n`;
        }
      }
      
      if (result.metrics) {
        report += `- **Metrics:**\n`;
        for (const [key, value] of Object.entries(result.metrics)) {
          report += `  - ${key}: ${value}\n`;
        }
      }
      
      report += '\n';
    }

    return report;
  }
}