import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { IErrorReporter, ErrorReporterContext } from '@domain/observability/services/IErrorReporter';
import { redactSensitiveData } from './redaction';

@Injectable()
export class SentryErrorReporter implements IErrorReporter {
  private static isInitialized = false;
  private readonly enabled: boolean;
  private readonly environment: string;

  constructor(private readonly configService: ConfigService) {
    const dsn = this.configService.get<string>('SENTRY_DSN')?.trim();
    this.enabled = Boolean(dsn);
    this.environment = this.resolveEnvironment();

    if (this.enabled && !SentryErrorReporter.isInitialized) {
      Sentry.init({
        dsn,
        environment: this.environment,
        beforeSend: (event) => redactSensitiveData(event) as typeof event,
      });
      SentryErrorReporter.isInitialized = true;
    }
  }

  captureException(error: unknown, context?: ErrorReporterContext): void {
    if (!this.enabled) {
      return;
    }

    const safeContext = redactSensitiveData(context ?? {}) as ErrorReporterContext;
    Sentry.withScope((scope) => {
      if (safeContext.requestId) {
        scope.setTag('request_id', safeContext.requestId);
      }
      if (safeContext.path) {
        scope.setTag('path', safeContext.path);
      }
      if (safeContext.method) {
        scope.setTag('method', safeContext.method);
      }
      if (safeContext.statusCode) {
        scope.setTag('status_code', String(safeContext.statusCode));
      }
      if (safeContext.source) {
        scope.setTag('source', safeContext.source);
      }

      scope.setExtra('context', safeContext);
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, context?: ErrorReporterContext): void {
    if (!this.enabled) {
      return;
    }

    const safeContext = redactSensitiveData(context ?? {}) as ErrorReporterContext;
    Sentry.withScope((scope) => {
      scope.setExtra('context', safeContext);
      Sentry.captureMessage(message);
    });
  }

  private resolveEnvironment(): string {
    const appEnv = this.configService.get<string>('APP_ENV')?.trim();
    if (appEnv) {
      return appEnv;
    }
    return this.configService.get<string>('NODE_ENV') || 'dev';
  }
}
