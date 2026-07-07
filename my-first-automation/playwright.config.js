// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail build if test.only is committed
  forbidOnly: !!process.env.CI,

  // Retries on CI
  retries: process.env.CI ? 2 : 0,

  // Workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [['html'],
['./reporters/JsonReporter.js']],

  // Global timeout
  timeout: 120000,

  use: {
    // Run browser visibly
    headless: false,

    // Capture screenshots on failure
    screenshot: 'only-on-failure',

    // Keep video on failure
    video: 'retain-on-failure',

    // Collect trace
    trace: 'on-first-retry',
  },

  // Only Chromium
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});