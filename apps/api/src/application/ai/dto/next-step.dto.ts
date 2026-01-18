import { IsBoolean, IsEnum, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum NextStepIntensity {
  acute = 'acute',
  background = 'background',
}

export enum NextStepGoal {
  relief = 'relief',
  clarity = 'clarity',
  decision = 'decision',
}

export enum NextStepTimeToBenefit {
  min_1_3 = 'min_1_3',
  min_7_10 = 'min_7_10',
  min_20_30 = 'min_20_30',
  series = 'series',
}

export enum NextStepSupportLevel {
  self_help = 'self_help',
  micro_support = 'micro_support',
  consultation = 'consultation',
}

export enum NextStepSafetyAnswer {
  safe = 'safe',
  unsafe = 'unsafe',
  not_sure = 'not_sure',
}

export class AiNextStepAnswersDto {
  @IsOptional()
  @IsString()
  topic_code?: string;

  @IsEnum(NextStepIntensity)
  intensity!: NextStepIntensity;

  @IsEnum(NextStepGoal)
  goal!: NextStepGoal;

  @IsEnum(NextStepTimeToBenefit)
  time_to_benefit!: NextStepTimeToBenefit;

  @IsEnum(NextStepSupportLevel)
  support_level!: NextStepSupportLevel;

  @IsEnum(NextStepSafetyAnswer)
  safety!: NextStepSafetyAnswer;
}

export class AiNextStepRequestDto {
  @IsBoolean()
  age_confirmed!: boolean;

  @IsBoolean()
  consent_sensitive_text!: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 400)
  free_text?: string;

  @ValidateNested()
  @Type(() => AiNextStepAnswersDto)
  answers!: AiNextStepAnswersDto;
}

export interface AiNextStepResponseDto {
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
  recommendations?: {
    topic?: {
      code: string;
      title: string;
      href: string;
    };
    articles: Array<{ title: string; href: string }>;
    resources: Array<{ title: string; href: string }>;
  };
  next_steps?: {
    now: string[];
    week: string[];
  };
  cta?: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
}
