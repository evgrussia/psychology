import { CuratedItemType } from '../value-objects/ContentEnums';

export interface CuratedItemProps {
  id: string;
  collectionId: string;
  itemType: CuratedItemType;
  contentItemId?: string;
  interactiveDefinitionId?: string;
  position: number;
  note?: string;
}

export class CuratedItem {
  constructor(private readonly props: CuratedItemProps) {}

  get id(): string { return this.props.id; }
  get collectionId(): string { return this.props.collectionId; }
  get itemType(): CuratedItemType { return this.props.itemType; }
  get contentItemId(): string | undefined { return this.props.contentItemId; }
  get interactiveDefinitionId(): string | undefined { return this.props.interactiveDefinitionId; }
  get position(): number { return this.props.position; }
  get note(): string | undefined { return this.props.note; }

  static create(props: CuratedItemProps): CuratedItem {
    return new CuratedItem(props);
  }

  updatePosition(position: number): void {
    (this.props as any).position = position;
  }
}
