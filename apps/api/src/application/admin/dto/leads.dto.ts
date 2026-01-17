import { IsBooleanString, IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { LeadStatus } from '@domain/crm/value-objects/LeadEnums';

export class ListLeadsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsBooleanString()
  hasContact?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number = 30;
}

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus)
  status!: LeadStatus;
}

export class AddLeadNoteDto {
  @IsString()
  @Length(1, 2000)
  text!: string;
}

export interface LeadListItemDto {
  id: string;
  status: string;
  source: string;
  topicCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  displayName: string | null;
  hasContact: boolean;
  lastEvent: {
    eventName: string;
    occurredAt: Date;
  } | null;
}

export interface LeadListResponseDto {
  items: LeadListItemDto[];
  statusCounts: Record<string, number>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadDetailResponseDto {
  id: string;
  status: string;
  source: string;
  topicCode: string | null;
  utm: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  identities: Array<{
    id: string;
    userId: string | null;
    anonymousId: string | null;
    email: string | null;
    phone: string | null;
    telegramUserId: string | null;
    isPrimary: boolean;
    createdAt: Date;
    user?: {
      id: string;
      email: string | null;
      phone: string | null;
      telegramUserId: string | null;
      displayName: string | null;
    } | null;
  }>;
  timelineEvents: Array<{
    id: string;
    eventName: string;
    source: string;
    occurredAt: Date;
    deepLinkId: string | null;
    properties: Record<string, any>;
  }>;
  notes: Array<{
    id: string;
    leadId: string;
    authorUserId: string;
    text: string;
    createdAt: Date;
    author?: {
      id: string;
      email: string | null;
      displayName: string | null;
    } | null;
  }>;
  consents: {
    personalData: boolean;
    communications: boolean;
    telegram: boolean;
  } | null;
}
