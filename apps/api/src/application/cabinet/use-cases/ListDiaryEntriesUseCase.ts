import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IDiaryEntryRepository } from '@domain/cabinet/repositories/IDiaryEntryRepository';
import { DiaryType } from '@domain/cabinet/value-objects/DiaryEnums';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { ListDiaryEntriesResponseDto } from '../dto/cabinet.dto';

@Injectable()
export class ListDiaryEntriesUseCase {
  constructor(
    @Inject('IDiaryEntryRepository')
    private readonly diaryEntryRepository: IDiaryEntryRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(
    userId: string,
    filters: { diaryType?: string | null; from?: string | null; to?: string | null },
  ): Promise<ListDiaryEntriesResponseDto> {
    const diaryType = filters.diaryType ? this.parseDiaryType(filters.diaryType) : null;
    const from = filters.from ? this.parseDate(filters.from, 'from') : null;
    const to = filters.to ? this.parseDate(filters.to, 'to') : null;

    const entries = await this.diaryEntryRepository.listByUserId(userId, {
      diaryType,
      from,
      to,
    });

    const items = entries.map((entry) => {
      const payload = this.decryptPayload(entry.payloadEncrypted);
      return {
        id: entry.id,
        diary_type: entry.diaryType,
        entry_date: entry.entryDate.toISOString().slice(0, 10),
        created_at: entry.createdAt.toISOString(),
        has_text: entry.hasText,
        payload,
      };
    });

    return { items };
  }

  private parseDiaryType(value: string): DiaryType {
    if (!Object.values(DiaryType).includes(value as DiaryType)) {
      throw new BadRequestException('Invalid diary type');
    }
    return value as DiaryType;
  }

  private parseDate(value: string, field: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Invalid ${field} date`);
    }
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }

  private decryptPayload(ciphertext: string): Record<string, unknown> {
    const plaintext = this.encryptionService.decrypt(ciphertext);
    try {
      return JSON.parse(plaintext);
    } catch (error) {
      throw new BadRequestException('Diary payload is corrupted');
    }
  }
}
