/**
 * Performance testing utilities for E2E tests
 * Measures page load times, API response times, and user interaction performance
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay?: number;
  networkRequests: number;
  totalTransferSize: number;
}

export interface ApiPerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  transferSize: number;
  status: number;
}

/**
 * Performance measurement helper
 */
export class PerformanceHelper {
  private metrics: PerformanceMetrics[] = [];
  private apiMetrics: ApiPerformanceMetrics[] = [];

  constructor(private page: Page) {}

  /**
   * Start performance monitoring
   */
  async startMonitoring(): Promise<void> {
    // Enable performance tracking
    await this.page.addInitScript(() => {
      // Store performance data on window for later retrieval
      (window as any).performanceData = {
        navigationStart: Date.now(),
        requests: []
      };

      // Monitor network requests
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).performanceData.requests.push({
            name: entry.name,
            duration: entry.duration,
            transferSize: (entry as any).transferSize || 0,
            responseStart: (entry as any).responseStart || 0,
            responseEnd: (entry as any).responseEnd || 0
          });
        }
      });
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    });
  }

  /**
   * Measure page load performance
   */
  async measurePageLoad(url: string): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    await this.page.goto(url, { waitUntil: 'networkidle' });
    
    const metrics = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const clsEntries = performance.getEntriesByType('layout-shift');
      
      return {
        pageLoadTime: Date.now() - (window as any).performanceData.navigationStart,
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: lcpEntries[lcpEntries.length - 1]?.startTime || 0,
        cumulativeLayoutShift: clsEntries
          .filter((entry: any) => !entry.hadRecentInput)
          .reduce((sum: number, entry: any) => sum + entry.value, 0),
        networkRequests: (window as any).performanceData.requests.length,
        totalTransferSize: (window as any).performanceData.requests
          .reduce((sum: number, req: any) => sum + (req.transferSize || 0), 0)
      };
    });

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * Measure API response times
   */
  async measureApiPerformance(
    apiCall: () => Promise<void>,
    endpoint: string,
    method = 'GET'
  ): Promise<ApiPerformanceMetrics> {
    const startTime = Date.now();
    
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes(endpoint)
    );
    
    await apiCall();
    const response = await responsePromise;
    
    const metrics: ApiPerformanceMetrics = {
      endpoint,
      method,
      responseTime: Date.now() - startTime,
      transferSize: parseInt(response.headers()['content-length'] || '0'),
      status: response.status()
    };

    this.apiMetrics.push(metrics);
    return metrics;
  }

  /**
   * Measure user interaction performance (e.g., button click to UI update)
   */
  async measureInteractionTime(
    interaction: () => Promise<void>,
    expectedChange: string
  ): Promise<number> {
    const startTime = Date.now();
    
    await interaction();
    
    // Wait for expected change to appear
    await this.page.waitForSelector(expectedChange, { timeout: 10000 });
    
    return Date.now() - startTime;
  }

  /**
   * Assert performance benchmarks
   */
  async assertPerformanceBenchmarks(metrics: PerformanceMetrics): Promise<void> {
    // Page load should be under 3 seconds
    expect(metrics.pageLoadTime).toBeLessThan(3000);
    
    // First Contentful Paint should be under 1.5 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1500);
    
    // Largest Contentful Paint should be under 2.5 seconds
    expect(metrics.largestContentfulPaint).toBeLessThan(2500);
    
    // Cumulative Layout Shift should be under 0.1
    expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1);
    
    // Total transfer size should be reasonable (under 2MB)
    expect(metrics.totalTransferSize).toBeLessThan(2 * 1024 * 1024);
  }

  /**
   * Assert API performance benchmarks
   */
  async assertApiPerformance(metrics: ApiPerformanceMetrics): Promise<void> {
    // API calls should complete within 1 second
    expect(metrics.responseTime).toBeLessThan(1000);
    
    // Successful responses only
    expect(metrics.status).toBeGreaterThanOrEqual(200);
    expect(metrics.status).toBeLessThan(400);
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    pageMetrics: PerformanceMetrics[];
    apiMetrics: ApiPerformanceMetrics[];
    summary: {
      avgPageLoadTime: number;
      avgApiResponseTime: number;
      totalRequests: number;
    };
  } {
    const avgPageLoadTime = this.metrics.length > 0
      ? this.metrics.reduce((sum, m) => sum + m.pageLoadTime, 0) / this.metrics.length
      : 0;

    const avgApiResponseTime = this.apiMetrics.length > 0
      ? this.apiMetrics.reduce((sum, m) => sum + m.responseTime, 0) / this.apiMetrics.length
      : 0;

    return {
      pageMetrics: this.metrics,
      apiMetrics: this.apiMetrics,
      summary: {
        avgPageLoadTime,
        avgApiResponseTime,
        totalRequests: this.apiMetrics.length
      }
    };
  }

  /**
   * Reset collected metrics
   */
  reset(): void {
    this.metrics = [];
    this.apiMetrics = [];
  }

  /**
   * Memory usage monitoring
   */
  async measureMemoryUsage(): Promise<{ used: number; total: number }> {
    const memoryInfo = await this.page.evaluate(() => {
      if ('memory' in performance) {
        return {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize
        };
      }
      return { used: 0, total: 0 };
    });

    return memoryInfo;
  }

  /**
   * Check for memory leaks
   */
  async detectMemoryLeaks(beforeAction: number, afterAction: number): Promise<boolean> {
    // Simple heuristic: if memory increased by more than 10MB, flag as potential leak
    const LEAK_THRESHOLD = 10 * 1024 * 1024; // 10MB
    return (afterAction - beforeAction) > LEAK_THRESHOLD;
  }
}