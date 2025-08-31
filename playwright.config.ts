import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests sequentially for simplicity */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env['CI'],
  /* Minimal retries */
  retries: 1,
  /* Single worker for simplicity */
  workers: 1,
  /* Shorter timeout for faster feedback */
  timeout: 30 * 1000,
  expect: {
    /* Maximum time expect() should wait for the condition to be met */
    timeout: 10 * 1000,
  },
  /* Simplified reporter */
  reporter: [['html'], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3004',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot only when test fails */
    screenshot: 'only-on-failure',
    
    /* No video recording to save space */
    video: 'off',
  },

  /* Only test with Chromium for simplicity */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3004',
    reuseExistingServer: true,
    timeout: 60000,
  },
});