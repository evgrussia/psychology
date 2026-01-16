import { DiaryEntry } from '../entities/DiaryEntry';
import { DiaryType } from '../value-objects/DiaryEnums';

export interface DiaryEntryFilters {
  diaryType?: DiaryType | null;
  from?: Date | null;
  to?: Date | null;
}

export interface IDiaryEntryRepository {
  create(entry: DiaryEntry): Promise<void>;
  findById(id: string): Promise<DiaryEntry | null>;
  listByUserId(userId: string, filters?: DiaryEntryFilters): Promise<DiaryEntry[]>;
  softDelete(id: string, deletedAt: Date): Promise<void>;
}
