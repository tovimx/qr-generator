# Simplified E2E Testing Strategy

## Overview

This project uses a streamlined Playwright E2E testing approach focused on core functionality testing. The test suite is simplified for easy maintenance and fast execution, testing only essential user workflows.

## Test Architecture

### Core Test Files (7 files)

- **`auth-flow.spec.ts`** - Authentication and signup workflows
- **`qr-creation.spec.ts`** - QR code creation and management
- **`qr-functionality.spec.ts`** - QR code redirect functionality
- **`dashboard-workflows.spec.ts`** - Main dashboard operations
- **`core-user-journey.spec.ts`** - End-to-end user workflows
- **`ui-components.spec.ts`** - Basic UI component tests
- **`example.spec.ts`** - Smoke tests and basic navigation

### Test Helpers (3 files)

- **`auth.ts`** - Basic authentication helpers
- **`qr-page.ts`** - QR page interaction utilities  
- **`supabase-auth.ts`** - Supabase integration helpers

## What We Test ✅

### Core Functionality
- User authentication (login/signup)
- QR code creation and editing
- Link management (add/edit/remove links)
- QR code redirects and public pages
- Dashboard navigation and basic UI

### Browser Support
- Chromium only (simplified from multi-browser)

## What We Don't Test ❌

- Performance benchmarking
- Security testing (XSS, CSRF, etc.)
- Visual regression testing
- Cross-browser compatibility
- Network failure scenarios
- Edge cases and error handling
- Mobile device testing
- Load testing

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Interactive UI mode
npm run test:ui

# Debug mode
npm run test:debug

# See tests running in browser
npm run test:headed

# Run specific test
npx playwright test auth-flow.spec.ts
```

### Configuration

The Playwright configuration (`playwright.config.ts`):
- **Base URL**: `http://localhost:3004`
- **Browser**: Chromium only
- **Execution**: Sequential (not parallel) for simplicity
- **Timeout**: 30 seconds
- **Retries**: 1 (minimal)
- **Workers**: 1 (single worker)
- **Video**: Disabled to save space

## CI/CD Integration

Tests run automatically via GitHub Actions on:
- Push to `main` and `e2e-testing` branches
- Pull requests to `main`

The CI workflow (`.github/workflows/e2e-simple.yml`):
- Installs dependencies
- Installs Chromium browser only
- Runs all 7 test files
- Uploads test results as artifacts

## Test Categories

### 🟢 Authentication Tests
- Login with valid credentials
- Signup flow
- Basic form validation

### 🟢 QR Code Tests  
- Create QR codes
- Add/edit links
- QR code display and functionality

### 🟢 Dashboard Tests
- Navigation between sections
- UI interactions
- Basic workflows

### 🟢 Integration Tests
- QR code redirect functionality
- Public QR pages
- End-to-end user journeys

## Maintenance

### Adding New Tests
1. Add to existing test files when possible
2. Follow existing patterns and helpers
3. Focus on happy-path scenarios only
4. Keep tests simple and maintainable

### Best Practices
- Use existing helper functions
- Focus on core functionality
- Avoid complex edge cases
- Keep tests independent
- Use clear, descriptive test names

## Getting Help

- [Playwright Documentation](https://playwright.dev/)
- Review existing test files for patterns
- Check `tests/README.md` for detailed structure

---

**Testing Approach**: Simplified for maintainability  
**Test Files**: 7 core test files  
**Browser Support**: Chromium only  
**Focus**: Essential functionality validation