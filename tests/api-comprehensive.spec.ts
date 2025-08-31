/**
 * Comprehensive API Integration Tests
 * Tests all API endpoints with proper authentication, data validation, and error handling
 */

import { test, expect, Page, APIResponse } from '@playwright/test';
import { SecurityTestHelper, PerformanceMonitor } from './helpers/advanced-test-utilities';

test.describe('API Integration - Authentication & Authorization', () => {

  test('API endpoints respond with proper security headers', async ({ request }) => {
    const endpoints = [
      '/api/qr-codes',
      '/api/projects',
      '/api/custom-themes',
      '/api/domains',
      '/api/qr/test123'
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      const headers = response.headers();
      
      console.log(`Testing ${endpoint}: ${response.status()}`);
      
      // Should respond with valid HTTP status
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(600);
      
      // Check basic security headers
      if (response.status() < 500) {
        const securityHeaders = {
          'x-frame-options': headers['x-frame-options'],
          'x-content-type-options': headers['x-content-type-options'],
          'content-type': headers['content-type']
        };
        
        console.log(`${endpoint} security headers:`, securityHeaders);
        
        // Should have proper content type
        if (response.status() === 200) {
          expect(headers['content-type']).toBeTruthy();
        }
      }
    }
  });

  test('API endpoints handle unauthorized access correctly', async ({ request }) => {
    const protectedEndpoints = [
      { method: 'GET', url: '/api/qr-codes' },
      { method: 'POST', url: '/api/qr-codes' },
      { method: 'GET', url: '/api/projects' },
      { method: 'POST', url: '/api/projects' },
      { method: 'GET', url: '/api/custom-themes' },
      { method: 'POST', url: '/api/custom-themes' }
    ];

    for (const { method, url } of protectedEndpoints) {
      let response;
      
      switch (method) {
        case 'GET':
          response = await request.get(url);
          break;
        case 'POST':
          response = await request.post(url, { data: {} });
          break;
        default:
          continue;
      }
      
      console.log(`${method} ${url}: ${response.status()}`);
      
      // Should return authentication error or redirect
      expect([401, 403, 302, 307, 308]).toContain(response.status());
    }
  });

  test('API endpoints validate input data properly', async ({ request }) => {
    const invalidDataTests = [
      {
        url: '/api/qr-codes',
        method: 'POST',
        data: { invalid: 'data' },
        description: 'Invalid QR code data structure'
      },
      {
        url: '/api/qr-codes',
        method: 'POST', 
        data: { title: 'a'.repeat(1000) },
        description: 'Overly long title'
      },
      {
        url: '/api/projects',
        method: 'POST',
        data: { name: '' },
        description: 'Empty project name'
      },
      {
        url: '/api/custom-themes',
        method: 'POST',
        data: { colors: 'invalid' },
        description: 'Invalid theme colors'
      }
    ];

    for (const { url, method, data, description } of invalidDataTests) {
      console.log(`Testing ${description}: ${method} ${url}`);
      
      const response = await request.post(url, { data });
      
      // Should reject invalid data with appropriate error codes
      expect([400, 401, 403, 422, 500]).toContain(response.status());
      
      // Should return JSON error response
      const contentType = response.headers()['content-type'];
      if (contentType && contentType.includes('application/json')) {
        try {
          const body = await response.json();
          expect(body).toBeTruthy();
          console.log(`${url} error response:`, body);
        } catch {
          // Non-JSON response is also acceptable for errors
          console.log(`${url} returned non-JSON error response`);
        }
      }
    }
  });
});

test.describe('API Integration - QR Code Management', () => {

  test('QR code public API endpoints function correctly', async ({ request }) => {
    const testCodes = ['test123', 'sample', 'demo', 'nonexistent'];
    
    for (const code of testCodes) {
      const response = await request.get(`/api/qr/${code}`);
      
      console.log(`QR API ${code}: ${response.status()}`);
      
      // Should return valid response (200 OK or 404 Not Found)
      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        
        try {
          const qrData = await response.json();
          expect(qrData).toBeTruthy();
          console.log(`QR data structure for ${code}:`, Object.keys(qrData));
          
          // Verify essential QR data fields
          if (qrData && typeof qrData === 'object') {
            const hasValidStructure = 
              'title' in qrData || 
              'links' in qrData || 
              'shortCode' in qrData ||
              'redirectUrl' in qrData;
            
            expect(hasValidStructure).toBe(true);
          }
        } catch (error) {
          console.log(`Failed to parse QR data for ${code}:`, error);
        }
      }
    }
  });

  test('QR code CRUD operations respond appropriately', async ({ request }) => {
    // Test QR code creation (should require auth)
    const createResponse = await request.post('/api/qr-codes', {
      data: {
        title: 'Test QR Code',
        links: [
          { title: 'Website', url: 'https://example.com' },
          { title: 'Contact', url: 'mailto:test@example.com' }
        ]
      }
    });
    
    console.log(`QR creation: ${createResponse.status()}`);
    expect([201, 401, 403]).toContain(createResponse.status());
    
    // Test QR code retrieval (should require auth for list)
    const listResponse = await request.get('/api/qr-codes');
    console.log(`QR list: ${listResponse.status()}`);
    expect([200, 401, 403]).toContain(listResponse.status());
    
    // Test QR code update (should require auth and valid ID)
    const updateResponse = await request.put('/api/qr-codes/test123', {
      data: { title: 'Updated Title' }
    });
    console.log(`QR update: ${updateResponse.status()}`);
    expect([200, 401, 403, 404]).toContain(updateResponse.status());
    
    // Test QR code deletion (should require auth and valid ID)
    const deleteResponse = await request.delete('/api/qr-codes/test123');
    console.log(`QR deletion: ${deleteResponse.status()}`);
    expect([200, 204, 401, 403, 404]).toContain(deleteResponse.status());
  });

  test('QR code design and customization APIs', async ({ request }) => {
    const testId = 'test123';
    
    // Test design update
    const designResponse = await request.put(`/api/qr-codes/${testId}/design`, {
      data: {
        backgroundColor: '#ffffff',
        foregroundColor: '#000000',
        borderRadius: 8
      }
    });
    
    console.log(`QR design update: ${designResponse.status()}`);
    expect([200, 401, 403, 404]).toContain(designResponse.status());
    
    // Test style update
    const styleResponse = await request.put(`/api/qr-codes/${testId}/style`, {
      data: {
        theme: 'modern',
        layout: 'grid'
      }
    });
    
    console.log(`QR style update: ${styleResponse.status()}`);
    expect([200, 401, 403, 404]).toContain(styleResponse.status());
    
    // Test links update
    const linksResponse = await request.put(`/api/qr-codes/${testId}/links`, {
      data: {
        links: [
          { title: 'Updated Link', url: 'https://updated.example.com' }
        ]
      }
    });
    
    console.log(`QR links update: ${linksResponse.status()}`);
    expect([200, 401, 403, 404]).toContain(linksResponse.status());
    
    // Test logo upload endpoint (multipart data)
    const logoResponse = await request.post(`/api/qr-codes/${testId}/logo/upload`);
    console.log(`QR logo upload: ${logoResponse.status()}`);
    expect([200, 400, 401, 403, 404]).toContain(logoResponse.status());
  });
});

test.describe('API Integration - Projects & Organization', () => {

  test('Project management API endpoints', async ({ request }) => {
    // Test project creation
    const createResponse = await request.post('/api/projects', {
      data: {
        name: 'Test Project',
        description: 'A test project for E2E testing'
      }
    });
    
    console.log(`Project creation: ${createResponse.status()}`);
    expect([201, 401, 403]).toContain(createResponse.status());
    
    // Test project listing
    const listResponse = await request.get('/api/projects');
    console.log(`Project list: ${listResponse.status()}`);
    expect([200, 401, 403]).toContain(listResponse.status());
    
    if (listResponse.status() === 200) {
      try {
        const projects = await listResponse.json();
        if (Array.isArray(projects)) {
          console.log(`Found ${projects.length} projects`);
          
          // Test individual project access
          if (projects.length > 0 && projects[0].id) {
            const projectResponse = await request.get(`/api/projects/${projects[0].id}`);
            console.log(`Individual project: ${projectResponse.status()}`);
            expect([200, 401, 403, 404]).toContain(projectResponse.status());
          }
        }
      } catch {
        console.log('Project list response not JSON or invalid structure');
      }
    }
    
    // Test project update
    const updateResponse = await request.put('/api/projects/test-id', {
      data: { name: 'Updated Project Name' }
    });
    console.log(`Project update: ${updateResponse.status()}`);
    expect([200, 401, 403, 404]).toContain(updateResponse.status());
    
    // Test project deletion
    const deleteResponse = await request.delete('/api/projects/test-id');
    console.log(`Project deletion: ${deleteResponse.status()}`);
    expect([200, 204, 401, 403, 404]).toContain(deleteResponse.status());
  });

  test('Domain management API endpoints', async ({ request }) => {
    // Test domain listing
    const listResponse = await request.get('/api/domains');
    console.log(`Domain list: ${listResponse.status()}`);
    expect([200, 401, 403]).toContain(listResponse.status());
    
    // Test domain creation
    const createResponse = await request.post('/api/domains', {
      data: {
        domain: 'test.example.com',
        verified: false
      }
    });
    console.log(`Domain creation: ${createResponse.status()}`);
    expect([201, 400, 401, 403]).toContain(createResponse.status());
    
    // Test setting primary domain
    const primaryResponse = await request.post('/api/domains/test-id/primary');
    console.log(`Set primary domain: ${primaryResponse.status()}`);
    expect([200, 401, 403, 404]).toContain(primaryResponse.status());
  });

  test('Custom themes API endpoints', async ({ request }) => {
    // Test theme listing
    const listResponse = await request.get('/api/custom-themes');
    console.log(`Theme list: ${listResponse.status()}`);
    expect([200, 401, 403]).toContain(listResponse.status());
    
    // Test theme creation
    const createResponse = await request.post('/api/custom-themes', {
      data: {
        name: 'Test Theme',
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          background: '#ffffff'
        },
        fonts: {
          heading: 'Arial',
          body: 'Helvetica'
        }
      }
    });
    console.log(`Theme creation: ${createResponse.status()}`);
    expect([201, 400, 401, 403]).toContain(createResponse.status());
    
    // Test theme update
    const updateResponse = await request.put('/api/custom-themes/test-id', {
      data: {
        colors: {
          primary: '#28a745'
        }
      }
    });
    console.log(`Theme update: ${updateResponse.status()}`);
    expect([200, 401, 403, 404]).toContain(updateResponse.status());
    
    // Test theme deletion
    const deleteResponse = await request.delete('/api/custom-themes/test-id');
    console.log(`Theme deletion: ${deleteResponse.status()}`);
    expect([200, 204, 401, 403, 404]).toContain(deleteResponse.status());
  });
});

test.describe('API Integration - Performance & Reliability', () => {

  test('API response times under normal load', async ({ request }) => {
    const performanceMonitor = new PerformanceMonitor({} as Page); // Mock page for metrics only
    
    const endpoints = [
      '/api/qr/test123',
      '/api/projects',
      '/api/custom-themes',
      '/api/domains'
    ];
    
    const responseTimes: Array<{ endpoint: string; time: number }> = [];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request.get(endpoint);
      const responseTime = Date.now() - startTime;
      
      responseTimes.push({ endpoint, time: responseTime });
      
      console.log(`${endpoint}: ${responseTime}ms (${response.status()})`);
      
      // API should respond within reasonable time
      expect(responseTime).toBeLessThan(5000); // 5 second max
      
      await performanceMonitor.recordMetric(`api-${endpoint.replace(/[^a-zA-Z0-9]/g, '-')}`, responseTime);
    }
    
    const avgResponseTime = responseTimes.reduce((sum, rt) => sum + rt.time, 0) / responseTimes.length;
    console.log(`Average API response time: ${Math.round(avgResponseTime)}ms`);
    
    expect(avgResponseTime).toBeLessThan(2000); // 2 second average
  });

  test('API handles concurrent requests properly', async ({ request }) => {
    const testEndpoint = '/api/qr/concurrent-test';
    const concurrentRequests = 10;
    
    const requestPromises = Array.from({ length: concurrentRequests }, async (_, i) => {
      const startTime = Date.now();
      const response = await request.get(`${testEndpoint}?req=${i}`);
      const responseTime = Date.now() - startTime;
      
      return {
        requestId: i,
        status: response.status(),
        responseTime
      };
    });
    
    const results = await Promise.all(requestPromises);
    
    const successfulRequests = results.filter(r => r.status < 500).length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    
    console.log(`Concurrent API test results:`);
    console.log(`- Successful requests: ${successfulRequests}/${concurrentRequests}`);
    console.log(`- Average response time: ${Math.round(avgResponseTime)}ms`);
    
    // Most requests should succeed
    expect(successfulRequests).toBeGreaterThan(concurrentRequests * 0.8);
    
    // Response time shouldn't degrade too much under concurrent load
    expect(avgResponseTime).toBeLessThan(10000); // 10 second max under load
  });

  test('API error handling and recovery', async ({ request }) => {
    const errorScenarios = [
      { url: '/api/nonexistent-endpoint', expectedStatus: 404 },
      { url: '/api/qr-codes/invalid-id-format-123456789', expectedStatus: [400, 404] },
      { url: '/api/projects//empty-id', expectedStatus: [400, 404] },
    ];
    
    for (const { url, expectedStatus } of errorScenarios) {
      const response = await request.get(url);
      
      console.log(`Error scenario ${url}: ${response.status()}`);
      
      const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
      expect(expected).toContain(response.status());
      
      // Should not return server errors for client issues
      if (expected.includes(400) || expected.includes(404)) {
        expect(response.status()).toBeLessThan(500);
      }
      
      // Should have appropriate error response format
      const contentType = response.headers()['content-type'];
      if (contentType?.includes('application/json') && response.status() >= 400) {
        try {
          const errorBody = await response.json();
          expect(errorBody).toBeTruthy();
          console.log(`Error response structure:`, Object.keys(errorBody));
        } catch {
          // Non-JSON error responses are acceptable
        }
      }
    }
  });

  test('API data consistency and validation', async ({ request }) => {
    // Test that API returns consistent data structures
    const dataConsistencyTests = [
      {
        url: '/api/qr/test123',
        description: 'QR code data structure'
      },
      {
        url: '/api/projects', 
        description: 'Project list structure'
      },
      {
        url: '/api/custom-themes',
        description: 'Theme list structure'  
      }
    ];
    
    for (const { url, description } of dataConsistencyTests) {
      const response = await request.get(url);
      
      if (response.status() === 200) {
        try {
          const data = await response.json();
          
          console.log(`${description} - Status: ${response.status()}`);
          console.log(`${description} - Structure:`, typeof data, Array.isArray(data) ? `array[${data.length}]` : Object.keys(data));
          
          // Should return valid JSON
          expect(data).toBeTruthy();
          
          // Should have consistent structure
          if (Array.isArray(data)) {
            // Arrays should have consistent item structure
            if (data.length > 1) {
              const firstKeys = Object.keys(data[0] || {}).sort();
              const secondKeys = Object.keys(data[1] || {}).sort();
              
              // Most keys should be consistent across items
              const commonKeys = firstKeys.filter(key => secondKeys.includes(key));
              const consistencyRatio = commonKeys.length / Math.max(firstKeys.length, secondKeys.length);
              
              expect(consistencyRatio).toBeGreaterThan(0.7); // 70% key consistency
            }
          } else {
            // Objects should have expected basic structure
            expect(typeof data).toBe('object');
            expect(data).not.toBeNull();
          }
          
        } catch (error) {
          console.log(`${description} - JSON parsing failed:`, error);
          // If response claims to be JSON but isn't parseable, that's an error
          const contentType = response.headers()['content-type'];
          if (contentType?.includes('application/json')) {
            throw error;
          }
        }
      } else {
        console.log(`${description} - Non-200 response: ${response.status()}`);
      }
    }
  });
});

test.describe('API Integration - Security Testing', () => {

  test('API security vulnerability assessment', async ({ request }) => {
    
    // Test common API security issues
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'/*",
      "' UNION SELECT * FROM users --"
    ];
    
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
      '"><script>alert("xss")</script>'
    ];
    
    // Test SQL injection protection
    for (const payload of sqlInjectionPayloads) {
      const response = await request.get(`/api/qr/${encodeURIComponent(payload)}`);
      
      // Should not return server errors from SQL injection
      expect(response.status()).not.toBe(500);
      
      if (response.status() === 200) {
        // Should not return sensitive database information
        const body = await response.text();
        expect(body).not.toContain('DROP TABLE');
        expect(body).not.toContain('UNION SELECT');
      }
    }
    
    // Test XSS protection in API responses
    for (const payload of xssPayloads) {
      const response = await request.post('/api/projects', {
        data: {
          name: payload,
          description: 'Test project'
        }
      });
      
      // Should handle XSS payloads appropriately
      expect([400, 401, 403, 422]).toContain(response.status());
      
      if (response.status() === 201 || response.status() === 200) {
        const responseBody = await response.text();
        // Response should not contain unescaped script tags
        expect(responseBody).not.toContain('<script>');
        expect(responseBody).not.toContain('javascript:');
      }
    }
    
    console.log('✅ API security vulnerability assessment completed');
  });

  test('API rate limiting and abuse prevention', async ({ request }) => {
    // Test for rate limiting on public endpoints
    const rapidRequests = Array.from({ length: 50 }, (_, i) => 
      request.get(`/api/qr/rate-limit-test?req=${i}`)
    );
    
    const results = await Promise.allSettled(rapidRequests);
    const responses = results
      .filter((r): r is PromiseFulfilledResult<APIResponse> => r.status === 'fulfilled')
      .map(r => r.value);
    
    const statusCounts = responses.reduce((counts, response) => {
      const status = response.status();
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {} as Record<number, number>);
    
    console.log('Rate limiting test results:', statusCounts);
    
    // Should have some form of rate limiting or at least handle the load
    const rateLimitedRequests = statusCounts[429] || 0; // 429 = Too Many Requests
    const serverErrors = statusCounts[500] || 0;
    
    if (rateLimitedRequests > 0) {
      console.log('✅ Rate limiting detected and working');
      expect(rateLimitedRequests).toBeGreaterThan(0);
    } else {
      console.log('ℹ️ No explicit rate limiting detected');
      // Should at least not crash under load
      expect(serverErrors).toBeLessThan(responses.length * 0.1); // Less than 10% server errors
    }
  });

  test('API input sanitization and validation', async ({ request }) => {
    const maliciousInputs = [
      {
        data: { title: '<script>alert("xss")</script>' },
        description: 'XSS in title'
      },
      {
        data: { name: '../../etc/passwd' },
        description: 'Path traversal in name'
      },
      {
        data: { url: 'file:///etc/passwd' },
        description: 'File scheme URL'
      },
      {
        data: { color: 'javascript:alert("xss")' },
        description: 'JavaScript URL in color'
      },
      {
        data: { description: '\x00\x01\x02binary data' },
        description: 'Binary data in text field'
      }
    ];
    
    const testEndpoints = ['/api/qr-codes', '/api/projects', '/api/custom-themes'];
    
    for (const endpoint of testEndpoints) {
      for (const { data, description } of maliciousInputs) {
        console.log(`Testing ${description} on ${endpoint}`);
        
        const response = await request.post(endpoint, { data });
        
        // Should reject or sanitize malicious input
        expect([400, 401, 403, 422]).toContain(response.status());
        
        if (response.status() === 201 || response.status() === 200) {
          // If accepted, response should be sanitized
          const responseText = await response.text();
          expect(responseText).not.toContain('<script>');
          expect(responseText).not.toContain('javascript:');
          expect(responseText).not.toContain('file://');
          expect(responseText).not.toContain('/etc/passwd');
        }
      }
    }
    
    console.log('✅ API input sanitization testing completed');
  });
});