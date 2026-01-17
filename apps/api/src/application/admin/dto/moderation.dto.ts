import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min, Length } from 'class-validator';
import { ModerationReasonCategory, UgcStatus, UgcTriggerFlag, UgcType } from '@domain/moderation/value-objects/ModerationEnums';

export class ListModerationItemsQueryDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  trigger?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

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

export class RejectModerationItemDto {
  @IsEnum(ModerationReasonCategory)
  reasonCategory!: ModerationReasonCategory;
}

export class EscalateModerationItemDto {
  @IsOptional()
  @IsEnum(ModerationReasonCategory)
  reasonCategory?: ModerationReasonCategory;
}

export class AnswerModerationItemDto {
  @IsString()
  @Length(10, 4000)
  text!: string;
}

export interface ModerationListItemDto {
  id: string;
  type: UgcType;
  status: UgcStatus;
  submittedAt: Date;
  answeredAt: Date | null;
  triggerFlags: UgcTriggerFlag[];
  hasContact: boolean;
  lastAction: {
    action: string;
    reasonCategory: ModerationReasonCategory | null;
    createdAt: Date;
    moderator: {
      id: string;
      email: string | null;
      displayName: string | null;
    } | null;
  } | null;
}

export interface ModerationListResponseDto {
  items: ModerationListItemDto[];
  statusCounts: Record<string, number>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ModerationItemDetailsDto {
  id: string;
  status: UgcStatus;
  submittedAt: Date;
  answeredAt: Date | null;
  triggerFlags: UgcTriggerFlag[];
  questionText: string;
  contactValue: string | null;
  publishAllowed: boolean;
  answers: Array<{
    id: string;
    text: string;
    publishedAt: Date;
    answeredBy: {
      id: string;
      email: string | null;
      displayName: string | null;
    } | null;
  }>;
  moderations: Array<{
    id: string;
    action: string;
    reasonCategory: ModerationReasonCategory | null;
    createdAt: Date;
    moderator: {
      id: string;
      email: string | null;
      displayName: string | null;
    } | null;
  }>;
}

export interface ModerationTemplateDto {
  id: string;
  name: string;
  channel: string;
  status: string;
  latestVersion: {
    id: string;
    version: number;
    subject: string | null;
    bodyMarkdown: string;
    updatedBy: {
      id: string;
      email: string | null;
      displayName: string | null;
    } | null;
    createdAt: Date;
  } | null;
}
