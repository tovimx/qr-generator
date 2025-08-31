/**
 * API testing utilities for E2E tests
 * Handles direct API calls, network mocking, and response validation
 */

import type { Page, APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';

export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
  headers?: Record<string, string>;
}

/**
 * API helper class for testing REST endpoints
 */
export class ApiHelper {
  constructor(
    private page: Page,
    private apiContext: APIRequestContext
  ) {}

  /**
   * Make authenticated API request
   */
  async authenticatedRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    headers: Record<string, string> = {}
  ): Promise<ApiResponse<T>> {
    // Get auth cookies from browser context
    const cookies = await this.page.context().cookies();
    const cookieHeader = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const response = await this.apiContext.fetch(`http://localhost:3000/api${endpoint}`, {
      method,
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
        ...headers
      },
      data: data ? JSON.stringify(data) : undefined
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = await response.text();
    }

    return {
      status: response.status(),
      data: responseData,
      headers: Object.fromEntries(response.headers())
    };
  }

  /**
   * Test QR code API endpoints
   */
  async createQRCode(data: { title: string; links?: any[] }): Promise<ApiResponse> {
    return this.authenticatedRequest('POST', '/qr-codes', data);
  }

  async updateQRCode(id: string, data: any): Promise<ApiResponse> {
    return this.authenticatedRequest('PUT', `/qr-codes/${id}`, data);
  }

  async deleteQRCode(id: string): Promise<ApiResponse> {
    return this.authenticatedRequest('DELETE', `/qr-codes/${id}`);
  }

  async getQRCodes(): Promise<ApiResponse> {
    return this.authenticatedRequest('GET', '/qr-codes');
  }

  /**
   * Test link management endpoints
   */
  async createLink(qrCodeId: string, linkData: any): Promise<ApiResponse> {
    return this.authenticatedRequest('POST', `/qr-codes/${qrCodeId}/links`, linkData);
  }

  async updateLink(qrCodeId: string, linkId: string, data: any): Promise<ApiResponse> {
    return this.authenticatedRequest('PUT', `/qr-codes/${qrCodeId}/links/${linkId}`, data);
  }

  async deleteLink(qrCodeId: string, linkId: string): Promise<ApiResponse> {
    return this.authenticatedRequest('DELETE', `/qr-codes/${qrCodeId}/links/${linkId}`);
  }

  /**
   * Test analytics endpoints
   */
  async recordScan(shortCode: string, scanData: any): Promise<ApiResponse> {
    return this.apiContext.fetch(`http://localhost:3000/api/qr/${shortCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(scanData)
    }).then(async response => ({
      status: response.status(),
      data: await response.json().catch(() => response.text())
    }));
  }

  /**
   * Test domain management endpoints
   */
  async createDomain(domainData: any): Promise<ApiResponse> {
    return this.authenticatedRequest('POST', '/domains', domainData);
  }

  async updateDomain(id: string, data: any): Promise<ApiResponse> {
    return this.authenticatedRequest('PUT', `/domains/${id}`, data);
  }

  /**
   * Verify API response structure
   */
  async verifyApiResponse<T>(
    response: ApiResponse<T>,
    expectedStatus: number,
    requiredFields?: string[]
  ): Promise<void> {
    expect(response.status).toBe(expectedStatus);
    
    if (response.status >= 200 && response.status < 300 && requiredFields) {
      for (const field of requiredFields) {
        expect(response.data).toHaveProperty(field);
      }
    }
  }

  /**
   * Mock network responses for testing error scenarios
   */
  async mockNetworkFailure(urlPattern: string | RegExp): Promise<void> {
    await this.page.route(urlPattern, route => {
      route.abort('failed');
    });
  }

  async mockSlowResponse(urlPattern: string | RegExp, delayMs: number): Promise<void> {
    await this.page.route(urlPattern, async route => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      route.continue();
    });
  }

  async mockApiError(urlPattern: string | RegExp, status: number, error: any): Promise<void> {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(error)
      });
    });
  }

  /**
   * Clear all network mocks
   */
  async clearNetworkMocks(): Promise<void> {
    await this.page.unrouteAll();
  }

  /**
   * Wait for specific API calls
   */
  async waitForApiCall(endpoint: string, timeout = 5000): Promise<void> {
    await this.page.waitForResponse(
      response => response.url().includes(endpoint),
      { timeout }
    );
  }

  /**
   * Count API calls to specific endpoint
   */
  async countApiCalls(endpoint: string): Promise<number> {
    return new Promise((resolve) => {
      let count = 0;
      
      this.page.on('response', response => {
        if (response.url().includes(endpoint)) {
          count++;
        }
      });

      // Return count after short delay
      setTimeout(() => resolve(count), 100);
    });
  }
}