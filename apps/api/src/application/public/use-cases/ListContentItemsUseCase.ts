import { Inject, Injectable } from '@nestjs/common';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';

export interface ListContentItemsRequest {
  type?: ContentType;
  status?: ContentStatus;
  limit?: number;
  offset?: number;
}

export interface ListContentItemsResponse {
  items: Array<{
    id: string;
    type: ContentType;
    slug: string;
    title: string;
    excerpt?: string;
    published_at?: Date;
    time_to_benefit?: string;
    format?: string;
    support_level?: string;
  }>;
  total: number;
}

@Injectable()
export class ListContentItemsUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
  ) {}

  async execute(request: ListContentItemsRequest): Promise<ListContentItemsResponse> {
    const filters: { type?: ContentType; status?: ContentStatus } = {};
    if (request.type) {
      filters.type = request.type;
    }
    if (request.status) {
      filters.status = request.status;
    } else {
      // By default, only show published content for public API
      filters.status = ContentStatus.published;
    }

    const allItems = await this.contentItemRepo.findAll(filters);
    
    // Apply pagination
    const offset = request.offset || 0;
    const limit = request.limit || 50;
    const items = allItems.slice(offset, offset + limit);

    return {
      items: items.map(item => {
        const obj = item.toObject();
        return {
          id: obj.id,
          type: obj.contentType,
          slug: obj.slug,
          title: obj.title,
          excerpt: obj.excerpt,
          published_at: obj.publishedAt,
          time_to_benefit: obj.timeToBenefit,
          format: obj.format,
          support_level: obj.supportLevel,
        };
      }),
      total: allItems.length,
    };
  }
}
