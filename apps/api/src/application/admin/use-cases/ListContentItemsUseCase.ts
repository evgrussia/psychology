import { Inject, Injectable } from '@nestjs/common';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentItemResponseDto } from '../dto/content.dto';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';

export interface ListContentItemsFilters {
  type?: ContentType;
  status?: ContentStatus;
  authorUserId?: string;
  topicCode?: string;
  tagId?: string;
}

@Injectable()
export class ListContentItemsUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
  ) {}

  async execute(filters?: ListContentItemsFilters): Promise<ContentItemResponseDto[]> {
    const items = await this.contentItemRepo.findAll(filters);
    return items.map(item => item.toObject());
  }
}
