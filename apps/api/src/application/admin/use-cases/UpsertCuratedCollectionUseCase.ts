import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICuratedCollectionRepository } from '@domain/content/repositories/ICuratedCollectionRepository';
import { CuratedCollection } from '@domain/content/entities/CuratedCollection';
import { CuratedItem } from '@domain/content/entities/CuratedItem';
import { UpsertCuratedCollectionDto } from '../dto/curated.dto';
import { ContentStatus } from '@domain/content/value-objects/ContentEnums';

@Injectable()
export class UpsertCuratedCollectionUseCase {
  constructor(
    @Inject('ICuratedCollectionRepository')
    private readonly curatedRepo: ICuratedCollectionRepository,
  ) {}

  async execute(dto: UpsertCuratedCollectionDto): Promise<string> {
    let collection: CuratedCollection | null = null;
    const id = dto.id || uuidv4();

    if (dto.id) {
      collection = await this.curatedRepo.findById(dto.id);
    }

    if (!collection) {
      collection = CuratedCollection.create({
        id,
        slug: dto.slug,
        title: dto.title,
        collectionType: dto.collectionType,
        status: dto.status || ContentStatus.draft,
        topicCode: dto.topicCode,
      });
    } else {
      collection.update({
        slug: dto.slug,
        title: dto.title,
        collectionType: dto.collectionType,
        status: dto.status,
        topicCode: dto.topicCode,
      });
    }

    const items = dto.items.map((item, index) => CuratedItem.create({
      id: item.id || uuidv4(),
      collectionId: id,
      itemType: item.itemType,
      contentItemId: item.contentItemId,
      interactiveDefinitionId: item.interactiveDefinitionId,
      position: item.position !== undefined ? item.position : index,
      note: item.note,
    }));

    collection.setItems(items);

    await this.curatedRepo.save(collection);

    return id;
  }
}
