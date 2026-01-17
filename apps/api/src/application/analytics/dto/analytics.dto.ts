import { IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ANALYTICS_ALLOWED_SOURCES } from '../analytics-dictionary';

export class AnalyticsPageDto {
  [key: string]: unknown;

  @IsOptional()
  @IsString()
  page_path?: string;

  @IsOptional()
  @IsString()
  page_title?: string;

  @IsOptional()
  @IsString()
  referrer?: string | null;
}

export class AnalyticsAcquisitionDto {
  [key: string]: unknown;

  @IsOptional()
  @IsString()
  entry_point?: string | null;

  @IsOptional()
  @IsString()
  utm_source?: string | null;

  @IsOptional()
  @IsString()
  utm_medium?: string | null;

  @IsOptional()
  @IsString()
  utm_campaign?: string | null;

  @IsOptional()
  @IsString()
  utm_content?: string | null;

  @IsOptional()
  @IsString()
  utm_term?: string | null;
}

export class AnalyticsIngestDto {
  @IsString()
  @IsNotEmpty()
  schema_version!: string;

  @IsString()
  @IsNotEmpty()
  event_name!: string;

  @IsInt()
  @Min(1)
  event_version!: number;

  @IsString()
  @IsNotEmpty()
  event_id!: string;

  @IsString()
  @IsNotEmpty()
  occurred_at!: string;

  @IsString()
  @IsIn(ANALYTICS_ALLOWED_SOURCES as unknown as string[])
  source!: string;

  @IsString()
  @IsNotEmpty()
  environment!: string;

  @IsOptional()
  @IsString()
  session_id?: string | null;

  @IsOptional()
  @IsString()
  anonymous_id?: string | null;

  @IsOptional()
  @IsString()
  user_id?: string | null;

  @IsOptional()
  @IsString()
  lead_id?: string | null;

  @IsOptional()
  @IsObject()
  page?: AnalyticsPageDto;

  @IsOptional()
  @IsObject()
  acquisition?: AnalyticsAcquisitionDto;

  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
}

export interface AnalyticsIngestResultDto {
  status: 'ok' | 'ignored';
  lead_id?: string | null;
}
