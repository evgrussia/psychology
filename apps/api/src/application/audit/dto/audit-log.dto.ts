import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';

export enum AuditLogAction {
  ADMIN_PRICE_CHANGED = 'admin_price_changed',
  ADMIN_DATA_EXPORTED = 'admin_data_exported',
  ADMIN_CONTENT_PUBLISHED = 'admin_content_published',
  ADMIN_CONTENT_DELETED = 'admin_content_deleted',
  ADMIN_APPOINTMENT_DELETED = 'admin_appointment_deleted',
  ADMIN_ROLE_CHANGED = 'admin_role_changed',
  ADMIN_LOGIN = 'admin_login',
  ADMIN_SETTINGS_CHANGED = 'admin_settings_changed',
  ADMIN_GOOGLE_CALENDAR_CONNECT_STARTED = 'admin_google_calendar_connect_started',
  ADMIN_GOOGLE_CALENDAR_CONNECTED = 'admin_google_calendar_connected',
}

export class ListAuditLogDto {
  @IsOptional()
  @IsString()
  actorUserId?: string;

  @IsOptional()
  @IsEnum(AuditLogAction)
  action?: AuditLogAction;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export interface AuditLogEntryResponseDto {
  id: string;
  actorUserId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface ListAuditLogResponseDto {
  items: AuditLogEntryResponseDto[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface WriteAuditLogDto {
  actorUserId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
