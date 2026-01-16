import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IDiaryEntryRepository } from '@domain/cabinet/repositories/IDiaryEntryRepository';
import { DiaryEntry } from '@domain/cabinet/entities/DiaryEntry';
import { DiaryType } from '@domain/cabinet/value-objects/DiaryEnums';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { CreateDiaryEntryRequestDto, CreateDiaryEntryResponseDto } from '../dto/cabinet.dto';
import * as crypto from 'crypto';

const MAX_PAYLOAD_LENGTH = 10000;

@Injectable()
export class CreateDiaryEntryUseCase {
  constructor(
    @Inject('IDiaryEntryRepository')
    private readonly diaryEntryRepository: IDiaryEntryRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(userId: string, dto: CreateDiaryEntryRequestDto): Promise<CreateDiaryEntryResponseDto> {
    if (!dto.diary_type || !Object.values(DiaryType).includes(dto.diary_type)) {
      throw new BadRequestException('Invalid diary type');
    }
    if (!dto.payload || Object.keys(dto.payload).length === 0) {
      throw new BadRequestException('Diary payload is required');
    }

    const payloadString = JSON.stringify(dto.payload);
    if (payloadString.length > MAX_PAYLOAD_LENGTH) {
      throw new BadRequestException('Diary payload is too large');
    }

    const entryDate = this.normalizeEntryDate(dto.entry_date);
    const hasText = this.detectText(dto.payload);
    const encrypted = this.encryptionService.encrypt(payloadString);
    const entry = DiaryEntry.create({
      id: crypto.randomUUID(),
      userId,
      diaryType: dto.diary_type,
      entryDate,
      payloadEncrypted: encrypted,
      hasText,
      createdAt: new Date(),
      deletedAt: null,
    });

    await this.diaryEntryRepository.create(entry);
    await this.trackingService.trackDiaryEntryCreated({
      diaryType: entry.diaryType,
      hasText: entry.hasText,
    });

    return {
      id: entry.id,
      diary_type: entry.diaryType,
      entry_date: entry.entryDate.toISOString().slice(0, 10),
      created_at: entry.createdAt.toISOString(),
      has_text: entry.hasText,
    };
  }

  private normalizeEntryDate(dateValue?: string | null): Date {
    if (!dateValue) {
      return this.toUtcDate(new Date());
    }
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Invalid entry date');
    }
    return this.toUtcDate(parsed);
  }

  private toUtcDate(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private detectText(payload: Record<string, unknown>): boolean {
    const stack: unknown[] = [payload];
    while (stack.length) {
      const current = stack.pop();
      if (typeof current === 'string') {
        if (current.trim().length > 0) {
          return true;
        }
      } else if (Array.isArray(current)) {
        current.forEach((item) => stack.push(item));
      } else if (current && typeof current === 'object') {
        Object.values(current as Record<string, unknown>).forEach((value) => stack.push(value));
      }
    }
    return false;
  }
}
