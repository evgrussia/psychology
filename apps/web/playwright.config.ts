import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 60000,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd ../.. && pnpm --filter @psychology/api dev',
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'pnpm dev -- -p 3000',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
