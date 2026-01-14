import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { IEventBus } from '@domain/events/event-bus.interface';
import { ContentPublishedEvent } from '@domain/content/events/ContentPublishedEvent';
import { ContentItemResponseDto } from '../dto/content.dto';
import { ContentStatus } from '@domain/content/value-objects/ContentEnums';

export interface PublishContentItemRequest {
  qaChecklist: {
    hasDisclaimer: boolean;
    isToneGentle: boolean;
    hasTryNowBlock: boolean;
    hasCTA: boolean;
    hasInternalLinks: boolean;
    hasAltTexts: boolean;
    spellCheckDone: boolean;
  };
}

@Injectable()
export class PublishContentItemUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async execute(id: string, request: PublishContentItemRequest): Promise<ContentItemResponseDto> {
    const item = await this.contentItemRepo.findById(id);
    if (!item) {
      throw new NotFoundException(`Content item with ID "${id}" not found`);
    }

    // Basic validation of QA checklist
    const { qaChecklist } = request;
    const missingItems = Object.entries(qaChecklist)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingItems.length > 0) {
      throw new BadRequestException(`Cannot publish content: QA checklist not complete. Missing: ${missingItems.join(', ')}`);
    }

    // Simple validation of content body for required elements (disclaimer, CTA)
    if (!item.bodyMarkdown.toLowerCase().includes('дисклеймер') && !item.bodyMarkdown.toLowerCase().includes('важно')) {
      // Note: This is a loose check, in reality we might want something more robust
      console.warn(`Content item ${id} might be missing a disclaimer in body`);
    }

    item.publish();
    await this.contentItemRepo.save(item);

    // Publish domain event
    const publishedItem = item.toObject();
    await this.eventBus.publish(
      new ContentPublishedEvent(item.id, {
        contentType: publishedItem.contentType,
        slug: publishedItem.slug,
        title: publishedItem.title,
        authorUserId: publishedItem.authorUserId,
        publishedAt: publishedItem.publishedAt || new Date(),
      }),
    );

    return publishedItem;
  }
}
