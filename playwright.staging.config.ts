import { defineConfig, devices } from '@playwright/test';
// Explicit, fixed staging target. No production URL and no local preview server.
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  timeout: 45000,
  retries: 0,
  workers: 2,
  reporter: [['list']],
  outputDir: 'test-results-staging',
  use: { baseURL: 'https://dev.onlyempowerment.com', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
