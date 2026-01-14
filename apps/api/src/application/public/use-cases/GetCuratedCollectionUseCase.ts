import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICuratedCollectionRepository } from '@domain/content/repositories/ICuratedCollectionRepository';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { PublicCuratedCollectionDto, PublicCuratedItemDto } from '../dto/curated.dto';
import { CuratedItemType } from '@domain/content/value-objects/ContentEnums';

@Injectable()
export class GetCuratedCollectionUseCase {
  constructor(
    @Inject('ICuratedCollectionRepository')
    private readonly curatedRepo: ICuratedCollectionRepository,
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
    @Inject('IInteractiveDefinitionRepository')
    private readonly interactiveRepo: IInteractiveDefinitionRepository,
  ) {}

  async execute(slug: string): Promise<PublicCuratedCollectionDto> {
    const collection = await this.curatedRepo.findBySlug(slug);
    
    if (!collection) {
      throw new NotFoundException(`Collection with slug ${slug} not found`);
    }

    const itemDtos: PublicCuratedItemDto[] = [];

    for (const item of collection.items) {
      if (item.itemType === CuratedItemType.content && item.contentItemId) {
        const contentItem = await this.contentItemRepo.findById(item.contentItemId);
        if (contentItem && contentItem.status === 'published') {
          itemDtos.push({
            itemType: item.itemType,
            position: item.position,
            note: item.note,
            contentItem: {
              id: contentItem.id,
              slug: contentItem.slug,
              title: contentItem.title,
              excerpt: contentItem.excerpt,
              format: contentItem.format,
              timeToBenefit: contentItem.timeToBenefit,
            },
          });
        }
      } else if (item.itemType === CuratedItemType.interactive && item.interactiveDefinitionId) {
        const interactive = await this.interactiveRepo.findById(item.interactiveDefinitionId);
        if (interactive && interactive.status === 'published') {
          itemDtos.push({
            itemType: item.itemType,
            position: item.position,
            note: item.note,
            interactive: {
              id: interactive.id,
              slug: interactive.slug,
              title: interactive.title,
              type: interactive.type,
            },
          });
        }
      }
    }

    return {
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      collectionType: collection.collectionType,
      topicCode: collection.topicCode,
      items: itemDtos,
    };
  }
}
