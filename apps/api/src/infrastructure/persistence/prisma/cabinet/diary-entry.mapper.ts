import { DiaryEntry as PrismaDiaryEntry, DiaryType as PrismaDiaryType } from '@prisma/client';
import { DiaryEntry } from '@domain/cabinet/entities/DiaryEntry';
import { DiaryType } from '@domain/cabinet/value-objects/DiaryEnums';

export class DiaryEntryMapper {
  static toDomain(record: PrismaDiaryEntry): DiaryEntry {
    return DiaryEntry.create({
      id: record.id,
      userId: record.user_id,
      diaryType: DiaryEntryMapper.mapTypeToDomain(record.diary_type),
      entryDate: record.entry_date,
      payloadEncrypted: record.payload_encrypted,
      hasText: record.has_text,
      createdAt: record.created_at,
      deletedAt: record.deleted_at,
    });
  }

  static mapTypeToDomain(type: PrismaDiaryType): DiaryType {
    switch (type) {
      case PrismaDiaryType.emotions:
        return DiaryType.emotions;
      case PrismaDiaryType.abc:
        return DiaryType.abc;
      case PrismaDiaryType.sleep_energy:
        return DiaryType.sleep_energy;
      case PrismaDiaryType.gratitude:
        return DiaryType.gratitude;
      default:
        throw new Error(`Unknown DiaryType: ${type}`);
    }
  }
}
