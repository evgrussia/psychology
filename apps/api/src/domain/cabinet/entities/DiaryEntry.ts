import { DiaryType } from '../value-objects/DiaryEnums';

export interface DiaryEntryProps {
  id: string;
  userId: string;
  diaryType: DiaryType;
  entryDate: Date;
  payloadEncrypted: string;
  hasText: boolean;
  createdAt: Date;
  deletedAt?: Date | null;
}

export class DiaryEntry {
  private constructor(private readonly props: DiaryEntryProps) {}

  static create(props: DiaryEntryProps): DiaryEntry {
    if (!props.payloadEncrypted || props.payloadEncrypted.trim().length === 0) {
      throw new Error('Encrypted diary payload is required');
    }
    return new DiaryEntry(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get diaryType(): DiaryType { return this.props.diaryType; }
  get entryDate(): Date { return this.props.entryDate; }
  get payloadEncrypted(): string { return this.props.payloadEncrypted; }
  get hasText(): boolean { return this.props.hasText; }
  get createdAt(): Date { return this.props.createdAt; }
  get deletedAt(): Date | null | undefined { return this.props.deletedAt; }
}
