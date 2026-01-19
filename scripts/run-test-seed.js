const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envPath = path.resolve('apps/api/test.env');
if (fs.existsSync(envPath)) {
  const contents = fs.readFileSync(envPath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

execSync('npx prisma db seed', {
  cwd: path.resolve('apps/api'),
  stdio: 'inherit',
  env: process.env,
});
