import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 2, // Reduced to 2 workers for stability (was 4 locally)
  timeout: 180000, // 180s per test (increased from 120s for reliable i18n page loads in production)
  expect: {
    timeout: 10000, // 10s for assertions with auto-wait
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: process.env.CI ? 'on-first-retry' : 'on', // Always on locally for debugging
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'on', // Always on locally for debugging
    actionTimeout: 15000, // 15s for actions (standard for form interactions)
    navigationTimeout: 30000, // 30s for navigation (increased from 20s for i18n route rendering)
    // Disable browser extensions to prevent hydration interference
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
    // Uncomment for full browser matrix (regression tests)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 180000, // 180s for build + start
    stdout: 'pipe', // Capture server output for debugging
    stderr: 'pipe',
  },
})
