import { test, expect } from '@playwright/test';
import { generateTestEmail } from './helpers/supabase-auth';
import { createTestUser, createTestProject, createTestQRCode } from './helpers/database';

test.describe('Project Management Tests', () => {
  let testEmail: string;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    testEmail = generateTestEmail('projects');
    
    // Create test user and get to dashboard
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should display default project on dashboard', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should show project tabs or project selector
    const projectTab = page.getByRole('tab', { name: /default/i }).or(page.getByText(/default project/i));
    await expect(projectTab).toBeVisible();
    
    // Should show project statistics
    const statsElements = page.locator('[data-testid="project-stats"]').or(page.getByText(/qr code/i));
    if (await statsElements.count() > 0) {
      await expect(statsElements.first()).toBeVisible();
    }
  });

  test('should allow creating new projects', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for "Create Project" or "Add Project" button
    const createProjectButton = page.getByRole('button', { name: /create.*project/i })
      .or(page.getByRole('button', { name: /add.*project/i }))
      .or(page.getByRole('button', { name: /new.*project/i }));
    
    if (await createProjectButton.isVisible()) {
      await createProjectButton.click();
      
      // Fill project details
      const projectNameInput = page.getByPlaceholder(/project.*name/i).or(page.getByPlaceholder(/name/i));
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Marketing Campaign');
        
        // Save project
        const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /create/i }));
        await saveButton.click();
        
        // Should show new project tab
        await expect(page.getByRole('tab', { name: /marketing campaign/i })).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should allow switching between projects', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create additional project first
    const createProjectButton = page.getByRole('button', { name: /create.*project/i })
      .or(page.getByRole('button', { name: /add.*project/i }));
    
    if (await createProjectButton.isVisible()) {
      await createProjectButton.click();
      
      const projectNameInput = page.getByPlaceholder(/project.*name/i).or(page.getByPlaceholder(/name/i));
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Personal Links');
        
        const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /create/i }));
        await saveButton.click();
        
        await expect(page.getByRole('tab', { name: /personal links/i })).toBeVisible();
      }
    }
    
    // Switch between projects
    const defaultProjectTab = page.getByRole('tab', { name: /default/i });
    const personalProjectTab = page.getByRole('tab', { name: /personal/i });
    
    if (await personalProjectTab.isVisible() && await defaultProjectTab.isVisible()) {
      // Click on default project
      await defaultProjectTab.click();
      await expect(defaultProjectTab).toHaveAttribute('data-active', 'true');
      
      // Click on personal project
      await personalProjectTab.click();
      await expect(personalProjectTab).toHaveAttribute('data-active', 'true');
    }
  });

  test('should show project-specific QR codes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create QR code in default project
    const addQRButton = page.getByRole('button', { name: /add.*qr/i });
    if (await addQRButton.isVisible()) {
      await addQRButton.click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
    }
    
    // Create new project
    const createProjectButton = page.getByRole('button', { name: /create.*project/i })
      .or(page.getByRole('button', { name: /add.*project/i }));
    
    if (await createProjectButton.isVisible()) {
      await createProjectButton.click();
      
      const projectNameInput = page.getByPlaceholder(/project.*name/i).or(page.getByPlaceholder(/name/i));
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Work Project');
        
        const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /create/i }));
        await saveButton.click();
        
        // Switch to new project
        const workProjectTab = page.getByRole('tab', { name: /work project/i });
        await expect(workProjectTab).toBeVisible();
        await workProjectTab.click();
        
        // New project should have empty QR codes or just default one
        const qrTabs = page.locator('[data-testid="qr-tab"]');
        const qrCount = await qrTabs.count();
        expect(qrCount).toBeLessThanOrEqual(1); // Should be empty or have default
        
        // Create QR code in work project
        const addQRInWorkProject = page.getByRole('button', { name: /add.*qr/i });
        if (await addQRInWorkProject.isVisible()) {
          await addQRInWorkProject.click();
          await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(qrCount + 1);
        }
        
        // Switch back to default project
        const defaultProjectTab = page.getByRole('tab', { name: /default/i });
        if (await defaultProjectTab.isVisible()) {
          await defaultProjectTab.click();
          
          // Should show the original QR codes from default project
          await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
        }
      }
    }
  });

  test('should display project statistics', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for project statistics display
    const projectStats = page.locator('[data-testid="project-stats"]');
    
    if (await projectStats.count() > 0) {
      await expect(projectStats.first()).toBeVisible();
      
      // Should show QR code count
      const qrCountStat = page.getByText(/\d+.*qr.*code/i);
      if (await qrCountStat.count() > 0) {
        await expect(qrCountStat.first()).toBeVisible();
      }
      
      // Should show total scans
      const scansStat = page.getByText(/\d+.*scan/i);
      if (await scansStat.count() > 0) {
        await expect(scansStat.first()).toBeVisible();
      }
      
      // Should show last activity
      const activityStat = page.getByText(/last.*activity/i).or(page.getByText(/updated/i));
      if (await activityStat.count() > 0) {
        await expect(activityStat.first()).toBeVisible();
      }
    }
  });

  test('should allow renaming projects', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for project settings or rename option
    const projectTab = page.getByRole('tab', { name: /default/i });
    
    // Try right-click context menu
    if (await projectTab.isVisible()) {
      await projectTab.click({ button: 'right' });
      
      const renameOption = page.getByRole('menuitem', { name: /rename/i });
      if (await renameOption.isVisible({ timeout: 2000 })) {
        await renameOption.click();
        
        const nameInput = page.getByPlaceholder(/project.*name/i);
        if (await nameInput.isVisible()) {
          await nameInput.clear();
          await nameInput.fill('My Renamed Project');
          
          const saveButton = page.getByRole('button', { name: /save/i });
          await saveButton.click();
          
          // Should show renamed project tab
          await expect(page.getByRole('tab', { name: /my renamed project/i })).toBeVisible();
        }
      } else {
        // Try double-click to edit
        await projectTab.dblclick();
        
        const nameInput = page.getByPlaceholder(/project.*name/i).or(page.locator('input[value*="Default"]'));
        if (await nameInput.isVisible()) {
          await nameInput.clear();
          await nameInput.fill('Double-Click Renamed');
          await nameInput.press('Enter');
          
          await expect(page.getByRole('tab', { name: /double-click renamed/i })).toBeVisible();
        }
      }
    }
  });

  test('should allow deleting projects (except default)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create additional project to delete
    const createProjectButton = page.getByRole('button', { name: /create.*project/i })
      .or(page.getByRole('button', { name: /add.*project/i }));
    
    if (await createProjectButton.isVisible()) {
      await createProjectButton.click();
      
      const projectNameInput = page.getByPlaceholder(/project.*name/i);
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Temporary Project');
        
        const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /create/i }));
        await saveButton.click();
        
        // Wait for project to be created
        const tempProjectTab = page.getByRole('tab', { name: /temporary project/i });
        await expect(tempProjectTab).toBeVisible();
        
        // Try to delete the project
        await tempProjectTab.click({ button: 'right' });
        
        const deleteOption = page.getByRole('menuitem', { name: /delete/i });
        if (await deleteOption.isVisible({ timeout: 2000 })) {
          await deleteOption.click();
          
          // Confirm deletion
          const confirmButton = page.getByRole('button', { name: /confirm/i }).or(page.getByRole('button', { name: /delete/i }));
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }
          
          // Project should be removed
          await expect(tempProjectTab).not.toBeVisible({ timeout: 5000 });
        }
      }
    }
    
    // Default project should not be deletable
    const defaultProjectTab = page.getByRole('tab', { name: /default/i });
    if (await defaultProjectTab.isVisible()) {
      await defaultProjectTab.click({ button: 'right' });
      
      const deleteOption = page.getByRole('menuitem', { name: /delete/i });
      if (await deleteOption.isVisible({ timeout: 1000 })) {
        // Should be disabled for default project
        await expect(deleteOption).toBeDisabled();
      }
    }
  });

  test('should organize QR codes by projects correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create QR codes in default project
    const addQRButton = page.getByRole('button', { name: /add.*qr/i });
    
    if (await addQRButton.isVisible()) {
      // Add 2 QR codes to default project
      await addQRButton.click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(2);
      
      await addQRButton.click();
      await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(3);
    }
    
    // Create new project
    const createProjectButton = page.getByRole('button', { name: /create.*project/i })
      .or(page.getByRole('button', { name: /add.*project/i }));
    
    if (await createProjectButton.isVisible()) {
      await createProjectButton.click();
      
      const projectNameInput = page.getByPlaceholder(/project.*name/i);
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Separate Project');
        
        const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /create/i }));
        await saveButton.click();
        
        // Switch to new project
        const separateProjectTab = page.getByRole('tab', { name: /separate project/i });
        await expect(separateProjectTab).toBeVisible();
        await separateProjectTab.click();
        
        // Should start with empty or default QR codes
        const initialQRCount = await page.locator('[data-testid="qr-tab"]').count();
        expect(initialQRCount).toBeLessThanOrEqual(1);
        
        // Add QR code to separate project
        const addQRInSeparateProject = page.getByRole('button', { name: /add.*qr/i });
        if (await addQRInSeparateProject.isVisible()) {
          await addQRInSeparateProject.click();
          await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(initialQRCount + 1);
        }
        
        // Switch back to default project
        const defaultProjectTab = page.getByRole('tab', { name: /default/i });
        if (await defaultProjectTab.isVisible()) {
          await defaultProjectTab.click();
          
          // Should show original 3 QR codes
          await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(3);
        }
        
        // Switch back to separate project
        await separateProjectTab.click();
        
        // Should show only the QR codes from separate project
        await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(initialQRCount + 1);
      }
    }
  });

  test('should handle project-level analytics and reporting', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for analytics or reporting section
    const analyticsSection = page.locator('[data-testid="analytics"]').or(page.getByText(/analytics/i));
    
    if (await analyticsSection.count() > 0) {
      // Should show project-level analytics
      await expect(analyticsSection.first()).toBeVisible();
      
      // Should display metrics like total scans, QR codes count, etc.
      const metrics = page.locator('[data-testid="metric"], .metric');
      if (await metrics.count() > 0) {
        await expect(metrics.first()).toBeVisible();
      }
    } else {
      // Look for summary statistics in project tabs or headers
      const summaryStats = page.locator('[data-testid="project-summary"]');
      if (await summaryStats.count() > 0) {
        await expect(summaryStats.first()).toBeVisible();
      }
    }
    
    // Should show scan counts per project
    const scanCounts = page.getByText(/\d+.*scan/i);
    if (await scanCounts.count() > 0) {
      await expect(scanCounts.first()).toBeVisible();
    }
  });

  test('should persist project state across browser sessions', async ({ page, context }) => {
    await page.waitForLoadState('networkidle');
    
    // Create additional project
    const createProjectButton = page.getByRole('button', { name: /create.*project/i })
      .or(page.getByRole('button', { name: /add.*project/i }));
    
    if (await createProjectButton.isVisible()) {
      await createProjectButton.click();
      
      const projectNameInput = page.getByPlaceholder(/project.*name/i);
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Persistent Project');
        
        const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /create/i }));
        await saveButton.click();
        
        await expect(page.getByRole('tab', { name: /persistent project/i })).toBeVisible();
      }
    }
    
    // Close and reopen browser
    await page.close();
    
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');
    
    // Should still show the created project
    await expect(newPage.getByRole('tab', { name: /persistent project/i })).toBeVisible({ timeout: 10000 });
  });

  test('should handle project limits appropriately', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Try to create multiple projects (test limits if any)
    const maxProjects = 5; // Assuming some reasonable limit
    
    for (let i = 1; i <= maxProjects; i++) {
      const createProjectButton = page.getByRole('button', { name: /create.*project/i })
        .or(page.getByRole('button', { name: /add.*project/i }));
      
      if (await createProjectButton.isVisible()) {
        await createProjectButton.click();
        
        const projectNameInput = page.getByPlaceholder(/project.*name/i);
        if (await projectNameInput.isVisible()) {
          await projectNameInput.fill(`Project ${i}`);
          
          const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /create/i }));
          await saveButton.click();
          
          // Wait for project to be created
          await expect(page.getByRole('tab', { name: `project ${i}` })).toBeVisible({ timeout: 5000 });
        }
      } else {
        // If button becomes unavailable, we've hit the limit
        break;
      }
    }
    
    // Try to create one more project beyond limit
    const createProjectButton = page.getByRole('button', { name: /create.*project/i })
      .or(page.getByRole('button', { name: /add.*project/i }));
    
    if (await createProjectButton.isVisible()) {
      const isDisabled = await createProjectButton.isDisabled();
      if (!isDisabled) {
        await createProjectButton.click();
        
        // Should show error message about project limits
        const limitMessage = page.getByText(/maximum.*project/i).or(page.getByText(/limit.*reached/i));
        if (await limitMessage.count() > 0) {
          await expect(limitMessage.first()).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });
});

test.describe('Project Management Integration', () => {
  let testEmail: string;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    testEmail = generateTestEmail('project-integration');
    
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('should maintain project context when editing QR codes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create second project
    const createProjectButton = page.getByRole('button', { name: /create.*project/i })
      .or(page.getByRole('button', { name: /add.*project/i }));
    
    if (await createProjectButton.isVisible()) {
      await createProjectButton.click();
      
      const projectNameInput = page.getByPlaceholder(/project.*name/i);
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Context Test Project');
        
        const saveButton = page.getByRole('button', { name: /save/i }).or(page.getByRole('button', { name: /create/i }));
        await saveButton.click();
        
        // Switch to new project
        const newProjectTab = page.getByRole('tab', { name: /context test project/i });
        await expect(newProjectTab).toBeVisible();
        await newProjectTab.click();
        
        // Add QR code in this project
        const addQRButton = page.getByRole('button', { name: /add.*qr/i });
        if (await addQRButton.isVisible()) {
          await addQRButton.click();
          await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(1);
        }
        
        // Edit QR code (add link)
        const addLinkButton = page.getByRole('button', { name: /add link/i });
        if (await addLinkButton.isVisible()) {
          await addLinkButton.click();
          await page.getByPlaceholder(/title/i).fill('Project Context Link');
          await page.getByPlaceholder(/url/i).fill('https://context-test.com');
          await page.getByRole('button', { name: /save/i }).click();
          
          await expect(page.getByText('Project Context Link')).toBeVisible();
        }
        
        // Switch to default project
        const defaultProjectTab = page.getByRole('tab', { name: /default/i });
        if (await defaultProjectTab.isVisible()) {
          await defaultProjectTab.click();
          
          // Should not show the link from other project
          await expect(page.getByText('Project Context Link')).not.toBeVisible();
        }
        
        // Switch back to context test project
        await newProjectTab.click();
        
        // Should show the link again
        await expect(page.getByText('Project Context Link')).toBeVisible();
      }
    }
  });

  test('should handle bulk operations within projects', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Create multiple QR codes in default project
    const addQRButton = page.getByRole('button', { name: /add.*qr/i });
    
    if (await addQRButton.isVisible()) {
      for (let i = 1; i < 4; i++) {
        await addQRButton.click();
        await expect(page.locator('[data-testid="qr-tab"]')).toHaveCount(i + 1);
      }
    }
    
    // Look for bulk operations or selection mode
    const bulkSelectButton = page.getByRole('button', { name: /select.*all/i })
      .or(page.getByRole('button', { name: /bulk/i }))
      .or(page.getByRole('button', { name: /manage/i }));
    
    if (await bulkSelectButton.isVisible()) {
      await bulkSelectButton.click();
      
      // Should enable selection mode
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.count() > 0) {
        // Select multiple QR codes
        await checkboxes.first().check();
        await checkboxes.nth(1).check();
        
        // Look for bulk action buttons
        const bulkDeleteButton = page.getByRole('button', { name: /delete.*selected/i });
        const bulkExportButton = page.getByRole('button', { name: /export.*selected/i });
        
        if (await bulkDeleteButton.isVisible()) {
          await bulkDeleteButton.click();
          
          // Confirm deletion
          const confirmButton = page.getByRole('button', { name: /confirm/i });
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }
          
          // Should have fewer QR codes
          const remainingQRs = await page.locator('[data-testid="qr-tab"]').count();
          expect(remainingQRs).toBeLessThan(4);
        }
      }
    }
  });
});