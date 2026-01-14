import { GlossaryTermCategory, ContentStatus } from '@domain/content/value-objects/ContentEnums';

export interface UpsertGlossaryTermDto {
  id?: string;
  slug: string;
  title: string;
  category: GlossaryTermCategory;
  shortDefinition: string;
  bodyMarkdown: string;
  metaDescription?: string;
  keywords?: string;
  status?: ContentStatus;
  synonyms?: string[];
  relatedContentIds?: string[];
}

export interface GlossaryTermResponseDto {
  id: string;
  slug: string;
  title: string;
  category: GlossaryTermCategory;
  shortDefinition: string;
  bodyMarkdown: string;
  metaDescription?: string;
  keywords?: string;
  status: ContentStatus;
  publishedAt?: Date;
  synonyms: string[];
  relatedContentIds: string[];
}
