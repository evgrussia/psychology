import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { UgcStatus, UgcTriggerFlag } from '@domain/moderation/value-objects/ModerationEnums';

export class SubmitAnonymousQuestionRequestDto {
  @IsString()
  @Length(20, 4000)
  text!: string;

  @IsOptional()
  @IsString()
  @Length(3, 200)
  contactValue?: string;

  @IsOptional()
  @IsBoolean()
  publishAllowed?: boolean;
}

export interface SubmitAnonymousQuestionResponseDto {
  id: string;
  status: UgcStatus;
  triggerFlags: UgcTriggerFlag[];
  submittedAt: Date;
}

export interface AnonymousQuestionStatusResponseDto {
  id: string;
  status: UgcStatus;
  submittedAt: Date;
  answeredAt: Date | null;
  triggerFlags: UgcTriggerFlag[];
}
