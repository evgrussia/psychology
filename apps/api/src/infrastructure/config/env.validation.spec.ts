import { validate } from './env.validation';

describe('env.validation', () => {
  const validConfig = {
    NODE_ENV: 'development',
    PORT: 3000,
    DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
    JWT_SECRET: 'test-secret',
    MEDIA_STORAGE_PATH: './media',
    MEDIA_PUBLIC_URL_BASE: 'http://localhost:3000/media',
    MEDIA_UPLOAD_ENABLED: 'true',
    ENCRYPTION_KEY_ID: 'key_v1',
    ENCRYPTION_KEY: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    GOOGLE_OAUTH_CLIENT_ID: 'client-id',
    GOOGLE_OAUTH_CLIENT_SECRET: 'client-secret',
    GOOGLE_OAUTH_REDIRECT_URI: 'http://localhost:3000/api/admin/integrations/google-calendar/callback',
  };

  it('should validate correct configuration', () => {
    const result = validate(validConfig);
    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
  });

  it('should throw error when NODE_ENV is invalid', () => {
    const invalidConfig = { ...validConfig, NODE_ENV: 'invalid' };
    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should throw error when PORT is missing', () => {
    const invalidConfig = { ...validConfig };
    delete (invalidConfig as any).PORT;
    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should throw error when DATABASE_URL is missing', () => {
    const invalidConfig = { ...validConfig };
    delete (invalidConfig as any).DATABASE_URL;
    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should throw error when JWT_SECRET is missing', () => {
    const invalidConfig = { ...validConfig };
    delete (invalidConfig as any).JWT_SECRET;
    expect(() => validate(invalidConfig)).toThrow();
  });

  it('should accept optional HTTP_TIMEOUT_MS', () => {
    const configWithTimeout = { ...validConfig, HTTP_TIMEOUT_MS: 5000 };
    const result = validate(configWithTimeout);
    expect(result.HTTP_TIMEOUT_MS).toBe(5000);
  });

  it('should accept optional HTTP_RETRY_ATTEMPTS', () => {
    const configWithRetry = { ...validConfig, HTTP_RETRY_ATTEMPTS: 5 };
    const result = validate(configWithRetry);
    expect(result.HTTP_RETRY_ATTEMPTS).toBe(5);
  });

  it('should accept optional GOOGLE_CALENDAR_SYNC_INTERVAL_MINUTES', () => {
    const configWithInterval = { ...validConfig, GOOGLE_CALENDAR_SYNC_INTERVAL_MINUTES: 15 };
    const result = validate(configWithInterval);
    expect(result.GOOGLE_CALENDAR_SYNC_INTERVAL_MINUTES).toBe(15);
  });

  it('should accept optional GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS', () => {
    const configWithLookahead = { ...validConfig, GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS: 30 };
    const result = validate(configWithLookahead);
    expect(result.GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS).toBe(30);
  });
});
