import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IContentItemRepository } from '../../../domain/content/repositories/IContentItemRepository';
import { ContentType, ContentStatus } from '../../../domain/content/value-objects/ContentEnums';

export interface GetPageBySlugRequest {
  slug: string;
}

export interface GetPageBySlugResponse {
  id: string;
  title: string;
  body_markdown: string;
  published_at?: Date;
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

    return {
      id: page.id,
      title: page.title,
      body_markdown: page.bodyMarkdown,
      published_at: page.publishedAt,
    };
  }
}
