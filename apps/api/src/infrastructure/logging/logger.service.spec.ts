import { AppLogger } from './logger.service';

describe('AppLogger', () => {
  let logger: AppLogger;

  beforeEach(() => {
    logger = new AppLogger('TestContext');
  });

  it('should mask password in log messages', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const data = { username: 'test', password: 'secret123' };
    
    logger.log(data);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'test',
        password: '***MASKED***',
      }),
      'TestContext'
    );
    
    consoleSpy.mockRestore();
  });

  it('should mask token in log messages', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const data = { userId: 1, token: 'abc123xyz' };
    
    logger.log(data);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        token: '***MASKED***',
      }),
      'TestContext'
    );
    
    consoleSpy.mockRestore();
  });

  it('should mask email in log messages', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const data = { name: 'John', email: 'john@example.com' };
    
    logger.log(data);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John',
        email: '***MASKED***',
      }),
      'TestContext'
    );
    
    consoleSpy.mockRestore();
  });

  it('should mask nested PII fields', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const data = {
      user: {
        name: 'John',
        email: 'john@example.com',
        profile: {
          phone: '1234567890',
        },
      },
    };
    
    logger.log(data);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user: {
          name: 'John',
          email: '***MASKED***',
          profile: {
            phone: '***MASKED***',
          },
        },
      }),
      'TestContext'
    );
    
    consoleSpy.mockRestore();
  });

  it('should not mask non-PII fields', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const data = { username: 'test', age: 25, city: 'Moscow' };
    
    logger.log(data);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'test',
        age: 25,
        city: 'Moscow',
      }),
      'TestContext'
    );
    
    consoleSpy.mockRestore();
  });

  it('should handle string messages without masking', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const message = 'Simple log message';
    
    logger.log(message);
    
    expect(consoleSpy).toHaveBeenCalledWith(message, 'TestContext');
    
    consoleSpy.mockRestore();
  });
});
