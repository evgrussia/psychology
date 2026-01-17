import { Injectable, LoggerService, ConsoleLogger } from '@nestjs/common';
import { redactSensitiveData } from '../observability/redaction';
import { RequestContext } from '../observability/request-context';

@Injectable()
export class AppLogger extends ConsoleLogger implements LoggerService {
  constructor(context?: string) {
    super(context);
  }

  log(message: any, context?: string) {
    super.log(this.formatLog('log', message, context));
  }

  error(message: any, stack?: string, context?: string) {
    super.error(this.formatLog('error', message, context, stack));
  }

  warn(message: any, context?: string) {
    super.warn(this.formatLog('warn', message, context));
  }

  debug(message: any, context?: string) {
    super.debug(this.formatLog('debug', message, context));
  }

  verbose(message: any, context?: string) {
    super.verbose(this.formatLog('verbose', message, context));
  }

  private formatLog(level: string, message: any, context?: string, stack?: string): string {
    const requestId = RequestContext.getRequestId();
    const normalized = this.normalizeMessage(message, stack);
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      context: context ?? this.context,
      request_id: requestId ?? undefined,
      ...normalized,
    };

    return JSON.stringify(redactSensitiveData(payload));
  }

  private normalizeMessage(message: any, stack?: string): { message: string; meta?: unknown; stack?: string } {
    if (message instanceof Error) {
      return {
        message: message.message,
        stack: message.stack ?? stack,
      };
    }

    if (typeof message === 'string') {
      return {
        message,
        stack,
      };
    }

    return {
      message: 'log',
      meta: message,
      stack,
    };
  }
}
