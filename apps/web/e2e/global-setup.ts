import { execSync } from 'child_process';
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

export default async () => {
  const apiRoot = path.resolve(__dirname, '../../api');
  const testEnvPath = path.resolve(__dirname, '../../api/test.env');
  const testEnv = loadEnvFile(testEnvPath);
  const env = { ...process.env, ...testEnv, NODE_ENV: 'test' };

  execSync('npx prisma migrate deploy', {
    cwd: apiRoot,
    env: env as any,
    stdio: 'inherit',
  });

  execSync('npx prisma db seed', {
    cwd: apiRoot,
    env: env as any,
    stdio: 'inherit',
  });
};
