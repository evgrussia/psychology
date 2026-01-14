import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICuratedCollectionRepository } from '@domain/content/repositories/ICuratedCollectionRepository';
import { AdminCuratedCollectionDto } from '../dto/curated.dto';

@Injectable()
export class GetCuratedCollectionUseCase {
  constructor(
    @Inject('ICuratedCollectionRepository')
    private readonly curatedRepo: ICuratedCollectionRepository,
  ) {}

  async execute(id: string): Promise<AdminCuratedCollectionDto> {
    const collection = await this.curatedRepo.findById(id);
    
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return {
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      collectionType: collection.collectionType,
      status: collection.status,
      topicCode: collection.topicCode,
      publishedAt: collection.publishedAt,
      items: collection.items.map(i => ({
        id: i.id,
        itemType: i.itemType,
        contentItemId: i.contentItemId,
        interactiveDefinitionId: i.interactiveDefinitionId,
        position: i.position,
        note: i.note,
      })),
    };
  }
}
