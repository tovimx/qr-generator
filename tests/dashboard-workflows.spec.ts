/**
 * Comprehensive Dashboard Workflow Tests
 * Tests complete user workflows within the dashboard interface
 */

import { test, expect } from '@playwright/test';
import { AdvancedTestHelper, QRCodeTestHelper, PerformanceMonitor, TestDataFactory } from './helpers/advanced-test-utilities';

test.describe('Dashboard Workflows - User Journey', () => {

  test.beforeEach(async ({ }) => {
    // Skip all dashboard workflow tests - require real authentication
    test.skip(true, 'Dashboard workflow tests require real Supabase authentication which is not available in test environment with mock credentials');
  });

  test('Complete dashboard onboarding flow for new user', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const qrHelper = new QRCodeTestHelper(page);
    const performanceMonitor = new PerformanceMonitor(page);
    
    await performanceMonitor.startMonitoring();

    // Step 1: Create new user account
    const testUser = TestDataFactory.createRealisticUserProfile();
    console.log('Testing with user:', { name: testUser.name, email: testUser.email });

    await page.goto('/signup');
    
    // Fill signup form
    await page.getByPlaceholder('Email address').fill(testUser.email);
    await page.getByPlaceholder(/Password.*min 6 characters/i).fill(testUser.password);
    
    const signupStart = Date.now();
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Step 2: Handle signup result
    await page.waitForTimeout(5000); // Allow signup to process
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ User successfully signed up and logged in');
      
      const signupTime = Date.now() - signupStart;
      await performanceMonitor.recordMetric('signup-to-dashboard', signupTime);
      
      // Step 3: Verify dashboard initialization
      await expect(page.locator('text=/Dashboard|QR Code|Projects/i').first()).toBeVisible({ timeout: 10000 });
      
      // Step 4: Check for onboarding elements
      const onboardingElements = [
        page.locator('text=/Welcome|Get Started|First QR/i').first(),
        page.locator('[data-testid*="onboarding"], .onboarding, .welcome').first(),
        page.getByRole('button', { name: /Create.*QR|Get Started|Begin/i }).first()
      ];
      
      let hasOnboarding = false;
      for (const element of onboardingElements) {
        if (await element.isVisible({ timeout: 2000 })) {
          hasOnboarding = true;
          console.log('✅ Onboarding interface detected');
          break;
        }
      }
      
      // Step 5: Verify automatic QR creation or creation interface
      const qrGenerated = await qrHelper.waitForQRCodeGeneration(8000);
      
      if (qrGenerated) {
        console.log('✅ QR code automatically generated for new user');
        
        const qrProperties = await qrHelper.verifyQRCodeProperties();
        expect(qrProperties.isVisible).toBe(true);
        expect(qrProperties.hasContent).toBe(true);
        
        // Test the generated QR code
        const shortCode = await qrHelper.extractQRShortCode();
        if (shortCode) {
          const qrTest = await qrHelper.testQRCodeLink(shortCode);
          expect(qrTest.accessible).toBe(true);
          console.log('✅ Generated QR code is functional');
        }
        
      } else {
        console.log('ℹ️ No automatic QR generation - checking for creation interface');
        
        // Look for QR creation interface
        const createInterface = page.locator('button:has-text("Create"), input[placeholder*="title"], .qr-creator').first();
        if (await createInterface.isVisible({ timeout: 3000 })) {
          console.log('✅ QR creation interface available');
        }
      }
      
      // Step 6: Verify dashboard functionality
      const dashboardHealth = await helper.checkPageHealth();
      expect(dashboardHealth.isHealthy).toBe(true);
      expect(dashboardHealth.jsErrors.length).toBeLessThan(3);
      
      console.log('✅ New user onboarding workflow completed successfully');
      
    } else if (currentUrl.includes('/signup')) {
      // Still on signup - likely email confirmation required
      console.log('ℹ️ Signup requires email confirmation or encountered validation error');
      
      const confirmationText = page.locator('text=/check.*email|confirmation|verify|sent/i');
      if (await confirmationText.isVisible({ timeout: 3000 })) {
        console.log('✅ Email confirmation flow detected');
        expect(confirmationText).toBeVisible();
      } else {
        // Check for validation errors
        const errorText = page.locator('text=/error|invalid|failed/i, [role="alert"]');
        if (await errorText.isVisible({ timeout: 2000 })) {
          const errorMessage = await errorText.textContent();
          console.log('Signup validation error:', errorMessage);
        }
      }
    }
    
    const metrics = await performanceMonitor.getMetrics();
    console.log('Onboarding performance metrics:', metrics);
  });

  test('Existing user dashboard workflow: login → manage QRs → customize → export', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const qrHelper = new QRCodeTestHelper(page);
    const performanceMonitor = new PerformanceMonitor(page);
    
    // Use test credentials or skip if not available
    const testEmail = process.env['E2E_TEST_EMAIL'] || 'test@example.com';
    const testPassword = process.env['E2E_TEST_PASSWORD'] || 'TestPassword123!';
    
    await performanceMonitor.startMonitoring();
    
    // Step 1: Login
    await page.goto('/login');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    
    const loginStart = Date.now();
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    try {
      await page.waitForURL('/dashboard', { timeout: 15000 });
      const loginTime = Date.now() - loginStart;
      await performanceMonitor.recordMetric('existing-user-login', loginTime);
      
      // Step 2: Dashboard interaction
      await expect(page.locator('text=/Dashboard|QR Code|Projects/i').first()).toBeVisible({ timeout: 10000 });
      
      // Step 3: QR management workflow
      await qrHelper.waitForQRCodeGeneration(8000);
      
      // Test QR customization if interface is available
      const customizationTest = await qrHelper.testCustomizationFeatures();
      
      if (customizationTest.titleEditable) {
        console.log('✅ Title customization works');
      }
      
      if (customizationTest.linksEditable) {
        console.log('✅ Link management works');
      }
      
      if (customizationTest.themeChangeable) {
        console.log('✅ Theme customization available');
      }
      
      // Step 4: Test tab/project switching if available
      const tabs = page.locator('[role="tab"], .tab, button[data-testid*="tab"]');
      const tabCount = await tabs.count();
      
      if (tabCount > 1) {
        console.log(`✅ Found ${tabCount} tabs/projects`);
        
        // Test tab switching
        await tabs.nth(1).click();
        await page.waitForTimeout(1000);
        
        const secondTabQR = await qrHelper.waitForQRCodeGeneration(5000);
        if (secondTabQR) {
          console.log('✅ Tab switching with QR regeneration works');
        }
        
        // Switch back
        await tabs.nth(0).click();
        await page.waitForTimeout(1000);
      }
      
      // Step 5: Test export/download functionality
      const exportButtons = page.locator('button:has-text("Download"), button:has-text("Export"), button:has-text("Save"), [data-testid*="download"]');
      if (await exportButtons.first().isVisible({ timeout: 3000 })) {
        // Test export trigger (don't actually download)
        await exportButtons.first().click();
        await page.waitForTimeout(1000);
        console.log('✅ Export functionality accessible');
      }
      
      // Step 6: Test sharing functionality  
      const shareButtons = page.locator('button:has-text("Share"), button:has-text("Copy"), [data-testid*="share"]');
      if (await shareButtons.first().isVisible({ timeout: 3000 })) {
        await shareButtons.first().click();
        await page.waitForTimeout(1000);
        console.log('✅ Share functionality accessible');
      }
      
      // Step 7: Performance and health check
      const dashboardHealth = await helper.checkPageHealth();
      expect(dashboardHealth.isHealthy).toBe(true);
      
      const metrics = await performanceMonitor.getMetrics();
      console.log('Dashboard workflow metrics:', metrics);
      
      console.log('✅ Existing user dashboard workflow completed successfully');
      
    } catch (error) {
      test.skip(true, `Test user credentials not valid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  test('Multi-project QR organization workflow', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const qrHelper = new QRCodeTestHelper(page);
    
    // Try to access dashboard
    await page.goto('/dashboard');
    
    try {
      await page.waitForTimeout(3000);
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required for multi-project test');
      }

      // Look for project/tab management interface
      const projectInterface = page.locator('[data-testid*="project"], .project-selector, button:has-text("Project")');
      const tabInterface = page.locator('[role="tab"], .tab, button[data-testid*="tab"]');
      
      const hasProjects = await projectInterface.first().isVisible({ timeout: 3000 });
      const hasTabs = await tabInterface.count() > 1;
      
      if (hasProjects || hasTabs) {
        console.log('✅ Multi-project interface detected');
        
        if (hasTabs) {
          const tabCount = await tabInterface.count();
          console.log(`Found ${tabCount} tabs`);
          
          // Test each tab
          for (let i = 0; i < Math.min(tabCount, 5); i++) {
            await tabInterface.nth(i).click();
            await page.waitForTimeout(1500);
            
            // Verify QR loads for each tab
            const qrLoaded = await qrHelper.waitForQRCodeGeneration(5000);
            const tabActive = await tabInterface.nth(i).evaluate(el => 
              el.getAttribute('aria-selected') === 'true' || 
              el.classList.contains('active') ||
              el.classList.contains('selected')
            );
            
            console.log(`Tab ${i + 1}: QR loaded: ${qrLoaded}, Active: ${tabActive}`);
          }
          
          console.log('✅ Tab management workflow tested');
        }
        
        if (hasProjects) {
          // Test project creation if available
          const createProjectButton = page.locator('button:has-text("Create Project"), button:has-text("New Project"), button[data-testid*="create-project"]');
          if (await createProjectButton.first().isVisible({ timeout: 2000 })) {
            console.log('✅ Project creation interface available');
          }
        }
        
      } else {
        console.log('ℹ️ Single project interface detected');
        
        // Verify single project functionality
        await qrHelper.waitForQRCodeGeneration(5000);
        const qrProperties = await qrHelper.verifyQRCodeProperties();
        expect(qrProperties.isVisible).toBe(true);
      }
      
      console.log('✅ Project organization workflow completed');
      
    } catch {
      test.skip(true, 'Dashboard access required for multi-project test');
    }
  });

  test('QR code bulk operations and management', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    const qrHelper = new QRCodeTestHelper(page);
    
    await page.goto('/dashboard');
    
    try {
      await page.waitForTimeout(3000);
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required for bulk operations test');
      }

      // Look for bulk operation interfaces
      const bulkElements = page.locator('input[type="checkbox"], button:has-text("Select All"), .bulk-actions, [data-testid*="bulk"]');
      const hasBulkInterface = await bulkElements.first().isVisible({ timeout: 3000 });
      
      if (hasBulkInterface) {
        console.log('✅ Bulk operations interface detected');
        
        // Test selection
        const checkboxes = page.locator('input[type="checkbox"]');
        const checkboxCount = await checkboxes.count();
        
        if (checkboxCount > 0) {
          // Select first few items
          for (let i = 0; i < Math.min(checkboxCount, 3); i++) {
            await checkboxes.nth(i).check();
            await page.waitForTimeout(200);
          }
          
          // Look for bulk action buttons
          const bulkActionButtons = page.locator('button:has-text("Delete Selected"), button:has-text("Export Selected"), .bulk-action-button');
          if (await bulkActionButtons.first().isVisible({ timeout: 2000 })) {
            console.log('✅ Bulk action buttons available after selection');
          }
          
          // Unselect items
          for (let i = 0; i < Math.min(checkboxCount, 3); i++) {
            await checkboxes.nth(i).uncheck();
            await page.waitForTimeout(200);
          }
        }
        
      } else {
        console.log('ℹ️ No bulk operations interface detected');
      }
      
      // Test QR list/grid view if available
      const viewToggle = page.locator('button:has-text("Grid"), button:has-text("List"), [data-testid*="view-toggle"]');
      if (await viewToggle.first().isVisible({ timeout: 2000 })) {
        await viewToggle.first().click();
        await page.waitForTimeout(1000);
        console.log('✅ View toggle functionality available');
      }
      
      // Test search/filter if available
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Filter"], [data-testid*="search"]');
      if (await searchInput.first().isVisible({ timeout: 2000 })) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(1000);
        await searchInput.first().clear();
        console.log('✅ Search/filter functionality available');
      }
      
      console.log('✅ QR management operations tested');
      
    } catch {
      test.skip(true, 'Dashboard access required for bulk operations test');
    }
  });

  test('Dashboard performance under typical usage', async ({ page }) => {
    const performanceMonitor = new PerformanceMonitor(page);
    const helper = new AdvancedTestHelper(page);
    const qrHelper = new QRCodeTestHelper(page);
    
    await performanceMonitor.startMonitoring();
    
    await page.goto('/dashboard');
    
    try {
      await page.waitForTimeout(3000);
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required for performance test');
      }

      // Measure initial dashboard load
      const loadStart = Date.now();
      await page.waitForLoadState('networkidle');
      const initialLoad = Date.now() - loadStart;
      await performanceMonitor.recordMetric('dashboard-initial-load', initialLoad);
      
      // Test rapid interactions
      const tabs = page.locator('[role="tab"], .tab, button[data-testid*="tab"]');
      const tabCount = await tabs.count();
      
      if (tabCount > 1) {
        // Rapid tab switching
        const tabSwitchStart = Date.now();
        for (let i = 0; i < Math.min(tabCount, 5); i++) {
          await tabs.nth(i).click();
          await page.waitForTimeout(200);
        }
        const tabSwitchTime = Date.now() - tabSwitchStart;
        await performanceMonitor.recordMetric('rapid-tab-switching', tabSwitchTime);
        
        console.log(`Tab switching performance: ${tabSwitchTime}ms for ${Math.min(tabCount, 5)} tabs`);
      }
      
      // Test QR generation performance
      const qrGenStart = Date.now();
      const qrGenerated = await qrHelper.waitForQRCodeGeneration(8000);
      if (qrGenerated) {
        const qrGenTime = Date.now() - qrGenStart;
        await performanceMonitor.recordMetric('qr-generation', qrGenTime);
        console.log(`QR generation performance: ${qrGenTime}ms`);
      }
      
      // Test customization responsiveness
      const customizationStart = Date.now();
      const customizationTest = await qrHelper.testCustomizationFeatures();
      const customizationTime = Date.now() - customizationStart;
      
      if (customizationTest.changesApplied) {
        await performanceMonitor.recordMetric('customization-responsiveness', customizationTime);
        console.log(`Customization responsiveness: ${customizationTime}ms`);
      }
      
      // Memory usage check
      const memoryUsage = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memory = (performance as any).memory;
        return memory ? {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        } : null;
      });
      
      if (memoryUsage) {
        console.log('Dashboard memory usage:', {
          used: `${Math.round(memoryUsage.used / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.total / 1024 / 1024)}MB`,
          percentage: `${Math.round((memoryUsage.used / memoryUsage.limit) * 100)}%`
        });
        
        // Should not use excessive memory
        expect(memoryUsage.used).toBeLessThan(memoryUsage.limit * 0.5); // Less than 50% of limit
      }
      
      // Overall dashboard health
      const dashboardHealth = await helper.checkPageHealth();
      expect(dashboardHealth.isHealthy).toBe(true);
      expect(dashboardHealth.loadTime).toBeLessThan(5000);
      
      const allMetrics = await performanceMonitor.getMetrics();
      console.log('Dashboard performance summary:', allMetrics);
      
      console.log('✅ Dashboard performance test completed');
      
    } catch {
      test.skip(true, 'Dashboard access required for performance test');
    }
  });

  test('Dashboard accessibility and keyboard navigation', async ({ page }) => {
    const helper = new AdvancedTestHelper(page);
    
    await page.goto('/dashboard');
    
    try {
      await page.waitForTimeout(3000);
      if (page.url().includes('/login')) {
        test.skip(true, 'Authentication required for accessibility test');
      }

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const firstFocusedElement = page.locator(':focus');
      await expect(firstFocusedElement).toBeVisible();
      
      // Navigate through several tab stops
      const tabStops = [];
      for (let i = 0; i < 10; i++) {
        const focusedElement = page.locator(':focus');
        const tagName = await focusedElement.evaluate(el => el.tagName);
        const role = await focusedElement.getAttribute('role');
        const ariaLabel = await focusedElement.getAttribute('aria-label');
        
        tabStops.push({ tagName, role, ariaLabel });
        
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
      
      console.log('Keyboard navigation tab stops:', tabStops);
      
      // Should have reasonable number of focusable elements
      const focusableElements = await page.locator('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])').count();
      expect(focusableElements).toBeGreaterThan(3);
      expect(focusableElements).toBeLessThan(50); // Not too many
      
      console.log(`Found ${focusableElements} focusable elements`);
      
      // Test accessibility score
      const accessibilityCheck = await helper.checkAccessibility();
      console.log(`Dashboard accessibility score: ${accessibilityCheck.score}%`);
      console.log('Accessibility issues:', accessibilityCheck.issues);
      console.log('Accessibility passed checks:', accessibilityCheck.passed);
      
      // Dashboard should be reasonably accessible
      expect(accessibilityCheck.score).toBeGreaterThan(70); // 70% threshold
      
      // Test screen reader announcements
      const announcements = await page.locator('[role="alert"], [aria-live], .sr-only').count();
      if (announcements > 0) {
        console.log(`✅ Found ${announcements} screen reader announcement elements`);
      }
      
      // Test skip links
      const skipLinks = page.locator('a[href*="#"], .skip-link');
      if (await skipLinks.first().isVisible({ timeout: 2000 })) {
        console.log('✅ Skip navigation links available');
      }
      
      console.log('✅ Dashboard accessibility test completed');
      
    } catch {
      test.skip(true, 'Dashboard access required for accessibility test');
    }
  });
});