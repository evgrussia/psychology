import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';

export interface GetPageBySlugRequest {
  slug: string;
}

export interface GetPageBySlugResponse {
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
export class GetPageBySlugUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
  ) {}

  async execute(request: GetPageBySlugRequest): Promise<GetPageBySlugResponse> {
    const page = await this.contentItemRepo.findBySlug(ContentType.page, request.slug);

    if (!page || page.status !== ContentStatus.published) {
      throw new NotFoundException(`Page with slug "${request.slug}" not found`);
    }

    const obj = page.toObject();

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
