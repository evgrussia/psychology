import { 
  CuratedCollection as PrismaCuratedCollection,
  CuratedItem as PrismaCuratedItem
} from '@prisma/client';
import { CuratedCollection } from '@domain/content/entities/CuratedCollection';
import { CuratedItem } from '@domain/content/entities/CuratedItem';
import { 
  CollectionType, 
  ContentStatus,
  CuratedItemType
} from '@domain/content/value-objects/ContentEnums';

type PrismaCuratedCollectionWithItems = PrismaCuratedCollection & {
  items?: PrismaCuratedItem[];
};

export class CuratedCollectionMapper {
  static toDomain(prismaCollection: PrismaCuratedCollectionWithItems): CuratedCollection {
    const items = prismaCollection.items?.map(item => CuratedItem.create({
      id: item.id,
      collectionId: item.collection_id,
      itemType: item.item_type as CuratedItemType,
      contentItemId: item.content_item_id ?? undefined,
      interactiveDefinitionId: item.interactive_definition_id ?? undefined,
      position: item.position,
      note: item.note ?? undefined,
    })) || [];

    return CuratedCollection.create({
      id: prismaCollection.id,
      slug: prismaCollection.slug,
      title: prismaCollection.title,
      collectionType: prismaCollection.collection_type as CollectionType,
      status: prismaCollection.status as ContentStatus,
      topicCode: prismaCollection.topic_code ?? undefined,
      publishedAt: prismaCollection.published_at ?? undefined,
      items,
    });
  }

  static toPrisma(domainCollection: CuratedCollection): Partial<PrismaCuratedCollection> {
    return {
      id: domainCollection.id,
      slug: domainCollection.slug,
      title: domainCollection.title,
      collection_type: domainCollection.collectionType,
      status: domainCollection.status,
      topic_code: domainCollection.topicCode ?? null,
      published_at: domainCollection.publishedAt ?? null,
    };
  }

  static itemToPrisma(domainItem: CuratedItem): Partial<PrismaCuratedItem> {
    return {
      id: domainItem.id,
      collection_id: domainItem.collectionId,
      item_type: domainItem.itemType,
      content_item_id: domainItem.contentItemId ?? null,
      interactive_definition_id: domainItem.interactiveDefinitionId ?? null,
      position: domainItem.position,
      note: domainItem.note ?? null,
    };
  }
}
