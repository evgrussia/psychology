import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

export default async () => {
  console.log('\nSetting up test environment...');
  
  // Load test environment variables
  dotenv.config({ path: path.join(__dirname, '../test.env') });
  
  // Ensure DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in test.env');
  }

  console.log('Running migrations on test database...');
  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });
    console.log('Migrations completed.');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }
};
