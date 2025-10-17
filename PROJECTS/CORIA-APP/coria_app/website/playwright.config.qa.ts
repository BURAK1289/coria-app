import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for Icon System QA
 * Phase 3.3 Migration Testing
 *
 * Enables all browsers for comprehensive cross-browser validation
 */

export default defineConfig({
  testDir: './e2e/tests',
  testMatch: '**/icon-system-qa.spec.ts', // Only run icon QA tests
  fullyParallel: true,
  forbidOnly: false, // Allow .only during QA
  retries: 1, // Retry once for flaky tests
  workers: 3, // Run 3 browsers in parallel
  timeout: 180000, // 180s per test
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report-icon-qa' }],
    ['json', { outputFile: 'test-results/icon-qa/reports/test-results.json' }],
    ['junit', { outputFile: 'test-results/icon-qa/reports/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3002', // Use different port
    trace: 'on', // Always capture traces for QA
    screenshot: 'on', // Always capture screenshots
    video: 'on', // Always capture video
    actionTimeout: 15000,
    navigationTimeout: 30000,
    launchOptions: {
      args: [
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- -p 3002',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
