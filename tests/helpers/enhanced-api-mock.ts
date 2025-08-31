import { Page, Route } from '@playwright/test';

/**
 * Enhanced API mocking utilities for database-independent E2E testing
 * Provides comprehensive mocking for all API endpoints and authentication
 */

export interface MockUser {
  id: string;
  email: string;
  name?: string;
}

export interface MockQRCode {
  id: string;
  shortCode: string;
  title: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  links: MockLink[];
  theme?: Record<string, unknown>;
}

export interface MockLink {
  id: string;
  title: string;
  url: string;
  order: number;
  isActive: boolean;
}

export class EnhancedAPIMock {
  private mockUsers: Map<string, MockUser> = new Map();
  private mockQRCodes: Map<string, MockQRCode> = new Map();
  private currentUser: MockUser | null = null;
  private isAuthenticated = false;

  constructor(private page: Page) {}

  /**
   * Set up comprehensive API mocking for all endpoints
   */
  async setupComprehensiveMocks() {
    // Mock authentication endpoints
    await this.mockAuthEndpoints();
    
    // Mock QR code endpoints
    await this.mockQRCodeEndpoints();
    
    // Mock public QR page endpoints
    await this.mockPublicPageEndpoints();
    
    // Mock analytics endpoints
    await this.mockAnalyticsEndpoints();
    
    // Mock project management endpoints
    await this.mockProjectEndpoints();
    
    // Set up default test data
    this.setupDefaultTestData();
  }

  /**
   * Mock authentication-related API calls
   */
  private async mockAuthEndpoints() {
    // Mock Supabase auth endpoints
    await this.page.route('**/auth/v1/signup', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData?.email && postData?.password) {
        const user: MockUser = {
          id: `user_${Date.now()}`,
          email: postData.email,
          name: postData.email.split('@')[0]
        };
        
        this.mockUsers.set(user.id, user);
        this.currentUser = user;
        this.isAuthenticated = true;
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user,
            session: {
              access_token: `mock_token_${user.id}`,
              refresh_token: `mock_refresh_${user.id}`,
              expires_at: Date.now() + 3600000
            }
          })
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Invalid email or password'
          })
        });
      }
    });

    // Mock login endpoint
    await this.page.route('**/auth/v1/token**', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData?.email === 'test@example.com' && postData?.password) {
        const user: MockUser = {
          id: 'test_user_123',
          email: 'test@example.com',
          name: 'Test User'
        };
        
        this.currentUser = user;
        this.isAuthenticated = true;
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user,
            session: {
              access_token: `mock_token_${user.id}`,
              refresh_token: `mock_refresh_${user.id}`,
              expires_at: Date.now() + 3600000
            }
          })
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Invalid credentials'
          })
        });
      }
    });

    // Mock session check
    await this.page.route('**/auth/v1/user', async (route) => {
      if (this.isAuthenticated && this.currentUser) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(this.currentUser)
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Unauthorized' })
        });
      }
    });
  }

  /**
   * Mock QR code API endpoints
   */
  private async mockQRCodeEndpoints() {
    // Mock QR codes list endpoint
    await this.page.route('**/api/qr-codes', async (route) => {
      if (route.request().method() === 'GET') {
        const userQRCodes = Array.from(this.mockQRCodes.values())
          .filter(qr => qr.userId === this.currentUser?.id);
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ qrCodes: userQRCodes })
        });
      } else if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        const newQRCode: MockQRCode = {
          id: `qr_${Date.now()}`,
          shortCode: `mock${Math.random().toString(36).substr(2, 8)}`,
          title: postData?.title || 'New QR Code',
          isActive: true,
          userId: this.currentUser?.id || 'anonymous',
          createdAt: new Date().toISOString(),
          links: []
        };
        
        this.mockQRCodes.set(newQRCode.id, newQRCode);
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newQRCode)
        });
      }
    });

    // Mock individual QR code endpoint
    await this.page.route('**/api/qr-codes/*', async (route) => {
      const url = route.request().url();
      const qrId = url.split('/').pop()?.split('?')[0];
      const qrCode = this.mockQRCodes.get(qrId || '');
      
      if (qrCode) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(qrCode)
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'QR code not found' })
        });
      }
    });
  }

  /**
   * Mock public QR page endpoints (for /q/[shortCode] pages)
   */
  private async mockPublicPageEndpoints() {
    await this.page.route('**/q/**', async (route) => {
      const url = route.request().url();
      const shortCode = url.split('/q/')[1]?.split('?')[0];
      
      // Find QR code by short code
      const qrCode = Array.from(this.mockQRCodes.values())
        .find(qr => qr.shortCode === shortCode && qr.isActive);
      
      if (qrCode) {
        // Return a minimal HTML page for the QR code
        const html = `<!DOCTYPE html>
<html>
<head>
  <title>${qrCode.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div class="container">
    <h1>${qrCode.title}</h1>
    <div class="links">
      ${qrCode.links.map(link => `
        <a href="${link.url}" class="link-item" data-testid="qr-link">
          ${link.title}
        </a>`).join('')}
    </div>
  </div>
</body>
</html>`;
        
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: html
        });
      } else {
        // Return 404 page
        await route.fulfill({
          status: 404,
          contentType: 'text/html',
          body: `<!DOCTYPE html>
<html>
<head><title>QR Code Not Found</title></head>
<body>
  <h1>QR Code Not Found</h1>
  <p>The QR code you're looking for doesn't exist or has been disabled.</p>
</body>
</html>`
        });
      }
    });
  }

  /**
   * Mock analytics endpoints
   */
  private async mockAnalyticsEndpoints() {
    await this.page.route('**/api/analytics/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          views: Math.floor(Math.random() * 1000),
          clicks: Math.floor(Math.random() * 100),
          devices: { mobile: 60, desktop: 40 }
        })
      });
    });
  }

  /**
   * Mock project management endpoints
   */
  private async mockProjectEndpoints() {
    await this.page.route('**/api/projects**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          projects: [{
            id: 'project_1',
            name: 'Default Project',
            userId: this.currentUser?.id || 'anonymous'
          }]
        })
      });
    });
  }

  /**
   * Set up default test data
   */
  private setupDefaultTestData() {
    // Create a default test user
    const defaultUser: MockUser = {
      id: 'default_user',
      email: 'test@example.com',
      name: 'Test User'
    };
    this.mockUsers.set(defaultUser.id, defaultUser);

    // Create a default QR code
    const defaultQR: MockQRCode = {
      id: 'default_qr',
      shortCode: 'testqr123',
      title: 'Test QR Code',
      isActive: true,
      userId: defaultUser.id,
      createdAt: new Date().toISOString(),
      links: [
        {
          id: 'link_1',
          title: 'Example Link',
          url: 'https://example.com',
          order: 1,
          isActive: true
        }
      ]
    };
    this.mockQRCodes.set(defaultQR.id, defaultQR);
  }

  /**
   * Simulate user authentication
   */
  async authenticateUser(email: string = 'test@example.com') {
    const user: MockUser = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0]
    };
    
    this.mockUsers.set(user.id, user);
    this.currentUser = user;
    this.isAuthenticated = true;
    
    // Set auth cookies/localStorage to simulate authenticated state
    await this.page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          user: { id: 'mock_user_id', email: 'test@example.com' }
        }
      }));
    });
    
    return user;
  }

  /**
   * Add a mock QR code for testing
   */
  addMockQRCode(qrCode: Partial<MockQRCode>): MockQRCode {
    const mockQR: MockQRCode = {
      id: qrCode.id || `qr_${Date.now()}`,
      shortCode: qrCode.shortCode || `mock${Math.random().toString(36).substr(2, 8)}`,
      title: qrCode.title || 'Mock QR Code',
      isActive: qrCode.isActive ?? true,
      userId: qrCode.userId || this.currentUser?.id || 'anonymous',
      createdAt: qrCode.createdAt || new Date().toISOString(),
      links: qrCode.links || [],
      theme: qrCode.theme
    };
    
    this.mockQRCodes.set(mockQR.id, mockQR);
    return mockQR;
  }

  /**
   * Clear all mock data
   */
  clearMockData() {
    this.mockUsers.clear();
    this.mockQRCodes.clear();
    this.currentUser = null;
    this.isAuthenticated = false;
    this.setupDefaultTestData();
  }

  /**
   * Get current mock state for debugging
   */
  getDebugInfo() {
    return {
      isAuthenticated: this.isAuthenticated,
      currentUser: this.currentUser,
      usersCount: this.mockUsers.size,
      qrCodesCount: this.mockQRCodes.size,
      qrCodes: Array.from(this.mockQRCodes.values())
    };
  }
}