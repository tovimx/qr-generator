import { defineConfig, devices } from '@playwright/test';

/**
 * CI/CD Optimized Playwright Configuration
 * 
 * This configuration is optimized for continuous integration environments
 * with focused test selection and enhanced reporting.
 */
export default defineConfig({
  testDir: './tests',
  
  // CI-specific test file patterns - focus on most critical tests
  testMatch: [
    'master-e2e-suite.spec.ts',
    'production-ready-e2e-final.spec.ts',
    'comprehensive-mock-based.spec.ts',
    'security-comprehensive.spec.ts',
    'performance-load.spec.ts'
  ],
  
  fullyParallel: false, // More stable in CI
  forbidOnly: true, // Always fail on .only in CI
  retries: 3, // More retries for flaky CI environments
  workers: 2, // Conservative worker count for CI
  
  timeout: 90 * 1000, // Extended timeout for CI
  expect: {
    timeout: 15 * 1000,
  },
  
  // Enhanced CI reporting
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['github'],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:3004',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // CI-optimized settings
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: 'chromium-ci',
      use: { 
        ...devices['Desktop Chrome'],
        // CI-specific overrides
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
          ]
        }
      },
    }
  ],

  // CI-optimized web server
  webServer: {
    command: 'DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_test" DIRECT_DATABASE_URL="postgresql://tovimx@localhost:5432/qr_generator_test" DISABLE_AUTH_FOR_TESTING=true NODE_ENV=test npm run dev',
    url: 'http://localhost:3004',
    reuseExistingServer: false, // Always start fresh in CI
    timeout: 180000, // Extended timeout for CI
    env: {
      'DISABLE_AUTH_FOR_TESTING': 'true',
      'NODE_ENV': 'test',
      'DATABASE_URL': 'postgresql://tovimx@localhost:5432/qr_generator_test',
      'DIRECT_DATABASE_URL': 'postgresql://tovimx@localhost:5432/qr_generator_test',
    },
  },
});