import { test, expect } from '@playwright/test';
import { generateTestEmail } from './helpers/supabase-auth';

test.describe('Performance and Load Tests', () => {
  let testEmail: string;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    testEmail = generateTestEmail('performance');
    
    // Create test user
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should load dashboard within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Should have essential elements visible
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    
    // Record performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    // Performance benchmarks
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1500); // 1.5s for DOM ready
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // 2s for FCP
    
    console.log('Dashboard Performance Metrics:', performanceMetrics);
  });

  test('should handle rapid QR code creation without performance degradation', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const creationTimes: number[] = [];
    
    // Create 5 QR codes rapidly and measure performance
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      const addButton = page.getByRole('button', { name: /add.*qr/i });
      await addButton.click();
      
      // Wait for QR code to be created
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(i + 2, { timeout: 10000 });
      
      const creationTime = Date.now() - startTime;
      creationTimes.push(creationTime);
      
      // Each creation should complete within 5 seconds
      expect(creationTime).toBeLessThan(5000);
    }
    
    // Performance should not degrade significantly
    const firstCreation = creationTimes[0];
    const lastCreation = creationTimes[creationTimes.length - 1];
    const degradation = (lastCreation - firstCreation) / firstCreation;
    
    // Performance degradation should be less than 100%
    expect(degradation).toBeLessThan(1.0);
    
    console.log('QR Creation Times:', creationTimes);
    console.log('Performance Degradation:', `${(degradation * 100).toFixed(1)}%`);
  });

  test('should handle large numbers of links without UI lag', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    
    if (await addLinkButton.isVisible()) {
      // Add maximum links (5) and measure response times
      const linkAdditionTimes: number[] = [];
      
      for (let i = 1; i <= 5; i++) {
        const startTime = Date.now();
        
        await addLinkButton.click();
        await page.getByPlaceholder(/title/i).fill(`Performance Link ${i}`);
        await page.getByPlaceholder(/url/i).fill(`https://performance-test-${i}.com`);
        await page.getByRole('button', { name: /save/i }).click();
        
        // Wait for link to appear
        await expect(page.getByText(`Performance Link ${i}`)).toBeVisible();
        
        const additionTime = Date.now() - startTime;
        linkAdditionTimes.push(additionTime);
        
        // Each link addition should complete quickly
        expect(additionTime).toBeLessThan(3000);
      }
      
      // Test UI responsiveness with all links present
      const startTime = Date.now();
      
      // Try switching tabs or performing UI actions
      const qrTabs = page.locator('[data-testid="qr-tab"]');
      if (await qrTabs.count() > 1) {
        await qrTabs.nth(0).click();
        await qrTabs.nth(qrTabs.count() - 1).click();
      }
      
      const responsiveTime = Date.now() - startTime;
      expect(responsiveTime).toBeLessThan(1000); // UI should remain responsive
      
      console.log('Link Addition Times:', linkAdditionTimes);
      console.log('UI Responsiveness with max links:', `${responsiveTime}ms`);
    }
  });

  test('should maintain performance with browser tab switching', async ({ page, context }) => {
    await page.waitForLoadState('networkidle');
    
    // Create multiple browser tabs
    const tabs = [page];
    for (let i = 1; i < 3; i++) {
      const newTab = await context.newPage();
      await newTab.goto('/dashboard');
      await newTab.waitForLoadState('networkidle');
      tabs.push(newTab);
    }
    
    // Measure performance when switching between tabs
    const switchingTimes: number[] = [];
    
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < tabs.length; i++) {
        const startTime = Date.now();
        
        await tabs[i].bringToFront();
        await tabs[i].waitForLoadState('networkidle');
        
        // Verify content is still accessible
        await expect(tabs[i].getByRole('heading')).toBeVisible({ timeout: 2000 });
        
        const switchTime = Date.now() - startTime;
        switchingTimes.push(switchTime);
        
        // Tab switching should be fast
        expect(switchTime).toBeLessThan(2000);
      }
    }
    
    const averageSwitchTime = switchingTimes.reduce((a, b) => a + b, 0) / switchingTimes.length;
    expect(averageSwitchTime).toBeLessThan(1000);
    
    console.log('Tab Switching Times:', switchingTimes);
    console.log('Average Switch Time:', `${averageSwitchTime.toFixed(0)}ms`);
    
    // Cleanup
    for (let i = 1; i < tabs.length; i++) {
      await tabs[i].close();
    }
  });

  test('should handle concurrent user actions efficiently', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Simulate concurrent user actions
    const concurrentActions = [
      // Action 1: Add QR code
      async () => {
        const addQRButton = page.getByRole('button', { name: /add.*qr/i });
        if (await addQRButton.isVisible()) {
          await addQRButton.click();
        }
      },
      
      // Action 2: Add link
      async () => {
        const addLinkButton = page.getByRole('button', { name: /add link/i });
        if (await addLinkButton.isVisible()) {
          await addLinkButton.click();
          await page.getByPlaceholder(/title/i).fill('Concurrent Link');
          await page.getByPlaceholder(/url/i).fill('https://concurrent-test.com');
          await page.getByRole('button', { name: /save/i }).click();
        }
      },
      
      // Action 3: Navigate
      async () => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
      }
    ];
    
    const startTime = Date.now();
    
    // Execute actions concurrently
    await Promise.allSettled(concurrentActions.map(action => action()));
    
    const totalTime = Date.now() - startTime;
    
    // Concurrent actions should complete reasonably quickly
    expect(totalTime).toBeLessThan(10000);
    
    // Verify the page is still functional
    await expect(page.getByRole('heading')).toBeVisible();
    
    console.log('Concurrent Actions Completion Time:', `${totalTime}ms`);
  });

  test('should handle memory usage efficiently during extended use', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Measure initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSMemory: (performance as any).memory.usedJSMemory,
        totalJSMemory: (performance as any).memory.totalJSMemory,
        jsMemoryLimit: (performance as any).memory.jsMemoryLimit
      } : null;
    });
    
    // Perform memory-intensive operations
    const operations = [
      // Create and delete QR codes
      async () => {
        for (let i = 0; i < 3; i++) {
          const addButton = page.getByRole('button', { name: /add.*qr/i });
          if (await addButton.isVisible()) {
            await addButton.click();
            await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(i + 2);
          }
        }
      },
      
      // Add and remove links
      async () => {
        const addLinkButton = page.getByRole('button', { name: /add link/i });
        if (await addLinkButton.isVisible()) {
          for (let i = 1; i <= 3; i++) {
            await addLinkButton.click();
            await page.getByPlaceholder(/title/i).fill(`Memory Test Link ${i}`);
            await page.getByPlaceholder(/url/i).fill(`https://memory-test-${i}.com`);
            await page.getByRole('button', { name: /save/i }).click();
          }
        }
      },
      
      // Navigate multiple times
      async () => {
        for (let i = 0; i < 3; i++) {
          await page.reload();
          await page.waitForLoadState('networkidle');
        }
      }
    ];
    
    for (const operation of operations) {
      await operation();
      await page.waitForTimeout(1000); // Allow for garbage collection
    }
    
    // Measure final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSMemory: (performance as any).memory.usedJSMemory,
        totalJSMemory: (performance as any).memory.totalJSMemory,
        jsMemoryLimit: (performance as any).memory.jsMemoryLimit
      } : null;
    });
    
    if (initialMemory && finalMemory) {
      const memoryGrowth = finalMemory.usedJSMemory - initialMemory.usedJSMemory;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);
      
      console.log('Initial Memory:', `${(initialMemory.usedJSMemory / (1024 * 1024)).toFixed(2)}MB`);
      console.log('Final Memory:', `${(finalMemory.usedJSMemory / (1024 * 1024)).toFixed(2)}MB`);
      console.log('Memory Growth:', `${memoryGrowthMB.toFixed(2)}MB`);
      
      // Memory growth should be reasonable (less than 50MB for these operations)
      expect(memoryGrowthMB).toBeLessThan(50);
    }
  });

  test('should perform well under network latency conditions', async ({ page }) => {
    // Simulate network latency
    await page.route('**/*', async route => {
      // Add 100ms delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTimeWithLatency = Date.now() - startTime;
    
    // Should still load within reasonable time even with latency
    expect(loadTimeWithLatency).toBeLessThan(5000);
    
    // Test creating QR code with latency
    const qrCreationStart = Date.now();
    
    const addButton = page.getByRole('button', { name: /add.*qr/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2, { timeout: 15000 });
    }
    
    const qrCreationTime = Date.now() - qrCreationStart;
    expect(qrCreationTime).toBeLessThan(8000); // Allow more time due to latency
    
    console.log('Load time with latency:', `${loadTimeWithLatency}ms`);
    console.log('QR creation time with latency:', `${qrCreationTime}ms`);
  });
});

test.describe('Load Testing', () => {
  test('should handle multiple QR page visits simultaneously', async ({ page, context }) => {
    // Create test user and QR code first
    const testEmail = generateTestEmail('load-test');
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill('Test123!@#');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Get short code
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    await expect(shortLinkElement).toBeVisible();
    const shortLinkText = await shortLinkElement.textContent();
    const shortCode = shortLinkText?.split('/q/')[1];
    
    if (!shortCode) return;
    
    // Create multiple concurrent visitors to the QR page
    const numberOfVisitors = 5;
    const visitors = [];
    
    for (let i = 0; i < numberOfVisitors; i++) {
      const visitorPage = await context.newPage();
      visitors.push(visitorPage);
    }
    
    const visitTimes: number[] = [];
    
    // Simulate concurrent visits
    const visitPromises = visitors.map(async (visitorPage, index) => {
      const startTime = Date.now();
      
      // Set different user agents to simulate different devices
      await visitorPage.setExtraHTTPHeaders({
        'User-Agent': `LoadTestBot-${index}/1.0`
      });
      
      await visitorPage.goto(`/q/${shortCode}`);
      await visitorPage.waitForLoadState('networkidle');
      
      const visitTime = Date.now() - startTime;
      visitTimes.push(visitTime);
      
      // Verify page loaded correctly
      await expect(visitorPage.getByRole('heading')).toBeVisible({ timeout: 5000 });
      
      return visitTime;
    });
    
    const results = await Promise.allSettled(visitPromises);
    
    // All visits should complete successfully
    const successfulVisits = results.filter(result => result.status === 'fulfilled').length;
    expect(successfulVisits).toBe(numberOfVisitors);
    
    // Average load time should be reasonable
    const averageLoadTime = visitTimes.reduce((a, b) => a + b, 0) / visitTimes.length;
    expect(averageLoadTime).toBeLessThan(5000);
    
    console.log('Concurrent visit times:', visitTimes);
    console.log('Average load time:', `${averageLoadTime.toFixed(0)}ms`);
    console.log('Successful visits:', `${successfulVisits}/${numberOfVisitors}`);
    
    // Cleanup
    await Promise.all(visitors.map(visitor => visitor.close()));
  });

  test('should handle rapid successive API calls gracefully', async ({ page }) => {
    const testEmail = generateTestEmail('api-load');
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill('Test123!@#');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    await page.waitForLoadState('networkidle');
    
    // Track API call responses
    const apiCalls: Array<{ url: string; status: number; duration: number }> = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          duration: 0 // We'll calculate this differently
        });
      }
    });
    
    // Make rapid API calls by creating QR codes quickly
    const rapidCreationPromises = [];
    
    for (let i = 0; i < 3; i++) {
      rapidCreationPromises.push((async () => {
        const addButton = page.getByRole('button', { name: /add.*qr/i });
        if (await addButton.isVisible()) {
          await addButton.click();
        }
      })());
    }
    
    await Promise.allSettled(rapidCreationPromises);
    
    // Wait for all operations to complete
    await page.waitForTimeout(5000);
    
    // Check API call success rates
    const successfulCalls = apiCalls.filter(call => call.status >= 200 && call.status < 300).length;
    const totalCalls = apiCalls.length;
    
    if (totalCalls > 0) {
      const successRate = successfulCalls / totalCalls;
      expect(successRate).toBeGreaterThan(0.8); // At least 80% success rate
      
      console.log('API Calls made:', totalCalls);
      console.log('Successful calls:', successfulCalls);
      console.log('Success rate:', `${(successRate * 100).toFixed(1)}%`);
    }
    
    // Verify final state is consistent
    const qrTabs = await page.locator('[data-testid="qr-tab"]').count();
    expect(qrTabs).toBeGreaterThan(1);
  });

  test('should maintain database consistency under concurrent operations', async ({ page, context }) => {
    const testEmail = generateTestEmail('db-consistency');
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill('Test123!@#');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Create a second browser context to simulate another user session
    const secondPage = await context.newPage();
    await secondPage.goto('/login');
    await secondPage.getByPlaceholder('Email address').fill(testEmail);
    await secondPage.getByPlaceholder('Password').fill('Test123!@#');
    await secondPage.getByRole('button', { name: 'Sign in' }).click();
    await expect(secondPage).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Perform concurrent operations
    const operations = [
      // Page 1: Create QR code
      async () => {
        const addButton = page.getByRole('button', { name: /add.*qr/i });
        if (await addButton.isVisible()) {
          await addButton.click();
        }
      },
      
      // Page 2: Also create QR code
      async () => {
        await secondPage.waitForLoadState('networkidle');
        const addButton = secondPage.getByRole('button', { name: /add.*qr/i });
        if (await addButton.isVisible()) {
          await addButton.click();
        }
      }
    ];
    
    await Promise.allSettled(operations);
    
    // Wait for operations to complete
    await page.waitForTimeout(3000);
    await secondPage.waitForTimeout(3000);
    
    // Refresh both pages to get latest state
    await page.reload();
    await secondPage.reload();
    
    await page.waitForLoadState('networkidle');
    await secondPage.waitForLoadState('networkidle');
    
    // Both pages should show consistent state
    const page1QRCount = await page.locator('[data-testid="qr-tab"]').count();
    const page2QRCount = await secondPage.locator('[data-testid="qr-tab"]').count();
    
    expect(page1QRCount).toEqual(page2QRCount);
    expect(page1QRCount).toBeGreaterThan(1);
    
    console.log('Page 1 QR count:', page1QRCount);
    console.log('Page 2 QR count:', page2QRCount);
    console.log('Database consistency maintained:', page1QRCount === page2QRCount);
    
    await secondPage.close();
  });
});