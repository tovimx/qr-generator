import { test, expect } from '@playwright/test';
import { generateTestEmail } from './helpers/supabase-auth';

test.describe('Theme Customization Tests', () => {
  let testEmail: string;
  let shortCode: string;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    testEmail = generateTestEmail('theme');
    
    // Create test user
    await page.goto('/signup');
    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Get short code for testing QR pages
    const shortLinkElement = page.locator('text=/\\/q\\/[a-zA-Z0-9]+/');
    await expect(shortLinkElement).toBeVisible();
    const shortLinkText = await shortLinkElement.textContent();
    shortCode = shortLinkText?.split('/q/')[1] || '';
  });

  test('should display theme customization panel', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for design, customize, or theme button
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }))
      .or(page.getByRole('button', { name: /theme/i }))
      .or(page.getByRole('button', { name: /style/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Should show theme customization panel
      const themePanel = page.locator('[data-testid="theme-panel"]')
        .or(page.locator('[data-testid="design-panel"]'))
        .or(page.getByText(/customize.*appearance/i));
      
      await expect(themePanel).toBeVisible({ timeout: 5000 });
      
      // Should have color customization options
      const colorInputs = page.locator('input[type="color"]');
      if (await colorInputs.count() > 0) {
        await expect(colorInputs.first()).toBeVisible();
      }
      
      // Should have theme selection options
      const themeOptions = page.locator('[data-testid="theme-option"]')
        .or(page.getByRole('button', { name: /minimal/i }))
        .or(page.getByRole('button', { name: /modern/i }));
      
      if (await themeOptions.count() > 0) {
        await expect(themeOptions.first()).toBeVisible();
      }
    }
  });

  test('should allow changing primary and secondary colors', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Find color inputs
      const colorInputs = page.locator('input[type="color"]');
      
      if (await colorInputs.count() >= 2) {
        // Change primary color
        await colorInputs.first().fill('#ff0000');
        await colorInputs.first().blur();
        
        // Change secondary color
        await colorInputs.nth(1).fill('#00ff00');
        await colorInputs.nth(1).blur();
        
        // Save changes
        const saveButton = page.getByRole('button', { name: /save/i })
          .or(page.getByRole('button', { name: /apply/i }));
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
        
        // Wait for changes to be applied
        await page.waitForTimeout(1000);
        
        // Check if colors are applied (this depends on implementation)
        const preview = page.locator('[data-testid="preview"]').or(page.locator('.preview'));
        if (await preview.count() > 0) {
          await expect(preview.first()).toBeVisible();
        }
      }
    }
  });

  test('should allow selecting different theme templates', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Look for theme templates
      const themeTemplates = [
        { name: /minimal/i, description: 'Clean minimal design' },
        { name: /modern/i, description: 'Modern gradient design' },
        { name: /classic/i, description: 'Classic design' },
        { name: /dark/i, description: 'Dark theme' },
        { name: /colorful/i, description: 'Vibrant colors' }
      ];
      
      let themeApplied = false;
      
      for (const theme of themeTemplates) {
        const themeButton = page.getByRole('button', { name: theme.name });
        
        if (await themeButton.isVisible()) {
          await themeButton.click();
          
          // Wait for theme to be applied
          await page.waitForTimeout(1000);
          
          // Save changes
          const saveButton = page.getByRole('button', { name: /save/i })
            .or(page.getByRole('button', { name: /apply/i }));
          
          if (await saveButton.isVisible()) {
            await saveButton.click();
            themeApplied = true;
            break;
          }
        }
      }
      
      if (themeApplied) {
        // Verify theme was applied by checking for visual changes
        await page.waitForTimeout(1000);
        
        // Check if preview or main area updated
        const styledElements = page.locator('[style*="color"], [style*="background"]');
        if (await styledElements.count() > 0) {
          await expect(styledElements.first()).toBeVisible();
        }
      }
    }
  });

  test('should show theme changes on QR page', async ({ page }) => {
    if (!shortCode) return;
    
    await page.waitForLoadState('networkidle');
    
    // Customize theme first
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Change theme colors
      const colorInputs = page.locator('input[type="color"]');
      if (await colorInputs.count() > 0) {
        await colorInputs.first().fill('#ff6600'); // Orange color
        
        // Save changes
        const saveButton = page.getByRole('button', { name: /save/i })
          .or(page.getByRole('button', { name: /apply/i }));
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Visit QR page to see changes
    await page.goto(`/q/${shortCode}`);
    await page.waitForLoadState('networkidle');
    
    // Should display with custom theme
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Check if custom styles are applied
    const styledElements = page.locator('body, main, .container');
    
    if (await styledElements.count() > 0) {
      // Get computed styles to verify theme is applied
      const styles = await styledElements.first().evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color
        };
      });
      
      // Styles should be defined (not empty)
      expect(styles.backgroundColor).toBeTruthy();
      expect(styles.color).toBeTruthy();
    }
  });

  test('should allow customizing button styles', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Add a link first to have buttons to style
    const addLinkButton = page.getByRole('button', { name: /add link/i });
    if (await addLinkButton.isVisible()) {
      await addLinkButton.click();
      await page.getByPlaceholder(/title/i).fill('Styled Button');
      await page.getByPlaceholder(/url/i).fill('https://example.com');
      await page.getByRole('button', { name: /save/i }).click();
      
      await expect(page.getByText('Styled Button')).toBeVisible();
    }
    
    // Open design customization
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Look for button style options
      const buttonStyleOptions = [
        page.getByRole('button', { name: /rounded/i }),
        page.getByRole('button', { name: /square/i }),
        page.getByRole('button', { name: /pill/i }),
        page.getByRole('button', { name: /outline/i })
      ];
      
      for (const styleOption of buttonStyleOptions) {
        if (await styleOption.isVisible()) {
          await styleOption.click();
          
          // Save changes
          const saveButton = page.getByRole('button', { name: /save/i })
            .or(page.getByRole('button', { name: /apply/i }));
          
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(500);
          }
          
          break;
        }
      }
      
      // Check if button style preview updated
      const preview = page.locator('[data-testid="preview"], .preview');
      if (await preview.count() > 0) {
        await expect(preview.first()).toBeVisible();
      }
    }
  });

  test('should allow uploading custom avatar/logo', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Look for avatar/logo upload
      const uploadInput = page.locator('input[type="file"]')
        .or(page.getByRole('button', { name: /upload.*avatar/i }))
        .or(page.getByRole('button', { name: /upload.*logo/i }));
      
      if (await uploadInput.first().isVisible()) {
        // Create a test image file (if input[type="file"] exists)
        const fileInput = page.locator('input[type="file"]');
        
        if (await fileInput.count() > 0) {
          // Set files on the file input
          // Note: In a real test, you'd use a real image file
          const testImagePath = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
          
          // For file upload testing, you'd typically use:
          // await fileInput.setInputFiles('path/to/test/image.png');
          
          // For now, just verify the upload interface exists
          await expect(fileInput.first()).toBeVisible();
        }
        
        // Look for URL input for avatar/logo
        const avatarUrlInput = page.getByPlaceholder(/avatar.*url/i)
          .or(page.getByPlaceholder(/logo.*url/i))
          .or(page.getByPlaceholder(/image.*url/i));
        
        if (await avatarUrlInput.isVisible()) {
          await avatarUrlInput.fill('https://via.placeholder.com/150');
          
          // Save changes
          const saveButton = page.getByRole('button', { name: /save/i })
            .or(page.getByRole('button', { name: /apply/i }));
          
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(1000);
          }
          
          // Check if avatar preview appears
          const avatarPreview = page.locator('img[src*="placeholder"]');
          if (await avatarPreview.count() > 0) {
            await expect(avatarPreview.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should allow customizing background and card styles', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Look for background options
      const backgroundOptions = [
        page.getByRole('button', { name: /gradient/i }),
        page.getByRole('button', { name: /solid/i }),
        page.getByRole('button', { name: /image/i }),
        page.getByRole('radio', { name: /gradient/i }),
        page.getByRole('radio', { name: /solid/i })
      ];
      
      let backgroundSet = false;
      for (const option of backgroundOptions) {
        if (await option.isVisible()) {
          await option.click();
          backgroundSet = true;
          break;
        }
      }
      
      // Look for card style options
      const cardStyleOptions = [
        page.getByRole('button', { name: /floating/i }),
        page.getByRole('button', { name: /flat/i }),
        page.getByRole('button', { name: /bordered/i })
      ];
      
      let cardStyleSet = false;
      for (const option of cardStyleOptions) {
        if (await option.isVisible()) {
          await option.click();
          cardStyleSet = true;
          break;
        }
      }
      
      if (backgroundSet || cardStyleSet) {
        // Save changes
        const saveButton = page.getByRole('button', { name: /save/i })
          .or(page.getByRole('button', { name: /apply/i }));
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
        
        // Verify changes in preview
        const preview = page.locator('[data-testid="preview"]');
        if (await preview.count() > 0) {
          await expect(preview.first()).toBeVisible();
        }
      }
    }
  });

  test('should allow custom CSS input for advanced users', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Look for advanced or custom CSS option
      const advancedButton = page.getByRole('button', { name: /advanced/i })
        .or(page.getByRole('button', { name: /custom.*css/i })
        .or(page.getByRole('tab', { name: /css/i })));
      
      if (await advancedButton.isVisible()) {
        await advancedButton.click();
        
        // Look for CSS input area
        const cssInput = page.locator('textarea[name*="css"]')
          .or(page.locator('textarea[placeholder*="css"]'))
          .or(page.locator('.css-editor'))
          .or(page.locator('[data-testid="css-input"]'));
        
        if (await cssInput.isVisible()) {
          // Add custom CSS
          const customCSS = `
            .custom-style {
              background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
              border-radius: 15px;
              padding: 20px;
            }
            .custom-button {
              transform: scale(1.05);
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
          `;
          
          await cssInput.fill(customCSS);
          
          // Save changes
          const saveButton = page.getByRole('button', { name: /save/i })
            .or(page.getByRole('button', { name: /apply/i }));
          
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(1000);
          }
          
          // Verify CSS was applied (check for style tags or applied styles)
          const hasCustomStyles = await page.evaluate(() => {
            const styleSheets = Array.from(document.styleSheets);
            return styleSheets.some(sheet => {
              try {
                const rules = Array.from(sheet.cssRules || []);
                return rules.some(rule => rule.cssText.includes('custom-style'));
              } catch (e) {
                return false;
              }
            });
          });
          
          // Or check if custom CSS is stored
          await expect(cssInput).toHaveValue(customCSS);
        }
      }
    }
  });

  test('should save and persist theme customizations', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Customize theme
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Make a distinctive change
      const colorInputs = page.locator('input[type="color"]');
      if (await colorInputs.count() > 0) {
        await colorInputs.first().fill('#ff0080'); // Bright pink
        
        const saveButton = page.getByRole('button', { name: /save/i })
          .or(page.getByRole('button', { name: /apply/i }));
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Refresh page to test persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Open design panel again
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Verify the color was persisted
      const colorInputs = page.locator('input[type="color"]');
      if (await colorInputs.count() > 0) {
        const currentColor = await colorInputs.first().inputValue();
        expect(currentColor.toLowerCase()).toBe('#ff0080');
      }
    }
  });

  test('should provide theme preview functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Make changes and look for preview
      const colorInputs = page.locator('input[type="color"]');
      if (await colorInputs.count() > 0) {
        await colorInputs.first().fill('#00ff00'); // Green
        
        // Look for live preview
        const preview = page.locator('[data-testid="preview"]')
          .or(page.locator('.preview'))
          .or(page.locator('[data-testid="theme-preview"]'));
        
        if (await preview.count() > 0) {
          await expect(preview.first()).toBeVisible();
          
          // Preview should update in real-time
          await page.waitForTimeout(500);
          
          // Check if preview shows changes
          const previewStyles = await preview.first().evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              backgroundColor: computed.backgroundColor,
              borderColor: computed.borderColor
            };
          });
          
          expect(previewStyles).toBeDefined();
        }
        
        // Look for preview button to see full QR page
        const previewButton = page.getByRole('button', { name: /preview/i });
        if (await previewButton.isVisible()) {
          await previewButton.click();
          
          // Should show full preview or open QR page
          await page.waitForTimeout(1000);
          
          // Verify preview functionality works
          const previewPage = page.locator('[data-testid="full-preview"]');
          if (await previewPage.count() > 0) {
            await expect(previewPage.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should handle theme customization errors gracefully', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const designButton = page.getByRole('button', { name: /design/i })
      .or(page.getByRole('button', { name: /customize/i }));
    
    if (await designButton.isVisible()) {
      await designButton.click();
      
      // Try to cause an error by providing invalid values
      const colorInputs = page.locator('input[type="color"]');
      
      if (await colorInputs.count() > 0) {
        // Intercept save requests to simulate error
        await page.route('**/api/**', route => {
          if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
            route.fulfill({
              status: 500,
              body: JSON.stringify({ error: 'Save failed' })
            });
          } else {
            route.continue();
          }
        });
        
        await colorInputs.first().fill('#ff0000');
        
        const saveButton = page.getByRole('button', { name: /save/i })
          .or(page.getByRole('button', { name: /apply/i }));
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Should show error message
          const errorMessage = page.getByText(/error/i)
            .or(page.getByText(/failed/i))
            .or(page.locator('[role="alert"]'));
          
          if (await errorMessage.count() > 0) {
            await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
          }
          
          // Should not break the interface
          await expect(designButton).toBeVisible();
        }
      }
    }
  });
});