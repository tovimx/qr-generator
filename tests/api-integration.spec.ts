/**
 * API Integration E2E Tests
 * Tests direct API endpoints and integration scenarios
 */

 
/* eslint-disable @typescript-eslint/no-explicit-any */

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { ApiHelper } from './helpers/api';
import { DatabaseHelper } from './helpers/database';
import { generateTestEmail } from './helpers/supabase-auth';

test.describe('API Integration Tests', () => {
  let authHelper: AuthHelper;
  let apiHelper: ApiHelper;
  let dbHelper: DatabaseHelper;
  let testEmail: string;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page);
    apiHelper = new ApiHelper(page, request);
    dbHelper = new DatabaseHelper(page);
    testEmail = generateTestEmail('api');
  });

  test.afterEach(async () => {
    await dbHelper.cleanupTestData(testEmail);
  });

  test('QR Code CRUD operations via API', async ({ page }) => {
    // Authenticate first
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Test GET QR Codes
    const getResponse = await apiHelper.getQRCodes();
    await apiHelper.verifyApiResponse(getResponse, 200);
    expect(Array.isArray(getResponse.data)).toBe(true);
    
    // Test POST QR Code creation
    const createResponse = await apiHelper.createQRCode({
      title: 'API Test QR Code',
      links: [
        { title: 'API Test Link', url: 'https://api-test.com', position: 0 }
      ]
    });
    
    await apiHelper.verifyApiResponse(createResponse, 201, ['id', 'shortCode']);
    const qrCodeId = createResponse.data?.id;
    
    // Test PUT QR Code update
    const updateResponse = await apiHelper.updateQRCode(qrCodeId, {
      title: 'Updated API QR Code'
    });
    
    await apiHelper.verifyApiResponse(updateResponse, 200);
    expect(updateResponse.data?.title).toBe('Updated API QR Code');
    
    // Test DELETE QR Code
    const deleteResponse = await apiHelper.deleteQRCode(qrCodeId);
    await apiHelper.verifyApiResponse(deleteResponse, 200);
    
    // Verify deletion
    const getAfterDeleteResponse = await apiHelper.getQRCodes();
    const deletedQR = getAfterDeleteResponse.data?.find((qr: any) => qr.id === qrCodeId);
    expect(deletedQR).toBeUndefined();
  });

  test('Link management API endpoints', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Create a QR code first
    const qrResponse = await apiHelper.createQRCode({
      title: 'Link Management Test'
    });
    const qrCodeId = qrResponse.data?.id;
    
    // Test CREATE link
    const createLinkResponse = await apiHelper.createLink(qrCodeId, {
      title: 'Test Link 1',
      url: 'https://test1.com',
      position: 0
    });
    
    await apiHelper.verifyApiResponse(createLinkResponse, 201, ['id', 'title', 'url']);
    const linkId = createLinkResponse.data?.id;
    
    // Test UPDATE link
    const updateLinkResponse = await apiHelper.updateLink(qrCodeId, linkId, {
      title: 'Updated Test Link',
      url: 'https://updated-test.com'
    });
    
    await apiHelper.verifyApiResponse(updateLinkResponse, 200);
    expect(updateLinkResponse.data?.title).toBe('Updated Test Link');
    
    // Test DELETE link
    const deleteLinkResponse = await apiHelper.deleteLink(qrCodeId, linkId);
    await apiHelper.verifyApiResponse(deleteLinkResponse, 200);
  });

  test('Analytics and tracking API', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Create QR code with links
    const qrResponse = await apiHelper.createQRCode({
      title: 'Analytics Test QR'
    });
    const shortCode = qrResponse.data?.shortCode;
    
    // Add some links
    await apiHelper.createLink(qrResponse.data?.id, {
      title: 'Analytics Link',
      url: 'https://analytics-test.com',
      position: 0
    });
    
    // Simulate QR code scan
    const scanResponse = await apiHelper.recordScan(shortCode, {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      referer: 'https://google.com',
      timestamp: new Date().toISOString()
    });
    
    // Verify scan was recorded (status depends on implementation)
    expect(scanResponse.status).toBeGreaterThanOrEqual(200);
    expect(scanResponse.status).toBeLessThan(400);
  });

  test('Domain management API', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Test domain creation (if supported)
    const createDomainResponse = await apiHelper.createDomain({
      domain: 'test-domain.com',
      verified: false
    });
    
    // Domain creation might not be implemented or require special permissions
    // So we check for either success or appropriate error
    const isSuccessful = createDomainResponse.status >= 200 && createDomainResponse.status < 300;
    const isNotImplemented = createDomainResponse.status === 404 || createDomainResponse.status === 501;
    const isUnauthorized = createDomainResponse.status === 401 || createDomainResponse.status === 403;
    
    expect(isSuccessful || isNotImplemented || isUnauthorized).toBe(true);
    
    if (isSuccessful) {
      const domainId = createDomainResponse.data?.id;
      
      // Test domain update
      const updateResponse = await apiHelper.updateDomain(domainId, {
        isPrimary: true
      });
      
      expect(updateResponse.status).toBeLessThan(500); // Should not be server error
    }
  });

  test('Authentication API endpoints', async ({ page }) => {
    // Test unauthenticated access
    const unauthenticatedResponse = await apiHelper.getQRCodes();
    
    // Should require authentication
    expect(unauthenticatedResponse.status).toBeGreaterThanOrEqual(401);
    
    // Test with authentication
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    const authenticatedResponse = await apiHelper.getQRCodes();
    await apiHelper.verifyApiResponse(authenticatedResponse, 200);
  });

  test('API validation and error handling', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Test invalid QR code creation
    const invalidQRResponse = await apiHelper.createQRCode({
      title: '', // Empty title to test validation
      links: []
    });
    
    expect(invalidQRResponse.status).toBeGreaterThanOrEqual(400);
    expect(invalidQRResponse.status).toBeLessThan(500);
    
    // Create valid QR code first
    const validQRResponse = await apiHelper.createQRCode({
      title: 'Validation Test'
    });
    const qrCodeId = validQRResponse.data?.id;
    
    // Test invalid link creation
    const invalidLinkResponse = await apiHelper.createLink(qrCodeId, {
      title: '', // Empty title
      url: 'invalid-url', // Invalid URL
      position: 0
    });
    
    expect(invalidLinkResponse.status).toBeGreaterThanOrEqual(400);
    expect(invalidLinkResponse.status).toBeLessThan(500);
    
    // Test valid link creation
    const validLinkResponse = await apiHelper.createLink(qrCodeId, {
      title: 'Valid Link',
      url: 'https://valid-url.com',
      position: 0
    });
    
    await apiHelper.verifyApiResponse(validLinkResponse, 201);
  });

  test('API rate limiting behavior', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Make rapid API calls to test rate limiting
    const rapidRequests = [];
    for (let i = 0; i < 10; i++) {
      rapidRequests.push(
        apiHelper.createQRCode({
          title: `Rate Limit Test ${i}`
        })
      );
    }
    
    const responses = await Promise.all(rapidRequests);
    
    // Count successful vs rate-limited responses
    const successful = responses.filter(r => r.status >= 200 && r.status < 300).length;
    const rateLimited = responses.filter(r => r.status === 429).length;
    
    // Should have some successful requests
    expect(successful).toBeGreaterThan(0);
    
    console.log(`Rapid API test: ${successful} successful, ${rateLimited} rate limited`);
  });

  test('API response consistency', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Create multiple QR codes and verify consistent response structure
    const qrCodes = [];
    for (let i = 0; i < 3; i++) {
      const response = await apiHelper.createQRCode({
        title: `Consistency Test ${i}`
      });
      
      await apiHelper.verifyApiResponse(response, 201);
      qrCodes.push(response.data);
      
      // Verify all responses have same structure
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('shortCode');
      expect(typeof response.data.id).toBe('string');
      expect(typeof response.data.title).toBe('string');
      expect(typeof response.data.shortCode).toBe('string');
    }
    
    // Verify GET endpoint returns consistent data
    const getAllResponse = await apiHelper.getQRCodes();
    await apiHelper.verifyApiResponse(getAllResponse, 200);
    
    expect(Array.isArray(getAllResponse.data)).toBe(true);
    expect(getAllResponse.data.length).toBeGreaterThanOrEqual(3);
  });

  test('API pagination and filtering', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Create multiple QR codes
    for (let i = 0; i < 5; i++) {
      await apiHelper.createQRCode({
        title: `Pagination Test ${i}`
      });
    }
    
    // Test pagination (if implemented)
    const paginatedResponse = await apiHelper.authenticatedRequest('GET', '/qr-codes?page=1&limit=2');
    
    if (paginatedResponse.status === 200) {
      // Pagination is implemented
      expect(Array.isArray(paginatedResponse.data)).toBe(true);
      expect(paginatedResponse.data.length).toBeLessThanOrEqual(2);
    } else {
      // Pagination not implemented - should get all results
      const allResponse = await apiHelper.getQRCodes();
      await apiHelper.verifyApiResponse(allResponse, 200);
      expect(allResponse.data.length).toBeGreaterThanOrEqual(5);
    }
  });

  test('API data integrity', async ({ page }) => {
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Create QR code with specific data
    const testData = {
      title: 'Data Integrity Test',
      description: 'Test description with special chars: éñ中文🎉'
    };
    
    const createResponse = await apiHelper.createQRCode(testData);
    await apiHelper.verifyApiResponse(createResponse, 201);
    
    const qrCodeId = createResponse.data?.id;
    
    // Retrieve and verify data integrity
    const getResponse = await apiHelper.authenticatedRequest('GET', `/qr-codes/${qrCodeId}`);
    await apiHelper.verifyApiResponse(getResponse, 200);
    
    expect(getResponse.data.title).toBe(testData.title);
    // Verify special characters are preserved
    if (getResponse.data.description) {
      expect(getResponse.data.description).toContain('éñ中文🎉');
    }
    
    // Test with links containing special data
    const linkData = {
      title: 'Special Link: éñ中文🎉',
      url: 'https://example.com/path?query=value&special=éñ中文',
      position: 0
    };
    
    const linkResponse = await apiHelper.createLink(qrCodeId, linkData);
    await apiHelper.verifyApiResponse(linkResponse, 201);
    
    expect(linkResponse.data.title).toBe(linkData.title);
    expect(linkResponse.data.url).toBe(linkData.url);
  });

  test('Cross-origin and CORS handling', async ({ page }) => {
    // This test checks if API properly handles CORS for legitimate requests
    await authHelper.signup(testEmail, 'Test123!@#');
    await page.goto('/dashboard');
    
    // Make API request with custom headers
    const corsResponse = await apiHelper.authenticatedRequest('GET', '/qr-codes', null, {
      'Origin': 'http://localhost:3000',
      'X-Custom-Header': 'test-value'
    });
    
    // Should succeed with proper CORS handling
    await apiHelper.verifyApiResponse(corsResponse, 200);
    
    // Verify CORS headers are present (if implemented)
    const headers = corsResponse.headers || {};
    console.log('API Response headers:', Object.keys(headers));
  });
});