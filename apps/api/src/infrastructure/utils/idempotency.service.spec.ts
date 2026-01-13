import { IdempotencyService } from './idempotency.service';

describe('IdempotencyService', () => {
  let service: IdempotencyService;

  beforeEach(() => {
    service = new IdempotencyService();
  });

  it('should return null for non-existent key', async () => {
    const result = await service.check('non-existent-key');
    expect(result).toBeNull();
  });

  it('should save and retrieve idempotency key', async () => {
    const key = 'test-key-123';
    const value = { result: 'test-result' };
    
    await service.save(key, value);
    const retrieved = await service.check(key);
    
    expect(retrieved).toEqual(value);
  });

  it('should overwrite existing key', async () => {
    const key = 'test-key-456';
    const value1 = { result: 'first' };
    const value2 = { result: 'second' };
    
    await service.save(key, value1);
    await service.save(key, value2);
    const retrieved = await service.check(key);
    
    expect(retrieved).toEqual(value2);
  });

  it('should handle multiple keys independently', async () => {
    const key1 = 'key-1';
    const key2 = 'key-2';
    const value1 = { result: 'value1' };
    const value2 = { result: 'value2' };
    
    await service.save(key1, value1);
    await service.save(key2, value2);
    
    expect(await service.check(key1)).toEqual(value1);
    expect(await service.check(key2)).toEqual(value2);
  });
});
