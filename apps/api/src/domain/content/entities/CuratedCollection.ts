import { CollectionType, ContentStatus } from '../value-objects/ContentEnums';
import { CuratedItem } from './CuratedItem';

export interface CuratedCollectionProps {
  id: string;
  slug: string;
  title: string;
  collectionType: CollectionType;
  status: ContentStatus;
  topicCode?: string;
  publishedAt?: Date;
  items?: CuratedItem[];
}

export class CuratedCollection {
  constructor(private readonly props: CuratedCollectionProps) {}

  get id(): string { return this.props.id; }
  get slug(): string { return this.props.slug; }
  get title(): string { return this.props.title; }
  get collectionType(): CollectionType { return this.props.collectionType; }
  get status(): ContentStatus { return this.props.status; }
  get topicCode(): string | undefined { return this.props.topicCode; }
  get publishedAt(): Date | undefined { return this.props.publishedAt; }
  get items(): CuratedItem[] { return this.props.items || []; }

  static create(props: CuratedCollectionProps): CuratedCollection {
    return new CuratedCollection(props);
  }

  update(updates: Partial<Omit<CuratedCollectionProps, 'id'>>): void {
    Object.assign(this.props, updates);
  }

  publish(): void {
    this.props.status = ContentStatus.published;
    this.props.publishedAt = new Date();
  }

  setItems(items: CuratedItem[]): void {
    this.props.items = items;
  }
}
