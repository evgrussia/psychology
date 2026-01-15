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

  @IsString()
  ENCRYPTION_KEY: string;

  @IsString()
  ENCRYPTION_KEY_ID: string;

  @IsString()
  GOOGLE_OAUTH_CLIENT_ID: string;

  @IsString()
  GOOGLE_OAUTH_CLIENT_SECRET: string;

  @IsString()
  GOOGLE_OAUTH_REDIRECT_URI: string;

  @IsOptional()
  @IsString()
  GOOGLE_OAUTH_SCOPES?: string;

  @IsOptional()
  @IsNumber()
  GOOGLE_CALENDAR_SYNC_INTERVAL_MINUTES?: number;

  @IsOptional()
  @IsNumber()
  GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS?: number;
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
