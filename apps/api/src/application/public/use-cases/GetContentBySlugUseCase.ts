import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';

export interface GetContentBySlugRequest {
  type: ContentType;
  slug: string;
}

export interface GetContentBySlugResponse {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  excerpt?: string;
  body_markdown: string;
  published_at?: Date;
  time_to_benefit?: string;
  format?: string;
  support_level?: string;
  practical_block?: Record<string, unknown> | null;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
}

@Injectable()
export class GetContentBySlugUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
  ) {}

  async execute(request: GetContentBySlugRequest): Promise<GetContentBySlugResponse> {
    const item = await this.contentItemRepo.findBySlug(request.type, request.slug);

    if (!item || item.status !== ContentStatus.published) {
      throw new NotFoundException(`Content of type "${request.type}" with slug "${request.slug}" not found`);
    }

    const obj = item.toObject();

    return {
      id: obj.id,
      type: obj.contentType,
      slug: obj.slug,
      title: obj.title,
      excerpt: obj.excerpt,
      body_markdown: obj.bodyMarkdown,
      published_at: obj.publishedAt,
      time_to_benefit: obj.timeToBenefit,
      format: obj.format,
      support_level: obj.supportLevel,
      practical_block: obj.practicalBlock ?? null,
      seo_title: obj.seoTitle,
      seo_description: obj.seoDescription,
      seo_keywords: obj.seoKeywords,
      canonical_url: obj.canonicalUrl,
    };
  }
}
