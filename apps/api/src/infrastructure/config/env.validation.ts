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
  @IsNumber()
  HTTP_TIMEOUT_MS?: number;

  @IsOptional()
  @IsNumber()
  HTTP_RETRY_ATTEMPTS?: number;
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
