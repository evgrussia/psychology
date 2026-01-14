import { CollectionType, ContentStatus, CuratedItemType } from '@domain/content/value-objects/ContentEnums';

export interface AdminCuratedItemDto {
  id?: string;
  itemType: CuratedItemType;
  contentItemId?: string;
  interactiveDefinitionId?: string;
  position: number;
  note?: string;
}

export interface AdminCuratedCollectionDto {
  id: string;
  slug: string;
  title: string;
  collectionType: CollectionType;
  status: ContentStatus;
  topicCode?: string;
  publishedAt?: Date;
  items: AdminCuratedItemDto[];
}

export interface UpsertCuratedCollectionDto {
  id?: string;
  slug: string;
  title: string;
  collectionType: CollectionType;
  status: ContentStatus;
  topicCode?: string;
  items: AdminCuratedItemDto[];
}

export interface ReorderCuratedItemsDto {
  itemIds: string[];
}
