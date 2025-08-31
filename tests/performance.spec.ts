/**
 * Performance E2E Tests
 * Tests page load times, API response times, and interaction performance
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { QRCodePage } from './helpers/qr-page';
import { PerformanceHelper } from './helpers/performance';
import { generateTestEmail } from './helpers/supabase-auth';

test.describe('Performance Tests', () => {
  let authHelper: AuthHelper;
  let qrPage: QRCodePage;
  let performanceHelper: PerformanceHelper;
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    qrPage = new QRCodePage(page);
    performanceHelper = new PerformanceHelper(page);
    testEmail = generateTestEmail('perf');

    await performanceHelper.startMonitoring();
  });

  test('Dashboard page load performance', async ({ page }) => {
    // Create user and measure login + dashboard load time
    await authHelper.signup(testEmail, 'Test123!@#');
    
    // Measure dashboard page load performance
    const metrics = await performanceHelper.measurePageLoad('/dashboard');
    
    // Assert performance benchmarks
    await performanceHelper.assertPerformanceBenchmarks(metrics);
    
    console.log('Dashboard Performance Metrics:', {
      pageLoadTime: `${metrics.pageLoadTime}ms`,
      firstContentfulPaint: `${metrics.firstContentfulPaint}ms`,
      largestContentfulPaint: `${metrics.largestContentfulPaint}ms`,
      networkRequests: metrics.networkRequests,
      totalTransferSize: `${Math.round(metrics.totalTransferSize / 1024)}KB`
    });
  });

  test('QR code generation performance', async ({ page }) => {
    // Setup user
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Measure QR code generation time
    const generationTime = await performanceHelper.measureInteractionTime(
      async () => {
        await qrPage.updateTitle('Performance Test QR');
      },
      'canvas' // Wait for QR code canvas to appear
    );
    
    expect(generationTime).toBeLessThan(2000); // Should generate within 2 seconds
    console.log(`QR Code Generation Time: ${generationTime}ms`);
  });

  test('Link addition performance', async ({ page }) => {
    // Setup
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Measure time to add a link
    const linkAddTime = await performanceHelper.measureInteractionTime(
      async () => {
        await qrPage.addLink('Performance Link', 'https://example.com');
      },
      'text="Performance Link"' // Wait for link to appear
    );
    
    expect(linkAddTime).toBeLessThan(3000); // Should add link within 3 seconds
    console.log(`Link Addition Time: ${linkAddTime}ms`);
  });

  test('Bulk link addition performance', async ({ page }) => {
    // Setup
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    const startTime = Date.now();
    
    // Add 5 links (maximum allowed)
    const links = [
      { title: 'Link 1', url: 'https://example1.com' },
      { title: 'Link 2', url: 'https://example2.com' },
      { title: 'Link 3', url: 'https://example3.com' },
      { title: 'Link 4', url: 'https://example4.com' },
      { title: 'Link 5', url: 'https://example5.com' }
    ];
    
    await qrPage.addMultipleLinks(links);
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(15000); // Should add all 5 links within 15 seconds
    
    console.log(`Bulk Link Addition (5 links): ${totalTime}ms`);
  });

  test('QR page load performance', async ({ page }) => {
    // Setup with links
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    await qrPage.addMultipleLinks([
      { title: 'Website', url: 'https://example.com' },
      { title: 'Social', url: 'https://social.com' },
      { title: 'Contact', url: 'mailto:test@example.com' }
    ]);
    
    // Get QR code short link
    const shortLink = await qrPage.getShortLink();
    const shortCode = shortLink.replace('/q/', '');
    
    // Measure QR page load performance
    const metrics = await performanceHelper.measurePageLoad(`/q/${shortCode}`);
    
    // QR pages should load faster than dashboard
    expect(metrics.pageLoadTime).toBeLessThan(2000);
    expect(metrics.firstContentfulPaint).toBeLessThan(1000);
    
    console.log('QR Page Performance Metrics:', {
      pageLoadTime: `${metrics.pageLoadTime}ms`,
      firstContentfulPaint: `${metrics.firstContentfulPaint}ms`,
      networkRequests: metrics.networkRequests
    });
  });

  test('Memory usage and leak detection', async ({ page }) => {
    // Setup
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Measure initial memory
    const initialMemory = await performanceHelper.measureMemoryUsage();
    
    // Perform memory-intensive operations
    for (let i = 0; i < 3; i++) {
      await qrPage.addLink(`Memory Test Link ${i}`, `https://memory-test-${i}.com`);
      await qrPage.deleteLink(`Memory Test Link ${i}`);
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });
    
    // Wait a bit for cleanup
    await page.waitForTimeout(1000);
    
    // Measure final memory
    const finalMemory = await performanceHelper.measureMemoryUsage();
    
    // Check for memory leaks
    const hasLeak = await performanceHelper.detectMemoryLeaks(
      initialMemory.used,
      finalMemory.used
    );
    
    expect(hasLeak).toBe(false);
    
    console.log('Memory Usage:', {
      initial: `${Math.round(initialMemory.used / 1024 / 1024)}MB`,
      final: `${Math.round(finalMemory.used / 1024 / 1024)}MB`,
      difference: `${Math.round((finalMemory.used - initialMemory.used) / 1024 / 1024)}MB`
    });
  });

  test('Network request performance', async ({ page }) => {
    // Setup
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Monitor network requests during interactions
    const requests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    const responses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });
    
    // Perform operations that trigger API calls
    await qrPage.updateTitle('Network Performance Test');
    await qrPage.addLink('API Test Link', 'https://api-test.com');
    
    // Wait for requests to complete
    await page.waitForTimeout(2000);
    
    // Analyze network performance
    const apiCalls = responses.filter(r => r.status >= 200 && r.status < 300);
    expect(apiCalls.length).toBeGreaterThan(0);
    
    // Calculate average response times (simplified)
    console.log(`API Requests made: ${requests.length}`);
    console.log(`Successful API responses: ${apiCalls.length}`);
  });

  test('Concurrent user simulation', async ({ page, context }) => {
    // This test simulates concurrent access patterns
    await authHelper.signup(testEmail, 'Test123!@#');
    await qrPage.goto();
    
    // Create QR code with links
    await qrPage.updateTitle('Concurrent Test QR');
    await qrPage.addMultipleLinks([
      { title: 'Link 1', url: 'https://concurrent1.com' },
      { title: 'Link 2', url: 'https://concurrent2.com' }
    ]);
    
    const shortLink = await qrPage.getShortLink();
    const shortCode = shortLink.replace('/q/', '');
    
    // Simulate multiple concurrent accesses to QR page
    const concurrentRequests = [];
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage();
      concurrentRequests.push(
        performanceHelper.measurePageLoad.call(
          new PerformanceHelper(newPage),
          `/q/${shortCode}`
        )
      );
    }
    
    const results = await Promise.all(concurrentRequests);
    
    // All requests should complete successfully
    results.forEach((metrics, index) => {
      expect(metrics.pageLoadTime).toBeLessThan(5000);
      console.log(`Concurrent Request ${index + 1}: ${metrics.pageLoadTime}ms`);
    });
  });

  test.afterEach(async ({ page }) => {
    // Generate performance report
    const report = performanceHelper.generateReport();
    
    if (report.summary.avgPageLoadTime > 0) {
      console.log('Performance Summary:', {
        avgPageLoadTime: `${Math.round(report.summary.avgPageLoadTime)}ms`,
        avgApiResponseTime: `${Math.round(report.summary.avgApiResponseTime)}ms`,
        totalRequests: report.summary.totalRequests
      });
    }
    
    // Reset for next test
    performanceHelper.reset();
  });
});