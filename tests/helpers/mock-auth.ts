import { Page } from '@playwright/test';

/**
 * Mock Authentication Helper for E2E Testing
 * 
 * This helper provides authentication for tests when the real Supabase 
 * backend is not available or configured for testing.
 */

export class MockAuthHelper {
  constructor(private page: Page) {}

  /**
   * Sets up mock authentication state by injecting session data
   * directly into the browser's localStorage/cookies
   */
  async mockLogin(userId: string = 'test-user-123', email: string = 'test@example.com') {
    // Navigate to any page to ensure the domain is loaded
    await this.page.goto('/');

    // Inject mock session data into localStorage
    await this.page.evaluate(
      ({ userId, email }) => {
        const mockSession = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token', 
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          token_type: 'bearer',
          user: {
            id: userId,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        };

        // Store in the format expected by Supabase client
        localStorage.setItem(
          'sb-test-auth-token',
          JSON.stringify(mockSession)
        );

        // Also set cookies if the app expects them
        document.cookie = `sb-access-token=${mockSession.access_token}; path=/; max-age=3600`;
        document.cookie = `sb-refresh-token=${mockSession.refresh_token}; path=/; max-age=86400`;
      },
      { userId, email }
    );

    return { userId, email };
  }

  /**
   * Mock logout by clearing authentication data
   */
  async mockLogout() {
    await this.page.evaluate(() => {
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });

      // Clear auth cookies
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    });
  }

  /**
   * Mock API responses for authentication endpoints
   */
  async setupAuthMocks() {
    await this.page.route('**/auth/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      // Mock signup endpoint
      if (url.includes('/auth/signup') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
              created_at: new Date().toISOString(),
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            }
          })
        });
        return;
      }

      // Mock login endpoint
      if (url.includes('/auth/signin') && method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
            },
            session: {
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            }
          })
        });
        return;
      }

      // Mock user info endpoint
      if (url.includes('/auth/user') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
              created_at: new Date().toISOString(),
            }
          })
        });
        return;
      }

      // Let other requests through
      await route.continue();
    });
  }

  /**
   * Navigate to dashboard after setting up mock auth
   */
  async navigateToDashboard() {
    await this.mockLogin();
    await this.setupAuthMocks();
    await this.page.goto('/dashboard');
  }
}