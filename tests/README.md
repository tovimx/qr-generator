# Playwright Testing Setup for QR Generator

This directory contains end-to-end tests for the QR Generator application using Playwright.

## Prerequisites

1. **Node.js 24.2.0** - Ensure you're using the correct Node.js version
2. **Playwright installed** - Already installed via `npm install`
3. **App running** - The app should be running on `http://localhost:3000`

## Test Structure

```
tests/
├── README.md                 # This file
├── login.spec.ts            # Login functionality tests
├── example.spec.ts          # Basic navigation and app tests  
├── qr-functionality.spec.ts # QR code generation and redirect tests
├── helpers/
│   └── auth.ts             # Authentication helper functions
└── screenshots/            # Debug screenshots from failed tests
```

## Running Tests

### Start the Development Server
```bash
npm run dev
```

### Run All Tests
```bash
npm run test
```

### Run Tests with UI Mode (Interactive)
```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Debug Tests Step by Step
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npx playwright test login.spec.ts
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

The Playwright configuration is in `/playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start dev server**: Yes (configured in webServer section)
- **Retries**: 2 on CI, 0 locally
- **Parallel execution**: Enabled

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.getByRole('button')).toBeVisible();
  });
});
```

### Using Authentication Helpers
```typescript
import { AuthHelper } from './helpers/auth';

test('should test authenticated feature', async ({ page }) => {
  const auth = new AuthHelper(page);
  await auth.loginAndVerify('test@example.com', 'password');
  
  // Now test authenticated functionality
});
```

## Available Test Helpers

### AuthHelper Class
- `login(email, password)` - Perform login
- `loginAndVerify(email, password)` - Login and verify success
- `logout()` - Logout current user
- `isAuthenticated()` - Check if user is logged in
- `signup(email, password)` - Create new account

### Utility Functions
- `waitForNetworkIdle(page)` - Wait for network requests to complete
- `takeDebugScreenshot(page, name)` - Take screenshot for debugging
- `clearSession(page)` - Clear cookies and storage

## Test Categories

### 1. Authentication Tests (`login.spec.ts`)
- Form validation
- Login with valid/invalid credentials
- Error message display
- Loading states
- Accessibility checks

### 2. Navigation Tests (`example.spec.ts`)
- Page loading
- Navigation between pages
- Performance checks
- Console error detection

### 3. QR Functionality Tests (`qr-functionality.spec.ts`)
- QR code generation (requires auth)
- QR code redirect functionality
- Analytics tracking
- API endpoint tests

## Test Data Management

### Test Users
Defined in `helpers/auth.ts`:
```typescript
const TEST_USERS = {
  valid: { email: 'test@example.com', password: 'testpassword123' },
  invalid: { email: 'invalid@example.com', password: 'wrongpassword' },
  new: { email: 'dynamic@example.com', password: 'newuserpassword123' }
};
```

### Database Cleanup
For tests that create data, consider adding cleanup:
```typescript
test.afterEach(async () => {
  // Clean up test data
});
```

## Environment Setup

### Required Environment Variables
Ensure these are set for testing:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add other environment variables as needed
```

### Test Environment
Tests run against the development server by default. For production testing:
1. Update `baseURL` in `playwright.config.ts`
2. Remove or modify the `webServer` configuration

## Debugging Tests

### View Test Results
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Debug Failed Tests
1. Check screenshots in `tests/screenshots/`
2. Use `--debug` flag to step through tests
3. Use `page.pause()` in test code to pause execution

### Common Issues

#### Test Timeouts
```typescript
// Increase timeout for slow operations
await expect(page.locator('.slow-element')).toBeVisible({ timeout: 10000 });
```

#### Flaky Tests
```typescript
// Add retry logic for flaky elements
await page.waitForSelector('.dynamic-content', { state: 'attached' });
```

#### Network Issues
```typescript
// Wait for network requests to complete
await page.waitForLoadState('networkidle');
```

## CI/CD Integration

For GitHub Actions or other CI systems:
```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm run test
```

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for elements** instead of using fixed timeouts
3. **Clean up test data** after each test
4. **Use Page Object Model** for complex pages
5. **Mock external APIs** when possible
6. **Test user journeys** not just individual components

## Updating Tests

When adding new features:
1. Add tests to appropriate spec file
2. Update helpers if new patterns emerge
3. Add test data cleanup if needed
4. Update this README with new patterns

## Getting Help

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Selectors](https://playwright.dev/docs/selectors)
- [Debugging Tests](https://playwright.dev/docs/debug)