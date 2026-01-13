import { Injectable } from '@nestjs/common';

@Injectable()
export class IdempotencyService {
  // In a real implementation, this would use Redis or a Database
  private cache = new Map<string, any>();

  async check(key: string): Promise<any | null> {
    return this.cache.get(key) || null;
  }

  async save(key: string, result: any): Promise<void> {
    this.cache.set(key, result);
    // Set TTL if using Redis
  }
}
