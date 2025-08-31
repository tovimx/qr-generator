/**
 * Comprehensive User Journey E2E Tests
 * Tests complete user workflows from signup to QR code usage
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { QRCodePage } from './helpers/qr-page';
import { createTestUser, cleanupTestUser, createTestQRCode, addLinksToQRCode } from './helpers/database';
import { generateTestEmail } from './helpers/supabase-auth';

test.describe('Complete User Journeys', () => {
  let authHelper: AuthHelper;
  let qrPage: QRCodePage;
  let testEmail: string;
  const testPassword = 'Test123!@#';

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    qrPage = new QRCodePage(page);
    testEmail = generateTestEmail('journey');
  });

  test.afterEach(async () => {
    // Cleanup handled by Supabase auth helpers
  });

  test('Complete new user onboarding and first QR code creation', async ({ page }) => {
    // 1. User signs up for new account
    await page.goto('/signup');
    await authHelper.signup(testEmail, testPassword);
    
    // 2. Should be redirected to dashboard with auto-created QR code
    await expect(page).toHaveURL('/dashboard');
    await qrPage.verifyQRCodeDisplayed();
    
    // 3. QR code should have default title and no links
    const shortLink = await qrPage.getShortLink();
    expect(shortLink).toMatch(/\/q\/[a-zA-Z0-9]+/);
    
    // 4. User updates QR code title
    await qrPage.updateTitle('My First QR Code');
    
    // 5. User adds their first link
    await qrPage.addLink('My Website', 'https://mywebsite.com');
    
    // 6. User adds social media links
    await qrPage.addLink('Twitter', 'https://twitter.com/myhandle');
    await qrPage.addLink('LinkedIn', 'https://linkedin.com/in/myprofile');
    
    // 7. Verify all links are displayed
    const links = await qrPage.getLinks();
    expect(links).toHaveLength(3);
    expect(links.some(link => link.title === 'My Website')).toBe(true);
    
    // 8. Test the QR code redirect works
    const shortCode = shortLink.replace('/q/', '');
    await qrPage.testQRCodeRedirect(shortCode);
    
    // 9. Verify QR page displays all links
    await qrPage.verifyQRPageLinks([
      { title: 'My Website', url: 'https://mywebsite.com' },
      { title: 'Twitter', url: 'https://twitter.com/myhandle' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/myprofile' }
    ]);
  });

  test('Business user creates multiple QR codes for different campaigns', async ({ page }) => {
    // 1. User signs up and gets to dashboard
    await authHelper.signup(testEmail, testPassword);
    await qrPage.goto();
    
    // 2. User creates QR code for business card
    await qrPage.updateTitle('Business Card QR');
    await qrPage.addMultipleLinks([
      { title: 'Company Website', url: 'https://company.com' },
      { title: 'LinkedIn Profile', url: 'https://linkedin.com/in/business' },
      { title: 'Email Me', url: 'mailto:business@company.com' }
    ]);
    
    // 3. Note: In MVP version, user might have only 1 QR code
    // This test would need to be updated based on actual multi-QR functionality
    
    // 4. User tests the business card QR code
    const shortLink1 = await qrPage.getShortLink();
    const shortCode1 = shortLink1.replace('/q/', '');
    
    await qrPage.testQRCodeRedirect(shortCode1);
    await qrPage.verifyQRPageLinks([
      { title: 'Company Website', url: 'https://company.com' },
      { title: 'LinkedIn Profile', url: 'https://linkedin.com/in/business' },
      { title: 'Email Me', url: 'mailto:business@company.com' }
    ]);
    
    // 5. User downloads QR code for printing
    await page.goBack();
    await qrPage.downloadQRCode();
  });

  test('Event organizer creates QR code for event promotion', async ({ page }) => {
    // 1. Setup user account
    await authHelper.signup(testEmail, testPassword);
    await qrPage.goto();
    
    // 2. Create event-specific QR code
    await qrPage.updateTitle('Tech Conference 2024');
    
    // 3. Add event-related links
    await qrPage.addMultipleLinks([
      { title: 'Register for Event', url: 'https://eventbrite.com/tech-conference' },
      { title: 'Event Schedule', url: 'https://conference.com/schedule' },
      { title: 'Venue Information', url: 'https://venue.com/location' },
      { title: 'Contact Organizer', url: 'mailto:organizer@conference.com' }
    ]);
    
    // 4. Verify QR code works for event promotion
    const shortLink = await qrPage.getShortLink();
    const shortCode = shortLink.replace('/q/', '');
    
    // 5. Simulate event attendee scanning QR code
    await qrPage.testQRCodeRedirect(shortCode);
    
    // 6. Verify all event information is accessible
    await qrPage.verifyQRPageLinks([
      { title: 'Register for Event', url: 'https://eventbrite.com/tech-conference' },
      { title: 'Event Schedule', url: 'https://conference.com/schedule' },
      { title: 'Venue Information', url: 'https://venue.com/location' },
      { title: 'Contact Organizer', url: 'mailto:organizer@conference.com' }
    ]);
    
    // 7. Test clicking on registration link (analytics would be tracked)
    await qrPage.clickLinkAndVerifyAnalytics('Register for Event');
  });

  test('Restaurant owner creates menu QR code', async ({ page }) => {
    // 1. Restaurant owner signs up
    await authHelper.signup(testEmail, testPassword);
    await qrPage.goto();
    
    // 2. Create restaurant QR code
    await qrPage.updateTitle('Bella Vista Restaurant');
    
    // 3. Add restaurant links
    await qrPage.addMultipleLinks([
      { title: 'View Menu', url: 'https://restaurant.com/menu' },
      { title: 'Make Reservation', url: 'https://opentable.com/bellavista' },
      { title: 'Order Online', url: 'https://ubereats.com/bellavista' },
      { title: 'Contact Us', url: 'tel:+1234567890' },
      { title: 'Leave Review', url: 'https://google.com/maps/bellavista' }
    ]);
    
    // 4. Test maximum links limit (should be 5 links max)
    await qrPage.testMaxLinksLimit(5);
    
    // 5. Customer scans QR code at table
    const shortLink = await qrPage.getShortLink();
    const shortCode = shortLink.replace('/q/', '');
    
    await qrPage.testQRCodeRedirect(shortCode);
    
    // 6. Customer can access all restaurant services
    await qrPage.verifyQRPageLinks([
      { title: 'View Menu', url: 'https://restaurant.com/menu' },
      { title: 'Make Reservation', url: 'https://opentable.com/bellavista' },
      { title: 'Order Online', url: 'https://ubereats.com/ubereats.com/bellavista' },
      { title: 'Contact Us', url: 'tel:+1234567890' },
      { title: 'Leave Review', url: 'https://google.com/maps/bellavista' }
    ]);
    
    // 7. Test responsive design for mobile customers
    await qrPage.verifyResponsiveDesign();
  });

  test('Freelancer creates portfolio QR code for networking', async ({ page }) => {
    // 1. Freelancer creates account
    await authHelper.signup(testEmail, testPassword);
    await qrPage.goto();
    
    // 2. Create professional portfolio QR
    await qrPage.updateTitle('Jane Doe - Web Developer');
    
    // 3. Add professional links
    await qrPage.addMultipleLinks([
      { title: 'Portfolio Website', url: 'https://janedoe.dev' },
      { title: 'GitHub Profile', url: 'https://github.com/janedoe' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/janedoe' },
      { title: 'Email Contact', url: 'mailto:jane@janedoe.dev' }
    ]);
    
    // 4. Test QR code sharing functionality
    const shareUrl = await qrPage.shareQRCode();
    // Note: shareUrl might be null if native share API isn't available in test
    
    // 5. Test the networking scenario
    const shortLink = await qrPage.getShortLink();
    const shortCode = shortLink.replace('/q/', '');
    
    // 6. Potential client scans QR code
    await qrPage.testQRCodeRedirect(shortCode);
    
    // 7. Client can access all professional information
    await qrPage.verifyQRPageLinks([
      { title: 'Portfolio Website', url: 'https://janedoe.dev' },
      { title: 'GitHub Profile', url: 'https://github.com/janedoe' },
      { title: 'LinkedIn', url: 'https://linkedin.com/in/janedoe' },
      { title: 'Email Contact', url: 'mailto:jane@janedoe.dev' }
    ]);
    
    // 8. Test link editing for updates
    await page.goBack();
    await qrPage.editLink('Email Contact', 'Contact Me', 'mailto:contact@janedoe.dev');
    
    // 9. Verify updated link works
    await qrPage.testQRCodeRedirect(shortCode);
    const updatedLinks = await page.locator('a[href="mailto:contact@janedoe.dev"]');
    await expect(updatedLinks).toBeVisible();
  });

  test('User error recovery and edge cases', async ({ page }) => {
    // 1. User signs up
    await authHelper.signup(testEmail, testPassword);
    await qrPage.goto();
    
    // 2. Test invalid URL entry
    await page.getByRole('button', { name: /add link/i }).click();
    await page.getByPlaceholder(/title/i).fill('Invalid Link');
    await page.getByPlaceholder(/url/i).fill('not-a-valid-url');
    await page.getByRole('button', { name: /save/i }).click();
    
    await qrPage.verifyLinkValidationError('valid url');
    
    // 3. Test empty title
    await page.getByPlaceholder(/title/i).fill('');
    await page.getByPlaceholder(/url/i).fill('https://valid.com');
    await page.getByRole('button', { name: /save/i }).click();
    
    await qrPage.verifyLinkValidationError('title');
    
    // 4. Test successful link addition after fixing errors
    await page.getByPlaceholder(/title/i).fill('Valid Link');
    await page.getByPlaceholder(/url/i).fill('https://valid.com');
    await page.getByRole('button', { name: /save/i }).click();
    
    // 5. Verify link was added successfully
    await expect(page.getByText('Valid Link')).toBeVisible();
    
    // 6. Test link deletion
    await qrPage.deleteLink('Valid Link');
    
    // 7. Verify link was removed
    await expect(page.getByText('Valid Link')).not.toBeVisible();
    
    // 8. Test session persistence
    await page.reload();
    await expect(page).toHaveURL('/dashboard');
    await qrPage.verifyQRCodeDisplayed();
  });

  test('Performance and scalability test with maximum data', async ({ page }) => {
    // 1. Create user account
    await authHelper.signup(testEmail, testPassword);
    await qrPage.goto();
    
    // 2. Create QR code with maximum links
    await qrPage.updateTitle('Performance Test QR - Very Long Title That Tests Character Limits And Display Issues');
    
    // 3. Add maximum number of links with long URLs and titles
    const maxLinks = 5;
    for (let i = 1; i <= maxLinks; i++) {
      await qrPage.addLink(
        `Very Long Link Title Number ${i} That Tests Display Layout And Truncation`,
        `https://very-long-domain-name-for-testing-purposes-${i}.com/very/long/path/that/might/cause/issues?parameter=value&another=parameter`
      );
      
      // Add delay to prevent overwhelming the system
      await page.waitForTimeout(200);
    }
    
    // 4. Verify all links are still functional
    const links = await qrPage.getLinks();
    expect(links).toHaveLength(maxLinks);
    
    // 5. Test QR code generation with maximum data
    await qrPage.verifyQRCodeDisplayed();
    
    // 6. Test the QR page performance with maximum links
    const shortLink = await qrPage.getShortLink();
    const shortCode = shortLink.replace('/q/', '');
    
    await qrPage.testQRCodeRedirect(shortCode);
    
    // 7. Verify all links display correctly even with long content
    const linkElements = page.locator('a[href*="very-long-domain-name"]');
    const linkCount = await linkElements.count();
    expect(linkCount).toBe(maxLinks);
    
    // 8. Test responsive design with maximum content
    await qrPage.verifyResponsiveDesign();
  });
});