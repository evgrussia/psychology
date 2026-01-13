import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * HTTP Client Configuration
 * 
 * Provides default timeout and retry settings for HTTP clients
 * used in integrations (Google Calendar, YooKassa, etc.)
 */
@Injectable()
export class HttpClientConfig {
  private readonly defaultTimeout: number;
  private readonly defaultRetryAttempts: number;

  constructor(private configService: ConfigService) {
    this.defaultTimeout = this.configService.get<number>('HTTP_TIMEOUT_MS') || 30000; // 30 seconds default
    this.defaultRetryAttempts = this.configService.get<number>('HTTP_RETRY_ATTEMPTS') || 3;
  }

  getTimeout(): number {
    return this.defaultTimeout;
  }

  getRetryAttempts(): number {
    return this.defaultRetryAttempts;
  }

  /**
   * Get timeout for a specific service
   */
  getServiceTimeout(serviceName: string): number {
    const serviceTimeout = this.configService.get<number>(`${serviceName.toUpperCase()}_TIMEOUT_MS`);
    return serviceTimeout || this.defaultTimeout;
  }
}
