import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const loadEnvFile = (envPath: string): Record<string, string> => {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const contents = fs.readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
};

const apiTestEnvPath = path.resolve(__dirname, '../api/test.env');
const apiTestEnv = loadEnvFile(apiTestEnvPath);
const apiServerEnv = {
  ...apiTestEnv,
  NODE_ENV: 'test',
};

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
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
      env: apiServerEnv,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'pnpm dev -- -p 3000',
      url: 'http://127.0.0.1:3000',
      env: {
        ...apiTestEnv,
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001/api',
      },
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
