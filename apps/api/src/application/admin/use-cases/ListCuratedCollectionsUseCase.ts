import { Inject, Injectable } from '@nestjs/common';
import { ICuratedCollectionRepository } from '@domain/content/repositories/ICuratedCollectionRepository';
import { AdminCuratedCollectionDto } from '../dto/curated.dto';

@Injectable()
export class ListCuratedCollectionsUseCase {
  constructor(
    @Inject('ICuratedCollectionRepository')
    private readonly curatedRepo: ICuratedCollectionRepository,
  ) {}

  async execute(): Promise<AdminCuratedCollectionDto[]> {
    const collections = await this.curatedRepo.findAll();
    
    return collections.map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      collectionType: c.collectionType,
      status: c.status,
      topicCode: c.topicCode,
      publishedAt: c.publishedAt,
      items: c.items.map(i => ({
        id: i.id,
        itemType: i.itemType,
        contentItemId: i.contentItemId,
        interactiveDefinitionId: i.interactiveDefinitionId,
        position: i.position,
        note: i.note,
      })),
    }));
  }
}
