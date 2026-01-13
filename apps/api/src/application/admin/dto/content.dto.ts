import { ContentType, ContentStatus, TimeToBenefit, ContentFormat, SupportLevel } from '../../../domain/content/value-objects/ContentEnums';

export interface CreateContentItemDto {
  contentType: ContentType;
  slug: string;
  title: string;
  excerpt?: string;
  bodyMarkdown: string;
  timeToBenefit?: TimeToBenefit;
  format?: ContentFormat;
  supportLevel?: SupportLevel;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  topicCodes?: string[];
  tagIds?: string[];
}

export interface UpdateContentItemDto {
  slug?: string;
  title?: string;
  excerpt?: string;
  bodyMarkdown?: string;
  status?: ContentStatus;
  timeToBenefit?: TimeToBenefit;
  format?: ContentFormat;
  supportLevel?: SupportLevel;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  topicCodes?: string[];
  tagIds?: string[];
}

export interface ContentItemResponseDto {
  id: string;
  contentType: ContentType;
  slug: string;
  title: string;
  excerpt?: string;
  bodyMarkdown: string;
  status: ContentStatus;
  publishedAt?: Date;
  authorUserId: string;
  timeToBenefit?: TimeToBenefit;
  format?: ContentFormat;
  supportLevel?: SupportLevel;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  topicCodes: string[];
  tagIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
