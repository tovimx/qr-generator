# Simplified E2E Testing for QR Generator

This directory contains streamlined end-to-end tests for the QR Generator application using Playwright.

## Prerequisites

1. **Node.js 18+** - Standard Node.js version
2. **Playwright installed** - Already installed via `npm install`
3. **App running** - The app should be running on `http://localhost:3004`

## Test Structure (Simplified)

```
tests/
├── README.md                 # This file
├── auth-flow.spec.ts         # Authentication tests
├── qr-creation.spec.ts       # QR code creation tests
├── qr-functionality.spec.ts  # QR code functionality tests
├── dashboard-workflows.spec.ts # Dashboard operations
├── core-user-journey.spec.ts # Main user workflows
├── ui-components.spec.ts     # Basic UI tests
├── example.spec.ts           # Smoke tests
└── helpers/                  # Basic helper functions
    ├── auth.ts               # Authentication helpers
    ├── qr-page.ts           # QR page helpers
    └── supabase-auth.ts     # Supabase integration
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with UI Mode (Interactive)
```bash
npm run test:ui
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npx playwright test auth-flow.spec.ts
```

### Run with Headed Browser (See Tests Running)
```bash
npm run test:headed
```

## Test Configuration

The Playwright configuration is in `/playwright.config.ts`:

- **Base URL**: `http://localhost:3004`
- **Browser**: Chromium only (simplified)
- **Auto-start dev server**: Yes
- **Retries**: 1 (minimal)
- **Parallel execution**: Disabled for simplicity
- **Timeout**: 30 seconds

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

## Test Categories (Simplified)

### 1. Authentication (`auth-flow.spec.ts`)
- Login and signup functionality
- Basic form validation
- Error handling

### 2. QR Code Creation (`qr-creation.spec.ts`)
- Create and manage QR codes
- Add/edit links
- Basic validation

### 3. QR Functionality (`qr-functionality.spec.ts`)
- QR code redirects
- Public QR pages

### 4. Dashboard (`dashboard-workflows.spec.ts`)
- Main dashboard operations
- UI interactions

### 5. Core Workflows (`core-user-journey.spec.ts`)
- End-to-end user journeys

### 6. UI Components (`ui-components.spec.ts`)
- Basic UI functionality

### 7. Smoke Tests (`example.spec.ts`)
- Basic page loads and navigation

## Test Data Management

### Test Users
Tests use dynamically generated emails for isolation. Basic test users are defined in helper files.

### Cleanup
Tests handle their own cleanup to avoid conflicts between test runs.

## Environment Setup

Tests run against the local development server automatically. Environment variables are handled by the existing `.env` configuration.

## Debugging Tests

### View Test Results
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Debug Failed Tests
1. Screenshots are automatically taken on failure
2. Use `npm run test:debug` to debug interactively
3. Use `npm run test:headed` to see tests running

### Common Issues
- **Timeouts**: Tests have 30-second timeout by default
- **Flaky Elements**: Tests include proper waits for dynamic content
- **Network**: Tests wait for network idle state automatically

## CI/CD Integration

The project includes a simplified GitHub Actions workflow that:
- Installs dependencies
- Runs tests on Chromium only
- Uploads test results as artifacts

## Best Practices (Simplified)

1. **Use data-testid attributes** for reliable element selection
2. **Keep tests focused** on happy path scenarios
3. **Use existing helper functions** for common operations
4. **Test core user journeys** rather than edge cases

## Summary

This simplified E2E testing setup focuses on:
- ✅ Core functionality testing
- ✅ Single browser (Chromium) for speed
- ✅ Essential test cases only
- ✅ Simple configuration and maintenance
- ❌ No performance testing
- ❌ No security testing
- ❌ No visual regression testing
- ❌ No cross-browser testing
- ❌ No complex edge cases

## Getting Help

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Selectors](https://playwright.dev/docs/selectors)
- [Debugging Tests](https://playwright.dev/docs/debug)