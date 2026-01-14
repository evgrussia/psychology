import { Inject, Injectable } from '@nestjs/common';
import { ICuratedCollectionRepository } from '@domain/content/repositories/ICuratedCollectionRepository';
import { PublicCuratedCollectionDto } from '../dto/curated.dto';

@Injectable()
export class ListCuratedCollectionsUseCase {
  constructor(
    @Inject('ICuratedCollectionRepository')
    private readonly curatedRepo: ICuratedCollectionRepository,
  ) {}

  async execute(): Promise<PublicCuratedCollectionDto[]> {
    const collections = await this.curatedRepo.findPublished();
    
    // We don't include items in the list view to keep it light
    return collections.map(c => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      collectionType: c.collectionType,
      topicCode: c.topicCode,
      items: [], // Items are loaded only on the detail page
    }));
  }
}
