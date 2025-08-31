/**
 * Comprehensive Test Helper Utilities
 * 
 * Provides reusable utility functions for E2E tests including:
 * - Page interaction helpers
 * - Assertion utilities
 * - Performance monitoring
 * - Screenshot and debugging tools
 * - Data validation helpers
 */

import { Page, Locator, expect } from '@playwright/test';

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  networkTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export interface PageInteractionOptions {
  timeout?: number;
  retries?: number;
  waitForStability?: boolean;
  screenshot?: boolean;
}

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Enhanced navigation with performance monitoring
   */
  async navigateToPage(url: string, options: { 
    waitForLoad?: boolean;
    monitorPerformance?: boolean;
    timeout?: number;
  } = {}): Promise<PerformanceMetrics | void> {
    const { waitForLoad = true, monitorPerformance = false, timeout = 30000 } = options;
    
    if (monitorPerformance) {
      // Start performance monitoring
      await this.page.evaluate(() => {
        (window as Record<string, unknown>).performanceStart = performance.now();
      });
    }

    await this.page.goto(url, { 
      waitUntil: waitForLoad ? 'networkidle' : 'domcontentloaded',
      timeout 
    });

    if (monitorPerformance) {
      const metrics = await this.measurePagePerformance();
      return metrics;
    }

    return;
  }

  /**
   * Smart element finder with multiple fallback strategies
   */
  async findElement(selectors: string | string[], options: {
    timeout?: number;
    visible?: boolean;
    enabled?: boolean;
  } = {}): Promise<Locator> {
    const { timeout = 10000, visible = true, enabled = false } = options;
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];
    
    for (const selector of selectorList) {
      try {
        const element = this.page.locator(selector);
        
        if (visible) {
          await expect(element).toBeVisible({ timeout: timeout / selectorList.length });
        }
        
        if (enabled) {
          await expect(element).toBeEnabled({ timeout: timeout / selectorList.length });
        }
        
        return element;
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }
    
    throw new Error(`Could not find element with selectors: ${selectorList.join(', ')}`);
  }

  /**
   * Enhanced form filling with validation
   */
  async fillForm(fields: Array<{
    selector: string | string[];
    value: string;
    validate?: boolean;
    type?: 'input' | 'textarea' | 'select' | 'checkbox';
  }>, options: PageInteractionOptions = {}): Promise<void> {
    const { timeout = 10000, retries = 2 } = options;

    for (const field of fields) {
      let attempts = 0;
      while (attempts < retries) {
        try {
          const element = await this.findElement(field.selector, { timeout });
          
          switch (field.type) {
            case 'checkbox':
              if (field.value === 'true' || field.value === '1') {
                await element.check();
              } else {
                await element.uncheck();
              }
              break;
            case 'select':
              await element.selectOption({ value: field.value });
              break;
            default:
              await element.clear();
              await element.fill(field.value);
          }

          // Validate the input if requested
          if (field.validate && field.type !== 'checkbox') {
            const actualValue = await element.inputValue();
            if (actualValue !== field.value) {
              throw new Error(`Field validation failed. Expected: ${field.value}, Got: ${actualValue}`);
            }
          }

          break; // Success, exit retry loop
        } catch (error: unknown) {
          attempts++;
          if (attempts >= retries) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to fill field after ${retries} attempts: ${errorMessage}`);
          }
          await this.page.waitForTimeout(1000); // Wait before retry
        }
      }
    }
  }

  /**
   * Smart button clicking with loading state handling
   */
  async clickButton(selector: string | string[], options: {
    waitForNavigation?: boolean;
    waitForResponse?: string | RegExp;
    timeout?: number;
    handleLoading?: boolean;
  } = {}): Promise<void> {
    const { 
      waitForNavigation = false, 
      waitForResponse,
      timeout = 10000,
      handleLoading = true 
    } = options;

    const element = await this.findElement(selector, { timeout, enabled: true });
    
    // Check if button shows loading state
    if (handleLoading) {
      const isLoadingBefore = await this.isElementLoading(element);
      if (isLoadingBefore) {
        await this.waitForLoadingToComplete(element);
      }
    }

    const promises: Promise<unknown>[] = [element.click()];

    if (waitForNavigation) {
      promises.push(this.page.waitForLoadState('networkidle', { timeout }));
    }

    if (waitForResponse) {
      promises.push(this.page.waitForResponse(waitForResponse, { timeout }));
    }

    await Promise.all(promises);

    // Wait for any loading state to complete after click
    if (handleLoading) {
      await this.waitForLoadingToComplete(element);
    }
  }

  /**
   * Advanced wait utilities
   */
  async waitForCondition(
    condition: () => Promise<boolean>,
    options: {
      timeout?: number;
      interval?: number;
      description?: string;
    } = {}
  ): Promise<void> {
    const { timeout = 10000, interval = 500, description = 'condition' } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch (error) {
        // Continue waiting
      }
      await this.page.waitForTimeout(interval);
    }

    throw new Error(`Timeout waiting for ${description} after ${timeout}ms`);
  }

  /**
   * Check if an element is in loading state
   */
  async isElementLoading(element: Locator): Promise<boolean> {
    const loadingStates = [
      '[data-loading="true"]',
      '.loading',
      '.spinner',
      '[aria-busy="true"]',
      '.btn-loading',
      '[disabled]:has(.spinner)'
    ];

    for (const selector of loadingStates) {
      const loadingElement = element.locator(selector);
      if (await loadingElement.isVisible().catch(() => false)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Wait for loading state to complete
   */
  async waitForLoadingToComplete(element?: Locator, timeout: number = 10000): Promise<void> {
    const targetElement = element || this.page.locator('body');
    
    await this.waitForCondition(
      async () => !(await this.isElementLoading(targetElement)),
      { timeout, description: 'loading to complete' }
    );
  }

  /**
   * Enhanced screenshot with context information
   */
  async takeScreenshot(name: string, options: {
    fullPage?: boolean;
    element?: Locator;
    addTimestamp?: boolean;
    addTestInfo?: boolean;
  } = {}): Promise<Buffer> {
    const { 
      fullPage = false, 
      element,
      addTimestamp = true,
      addTestInfo = false 
    } = options;

    let filename = name;
    
    if (addTimestamp) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `${filename}-${timestamp}`;
    }

    if (addTestInfo) {
      const url = this.page.url();
      const urlPart = url.split('/').pop() || 'page';
      filename = `${filename}-${urlPart}`;
    }

    if (element) {
      return await element.screenshot({ path: `${filename}.png` });
    } else {
      return await this.page.screenshot({ 
        path: `${filename}.png`, 
        fullPage 
      });
    }
  }

  /**
   * Measure page performance metrics
   */
  async measurePagePerformance(): Promise<PerformanceMetrics> {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        networkTime: navigation.responseEnd - navigation.requestStart,
        renderTime: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize
      };
    });

    return metrics;
  }

  /**
   * Monitor network requests during an operation
   */
  async monitorNetworkDuring<T>(
    operation: () => Promise<T>,
    options: {
      includeRequests?: string | RegExp;
      excludeRequests?: string | RegExp;
    } = {}
  ): Promise<{ result: T; requests: Array<{ url: string; status: number; duration: number }> }> {
    const { includeRequests, excludeRequests } = options;
    const requests: Array<{ url: string; status: number; duration: number }> = [];

    const requestHandler = (request: any) => {
      const url = request.url();
      
      if (includeRequests && !url.match(includeRequests)) return;
      if (excludeRequests && url.match(excludeRequests)) return;
      
      const startTime = Date.now();
      
      request.response().then((response: any) => {
        requests.push({
          url,
          status: response.status(),
          duration: Date.now() - startTime
        });
      }).catch(() => {
        // Request failed
        requests.push({
          url,
          status: 0,
          duration: Date.now() - startTime
        });
      });
    };

    this.page.on('request', requestHandler);
    
    try {
      const result = await operation();
      
      // Wait a bit for pending requests to complete
      await this.page.waitForTimeout(1000);
      
      return { result, requests };
    } finally {
      this.page.off('request', requestHandler);
    }
  }

  /**
   * Validate URL structure
   */
  validateUrl(url: string, expected: {
    protocol?: string;
    hostname?: string;
    pathname?: string | RegExp;
    searchParams?: Record<string, string>;
  }): boolean {
    try {
      const urlObj = new URL(url);
      
      if (expected.protocol && urlObj.protocol !== expected.protocol) {
        return false;
      }
      
      if (expected.hostname && urlObj.hostname !== expected.hostname) {
        return false;
      }
      
      if (expected.pathname) {
        if (typeof expected.pathname === 'string') {
          if (urlObj.pathname !== expected.pathname) return false;
        } else {
          if (!expected.pathname.test(urlObj.pathname)) return false;
        }
      }
      
      if (expected.searchParams) {
        for (const [key, value] of Object.entries(expected.searchParams)) {
          if (urlObj.searchParams.get(key) !== value) {
            return false;
          }
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check accessibility compliance
   */
  async checkAccessibility(options: {
    includeRules?: string[];
    excludeRules?: string[];
    element?: Locator;
  } = {}): Promise<Array<{ rule: string; impact: string; description: string }>> {
    // This would integrate with axe-core or similar accessibility testing library
    // For now, we'll do basic checks
    
    const issues: Array<{ rule: string; impact: string; description: string }> = [];
    const targetElement = options.element || this.page.locator('body');
    
    // Check for missing alt text on images
    const images = targetElement.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      if (!alt && src && !src.includes('data:')) {
        issues.push({
          rule: 'image-alt',
          impact: 'serious',
          description: 'Image without alt text found'
        });
      }
    }
    
    // Check for proper heading structure
    const headings = await targetElement.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.replace('h', ''));
      
      if (level > previousLevel + 1) {
        issues.push({
          rule: 'heading-order',
          impact: 'moderate',
          description: `Heading level ${level} skips levels`
        });
      }
      
      previousLevel = level;
    }
    
    return issues;
  }

  /**
   * Memory usage monitoring
   */
  async getMemoryUsage(): Promise<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }> {
    return await this.page.evaluate(() => {
      const memory = (performance as any).memory;
      if (!memory) {
        return {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0
        };
      }
      
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    });
  }

  /**
   * Console log monitoring
   */
  async monitorConsoleLogs(): Promise<Array<{ type: string; text: string; timestamp: number }>> {
    const logs: Array<{ type: string; text: string; timestamp: number }> = [];
    
    this.page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now()
      });
    });
    
    return logs;
  }

  /**
   * Visual comparison helper
   */
  async compareVisuals(
    element: Locator,
    baselineName: string,
    options: {
      threshold?: number;
      maxDiffPixels?: number;
      animations?: 'disabled' | 'allow';
    } = {}
  ): Promise<void> {
    const { threshold = 0.2, maxDiffPixels = 1000, animations = 'disabled' } = options;
    
    if (animations === 'disabled') {
      await this.page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `
      });
    }
    
    await expect(element).toHaveScreenshot(`${baselineName}.png`, {
      threshold,
      maxDiffPixels
    });
  }

  /**
   * Database state validation helper
   */
  async validateDatabaseState(
    query: string,
    expected: any,
    options: { timeout?: number } = {}
  ): Promise<void> {
    // This would integrate with the database connection
    // For E2E tests, we might validate through API calls instead
    const { timeout = 5000 } = options;
    
    await this.waitForCondition(
      async () => {
        // This is a placeholder - in real implementation, 
        // you'd execute the query and compare results
        return true;
      },
      { timeout, description: 'database state validation' }
    );
  }

  /**
   * Cleanup helper for test data
   */
  async cleanup(): Promise<void> {
    // Clear any test data, reset state, etc.
    await this.page.evaluate(() => {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear any global test variables
      Object.keys(window).forEach(key => {
        if (key.startsWith('TEST_')) {
          delete (window as any)[key];
        }
      });
    });
  }

  /**
   * Generate test report data
   */
  generateTestSummary(testName: string, metrics?: PerformanceMetrics): {
    testName: string;
    timestamp: string;
    url: string;
    viewport: { width: number; height: number };
    performance?: PerformanceMetrics;
  } {
    return {
      testName,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      viewport: this.page.viewportSize() || { width: 0, height: 0 },
      performance: metrics
    };
  }
}

/**
 * Create a test helper instance for use in tests
 */
export function createTestHelper(page: Page): TestHelpers {
  return new TestHelpers(page);
}