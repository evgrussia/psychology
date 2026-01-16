import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IDiaryEntryRepository, DiaryEntryFilters } from '@domain/cabinet/repositories/IDiaryEntryRepository';
import { DiaryEntry } from '@domain/cabinet/entities/DiaryEntry';
import { DiaryEntryMapper } from './diary-entry.mapper';

@Injectable()
export class PrismaDiaryEntryRepository implements IDiaryEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entry: DiaryEntry): Promise<void> {
    await this.prisma.diaryEntry.create({
      data: {
        id: entry.id,
        user_id: entry.userId,
        diary_type: entry.diaryType,
        entry_date: entry.entryDate,
        payload_encrypted: entry.payloadEncrypted,
        has_text: entry.hasText,
        created_at: entry.createdAt,
        deleted_at: entry.deletedAt ?? null,
      },
    });
  }

  async findById(id: string): Promise<DiaryEntry | null> {
    const record = await this.prisma.diaryEntry.findUnique({
      where: { id },
    });
    if (!record) {
      return null;
    }
    return DiaryEntryMapper.toDomain(record);
  }

  async listByUserId(userId: string, filters?: DiaryEntryFilters): Promise<DiaryEntry[]> {
    const where: any = {
      user_id: userId,
      deleted_at: null,
    };

    if (filters?.diaryType) {
      where.diary_type = filters.diaryType;
    }

    if (filters?.from || filters?.to) {
      where.entry_date = {};
      if (filters.from) {
        where.entry_date.gte = filters.from;
      }
      if (filters.to) {
        where.entry_date.lte = filters.to;
      }
    }

    const records = await this.prisma.diaryEntry.findMany({
      where,
      orderBy: [
        { entry_date: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return records.map(DiaryEntryMapper.toDomain);
  }

  async softDelete(id: string, deletedAt: Date): Promise<void> {
    await this.prisma.diaryEntry.update({
      where: { id },
      data: { deleted_at: deletedAt },
    });
  }
}
