import { IsBoolean, IsEnum, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ConciergeGoal {
  first_meeting = 'first_meeting',
  single_session = 'single_session',
  ongoing_support = 'ongoing_support',
}

export enum ConciergeFormatPreference {
  online = 'online',
  offline = 'offline',
  hybrid = 'hybrid',
  any = 'any',
}

export enum ConciergeUrgency {
  asap = 'asap',
  this_week = 'this_week',
  flexible = 'flexible',
}

export class AiConciergeAnswersDto {
  @IsOptional()
  @IsString()
  topic_code?: string;

  @IsEnum(ConciergeGoal)
  goal!: ConciergeGoal;

  @IsEnum(ConciergeFormatPreference)
  format_preference!: ConciergeFormatPreference;

  @IsEnum(ConciergeUrgency)
  urgency!: ConciergeUrgency;
}

export class AiConciergeRequestDto {
  @IsBoolean()
  age_confirmed!: boolean;

  @IsBoolean()
  consent_sensitive_text!: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 400)
  free_text?: string;

  @ValidateNested()
  @Type(() => AiConciergeAnswersDto)
  answers!: AiConciergeAnswersDto;
}

export interface AiConciergeResponseDto {
  status: 'ok' | 'crisis' | 'refused';
  message: string;
  disclaimer: string;
  refusal_reason?: string;
  crisis?: {
    trigger: string;
    actions: Array<{
      id: string;
      label: string;
      href?: string;
    }>;
  };
  recommendation?: {
    service?: {
      slug: string;
      title: string;
      href: string;
      format: string;
      duration_minutes: number;
      price_amount: number;
    };
    next_steps: string[];
  };
  handoff?: {
    reason: string;
    actions: Array<{
      label: string;
      href: string;
    }>;
  };
  cta?: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
}
