import { CollectionType, ContentStatus, CuratedItemType } from '@domain/content/value-objects/ContentEnums';

export interface PublicCuratedItemDto {
  itemType: CuratedItemType;
  contentItem?: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    format?: string;
    timeToBenefit?: string;
  };
  interactive?: {
    id: string;
    slug: string;
    title: string;
    type: string;
  };
  note?: string;
  position: number;
}

export interface PublicCuratedCollectionDto {
  id: string;
  slug: string;
  title: string;
  collectionType: CollectionType;
  topicCode?: string;
  items: PublicCuratedItemDto[];
}
