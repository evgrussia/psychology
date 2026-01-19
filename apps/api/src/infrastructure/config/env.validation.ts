import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsOptional, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  MEDIA_STORAGE_PATH: string;

  @IsString()
  MEDIA_PUBLIC_URL_BASE: string;

  @IsString()
  MEDIA_UPLOAD_ENABLED?: string; // 'true' or 'false' as string

  @IsOptional()
  @IsString()
  NAVIGATOR_ENABLED?: string; // 'true' or 'false' as string, defaults to 'true'

  @IsOptional()
  @IsNumber()
  HTTP_TIMEOUT_MS?: number;

  @IsOptional()
  @IsNumber()
  HTTP_RETRY_ATTEMPTS?: number;

  @IsOptional()
  @IsString()
  YOOKASSA_WEBHOOK_SECRET?: string;

  @IsOptional()
  @IsString()
  YOOKASSA_WEBHOOK_SIGNATURE_HEADER?: string;

  @IsOptional()
  @IsString()
  YOOKASSA_WEBHOOK_IP_ALLOWLIST?: string;

  @IsOptional()
  @IsString()
  YOOKASSA_WEBHOOK_BASIC_AUTH?: string;

  @IsString()
  ENCRYPTION_KEY: string;

  @IsString()
  ENCRYPTION_KEY_ID: string;

  @IsOptional()
  @IsString()
  TELEGRAM_BOT_USERNAME?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_CHANNEL_USERNAME?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_SERVICE_TOKEN?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_BOT_TOKEN?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_WEBHOOK_URL?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_WEBHOOK_SECRET?: string;

  @IsOptional()
  @IsString()
  TELEGRAM_UPDATES_MODE?: string;

  @IsOptional()
  @IsNumber()
  TELEGRAM_POLLING_INTERVAL_MS?: number;

  @IsOptional()
  @IsNumber()
  TELEGRAM_DEEP_LINK_TTL_DAYS?: number;

  @IsOptional()
  @IsNumber()
  TELEGRAM_DEEP_LINK_CLEANUP_INTERVAL_HOURS?: number;

  @IsOptional()
  @IsNumber()
  TELEGRAM_REMINDER_DELAY_HOURS?: number;

  @IsOptional()
  @IsNumber()
  TELEGRAM_SERIES_STEP_DELAY_HOURS?: number;

  @IsOptional()
  @IsNumber()
  TELEGRAM_SCHEDULE_INTERVAL_MS?: number;

  @IsOptional()
  @IsNumber()
  TELEGRAM_SCHEDULE_BATCH_LIMIT?: number;

  @IsOptional()
  @IsString()
  PUBLIC_WEB_URL?: string;

  @IsOptional()
  @IsString()
  ALERTS_ENABLED?: string;

  @IsOptional()
  @IsString()
  ALERT_EMAIL_TO?: string;

  @IsOptional()
  @IsNumber()
  ALERT_MIN_INTERVAL_MINUTES?: number;

  @IsOptional()
  @IsNumber()
  MODERATION_ALERT_INTERVAL_MINUTES?: number;

  @IsOptional()
  @IsString()
  SENTRY_DSN?: string;

  @IsOptional()
  @IsNumber()
  ERROR_RATE_WINDOW_MINUTES?: number;

  @IsOptional()
  @IsNumber()
  ERROR_RATE_THRESHOLD?: number;

  @IsOptional()
  @IsNumber()
  ERROR_RATE_MIN_SAMPLES?: number;
}

export function validate(config: Record<string, any>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
