import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType, ContentStatus, TimeToBenefit, ContentFormat, SupportLevel } from '@domain/content/value-objects/ContentEnums';

export class CreateContentItemDto {
  @ApiProperty({ enum: ContentType })
  contentType: ContentType;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  excerpt?: string;

  @ApiProperty()
  bodyMarkdown: string;

  @ApiPropertyOptional({ enum: TimeToBenefit })
  timeToBenefit?: TimeToBenefit;

  @ApiPropertyOptional({ enum: ContentFormat })
  format?: ContentFormat;

  @ApiPropertyOptional({ enum: SupportLevel })
  supportLevel?: SupportLevel;

  @ApiPropertyOptional({ type: 'object' })
  practicalBlock?: Record<string, unknown>;

  @ApiPropertyOptional()
  seoTitle?: string;

  @ApiPropertyOptional()
  seoDescription?: string;

  @ApiPropertyOptional()
  seoKeywords?: string;

  @ApiPropertyOptional()
  canonicalUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  topicCodes?: string[];

  @ApiPropertyOptional({ type: [String] })
  tagIds?: string[];
}

export class UpdateContentItemDto {
  @ApiPropertyOptional()
  slug?: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  excerpt?: string;

  @ApiPropertyOptional()
  bodyMarkdown?: string;

  @ApiPropertyOptional({ enum: ContentStatus })
  status?: ContentStatus;

  @ApiPropertyOptional({ enum: TimeToBenefit })
  timeToBenefit?: TimeToBenefit;

  @ApiPropertyOptional({ enum: ContentFormat })
  format?: ContentFormat;

  @ApiPropertyOptional({ enum: SupportLevel })
  supportLevel?: SupportLevel;

  @ApiPropertyOptional({ type: 'object' })
  practicalBlock?: Record<string, unknown>;

  @ApiPropertyOptional()
  seoTitle?: string;

  @ApiPropertyOptional()
  seoDescription?: string;

  @ApiPropertyOptional()
  seoKeywords?: string;

  @ApiPropertyOptional()
  canonicalUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  topicCodes?: string[];

  @ApiPropertyOptional({ type: [String] })
  tagIds?: string[];
}

export class ContentItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ContentType })
  contentType: ContentType;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  excerpt?: string;

  @ApiProperty()
  bodyMarkdown: string;

  @ApiProperty({ enum: ContentStatus })
  status: ContentStatus;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiProperty()
  authorUserId: string;

  @ApiPropertyOptional({ enum: TimeToBenefit })
  timeToBenefit?: TimeToBenefit;

  @ApiPropertyOptional({ enum: ContentFormat })
  format?: ContentFormat;

  @ApiPropertyOptional({ enum: SupportLevel })
  supportLevel?: SupportLevel;

  @ApiPropertyOptional({ type: 'object' })
  practicalBlock?: Record<string, unknown>;

  @ApiPropertyOptional()
  seoTitle?: string;

  @ApiPropertyOptional()
  seoDescription?: string;

  @ApiPropertyOptional()
  seoKeywords?: string;

  @ApiPropertyOptional()
  canonicalUrl?: string;

  @ApiProperty({ type: [String] })
  topicCodes: string[];

  @ApiProperty({ type: [String] })
  tagIds: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
