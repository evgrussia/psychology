import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class AppLogger extends ConsoleLogger implements LoggerService {
  private static PII_FIELDS = ['password', 'token', 'email', 'phone', 'card_number'];

  constructor(context?: string) {
    super(context);
  }

  log(message: any, context?: string) {
    super.log(this.maskPii(message), context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(this.maskPii(message), stack, context);
  }

  warn(message: any, context?: string) {
    super.warn(this.maskPii(message), context);
  }

  debug(message: any, context?: string) {
    super.debug(this.maskPii(message), context);
  }

  verbose(message: any, context?: string) {
    super.verbose(this.maskPii(message), context);
  }

  private maskPii(data: any): any {
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };
    for (const key in masked) {
      if (AppLogger.PII_FIELDS.includes(key.toLowerCase())) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskPii(masked[key]);
      }
    }
    return masked;
  }
}
