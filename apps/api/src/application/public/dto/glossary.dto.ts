import { GlossaryTermCategory } from '@domain/content/value-objects/ContentEnums';

export interface PublicGlossaryTermResponseDto {
  slug: string;
  title: string;
  category: GlossaryTermCategory;
  shortDefinition: string;
  bodyMarkdown: string;
  metaDescription?: string;
  keywords?: string;
  synonyms: string[];
  relatedContent: {
    id: string;
    title: string;
    slug: string;
    contentType: string;
  }[];
}

export interface PublicGlossaryListItemDto {
  slug: string;
  title: string;
  category: GlossaryTermCategory;
  shortDefinition: string;
}
