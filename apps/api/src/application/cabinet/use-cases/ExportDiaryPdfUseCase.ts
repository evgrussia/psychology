import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IDiaryEntryRepository } from '@domain/cabinet/repositories/IDiaryEntryRepository';
import { IDiaryExportRenderer } from '@domain/cabinet/services/IDiaryExportRenderer';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { ExportDiaryPdfRequestDto } from '../dto/cabinet.dto';

type ExportPeriod = '7d' | '30d' | 'custom';

@Injectable()
export class ExportDiaryPdfUseCase {
  constructor(
    @Inject('IDiaryEntryRepository')
    private readonly diaryEntryRepository: IDiaryEntryRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
    @Inject('IDiaryExportRenderer')
    private readonly diaryExportRenderer: IDiaryExportRenderer,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(userId: string, dto: ExportDiaryPdfRequestDto): Promise<{ buffer: Buffer; filename: string }> {
    const period = this.parsePeriod(dto.period);
    const { from, to } = this.resolvePeriod(period, dto.from, dto.to);
    const entryIds = this.normalizeEntryIds(dto.entry_ids);

    const entries = entryIds.length
      ? await this.loadEntriesById(userId, entryIds)
      : await this.diaryEntryRepository.listByUserId(userId, { from, to });

    const exportEntries = entries.map((entry) => ({
      id: entry.id,
      diaryType: entry.diaryType,
      entryDate: entry.entryDate,
      createdAt: entry.createdAt,
      hasText: entry.hasText,
      payload: this.decryptPayload(entry.payloadEncrypted),
    }));

    const periodLabel = `${this.formatDate(from)} — ${this.formatDate(to)}`;
    const buffer = await this.diaryExportRenderer.renderDiaryPdf({
      title: 'Экспорт дневников',
      periodLabel,
      generatedAt: new Date(),
      entries: exportEntries,
    });

    await this.trackingService.trackPdfExported({
      exportType: 'diary_pdf',
      period,
    });

    return {
      buffer,
      filename: `diary-export-${this.formatDate(new Date())}.pdf`,
    };
  }

  private parsePeriod(period?: string | null): ExportPeriod {
    if (period === '7d' || period === '30d' || period === 'custom') {
      return period;
    }
    throw new BadRequestException('Invalid export period');
  }

  private resolvePeriod(period: ExportPeriod, from?: string | null, to?: string | null): { from: Date; to: Date } {
    const today = this.toUtcDate(new Date());
    if (period === '7d') {
      return { from: this.addDays(today, -6), to: today };
    }
    if (period === '30d') {
      return { from: this.addDays(today, -29), to: today };
    }
    if (!from || !to) {
      throw new BadRequestException('Custom period requires from/to');
    }

    const fromDate = this.parseDate(from, 'from');
    const toDate = this.parseDate(to, 'to');
    if (fromDate.getTime() > toDate.getTime()) {
      throw new BadRequestException('Invalid period range');
    }
    return { from: fromDate, to: toDate };
  }

  private normalizeEntryIds(entryIds?: string[] | null): string[] {
    if (!entryIds?.length) {
      return [];
    }
    return Array.from(new Set(entryIds.map((id) => id.trim()).filter(Boolean)));
  }

  private async loadEntriesById(userId: string, entryIds: string[]) {
    const entries = [];
    for (const entryId of entryIds) {
      const entry = await this.diaryEntryRepository.findById(entryId);
      if (!entry) {
        throw new BadRequestException('Diary entry not found');
      }
      if (entry.userId !== userId) {
        throw new ForbiddenException('Diary entry access denied');
      }
      if (!entry.deletedAt) {
        entries.push(entry);
      }
    }

    return entries.sort((a, b) => {
      const dateDiff = b.entryDate.getTime() - a.entryDate.getTime();
      if (dateDiff !== 0) {
        return dateDiff;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  private parseDate(value: string, field: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Invalid ${field} date`);
    }
    return this.toUtcDate(parsed);
  }

  private toUtcDate(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return this.toUtcDate(next);
  }

  private decryptPayload(ciphertext: string): Record<string, unknown> {
    const plaintext = this.encryptionService.decrypt(ciphertext);
    try {
      return JSON.parse(plaintext);
    } catch (error) {
      throw new BadRequestException('Diary payload is corrupted');
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
