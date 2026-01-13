import { IsString, IsOptional, IsUUID, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { ResultLevel } from '../../../domain/interactive/value-objects/ResultLevel';
import { InteractiveType } from '../../../domain/interactive/value-objects/InteractiveType';

export class StartInteractiveRunDto {
  @IsEnum(InteractiveType)
  interactive_type: InteractiveType;

  @IsString()
  interactive_slug: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  entry_point?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  anonymousId?: string;

  @IsOptional()
  @IsString()
  deepLinkId?: string;
}

export class CompleteInteractiveRunDto {
  @IsOptional()
  @IsEnum(ResultLevel)
  resultLevel?: ResultLevel;

  @IsOptional()
  @IsString()
  resultProfile?: string;

  @IsInt()
  durationMs: number;

  @IsOptional()
  @IsBoolean()
  crisisTriggered?: boolean;

  @IsOptional()
  @IsString()
  crisisTriggerType?: string;
}
