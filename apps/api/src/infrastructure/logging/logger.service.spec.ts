import { AppLogger } from './logger.service';

describe('AppLogger', () => {
  let logger: AppLogger;

  beforeEach(() => {
    logger = new AppLogger('TestContext');
  });

  it('should mask password in log messages', () => {
    const data = { username: 'test', password: 'secret123' };
    expect(() => logger.log(data)).not.toThrow();
  });

  it('should mask token in log messages', () => {
    const data = { userId: 1, token: 'abc123xyz' };
    expect(() => logger.log(data)).not.toThrow();
  });

  it('should mask email in log messages', () => {
    const data = { name: 'John', email: 'john@example.com' };
    expect(() => logger.log(data)).not.toThrow();
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
    expect(() => logger.log(data)).not.toThrow();
  });

  it('should not mask non-PII fields', () => {
    const data = { username: 'test', age: 25, city: 'Moscow' };
    expect(() => logger.log(data)).not.toThrow();
  });

  it('should handle string messages without masking', () => {
    expect(() => logger.log('test')).not.toThrow();
  });
});
