import { AppLogger } from './logger.service';

describe('AppLogger', () => {
  let logger: AppLogger;

  beforeEach(() => {
    logger = new AppLogger('TestContext');
  });

  it('should mask password in log messages', () => {
    const data = { username: 'test', password: 'secret123' };
    const masked = (logger as any).normalizeMessage(data);
    const payload = JSON.parse((logger as any).formatLog('log', data));
    expect(masked.meta).toBeDefined();
    expect(payload.meta.password).toBe('[REDACTED]');
  });

  it('should mask token in log messages', () => {
    const data = { userId: 1, token: 'abc123xyz' };
    const payload = JSON.parse((logger as any).formatLog('log', data));
    expect(payload.meta.token).toBe('[REDACTED]');
  });

  it('should mask email in log messages', () => {
    const data = { name: 'John', email: 'john@example.com' };
    const payload = JSON.parse((logger as any).formatLog('log', data));
    expect(payload.meta.email).toBe('[REDACTED]');
  });

  it('should mask nested PII fields', () => {
    const data = {
      user: {
        name: 'John',
        email: 'john@example.com',
        profile: {
          phone: '1234567890',
        },
      },
    };
    const payload = JSON.parse((logger as any).formatLog('log', data));
    expect(payload.meta.user.email).toBe('[REDACTED]');
    expect(payload.meta.user.profile.phone).toBe('[REDACTED]');
  });

  it('should not mask non-PII fields', () => {
    const data = { handle: 'test', age: 25, city: 'Moscow' };
    const payload = JSON.parse((logger as any).formatLog('log', data));
    expect(payload.meta.handle).toBe('test');
    expect(payload.meta.age).toBe(25);
  });

  it('should handle string messages without masking', () => {
    const payload = JSON.parse((logger as any).formatLog('log', 'test'));
    expect(payload.message).toBe('test');
  });

  it('should redact PII patterns inside strings', () => {
    const payload = JSON.parse((logger as any).formatLog('log', 'user email john@example.com'));
    expect(payload.message).toContain('[REDACTED_EMAIL]');
  });
});
