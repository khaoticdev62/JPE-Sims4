import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for React app E2E testing
 *
 * IMPORTANT: Start the dev server FIRST before running tests
 * Run: npm run dev
 * Then in another terminal: npm run test:e2e
 */
export default defineConfig({
  testDir: './src/__tests__/e2e/specs',
  testMatch: '**/*.e2e.ts',

  // Test execution settings
  fullyParallel: false,
  workers: 1, // Run tests serially for consistency
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5000, // 5 seconds for assertions
  },

  // Retry and reporting
  retries: 0, // No retries
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Browser configuration
  use: {
    baseURL: 'http://localhost:3006', // Dev server uses dynamic port due to port conflicts
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['desktop-chromium'] },
    },
  ],

  // Output
  outputDir: './test-results',
})
