import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IScheduleSettingsRepository } from '@domain/booking/repositories/IScheduleSettingsRepository';
import { ScheduleSettings } from '@domain/booking/entities/ScheduleSettings';

@Injectable()
export class PrismaScheduleSettingsRepository implements IScheduleSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<ScheduleSettings | null> {
    const record = await this.prisma.scheduleSettings.findFirst({
      orderBy: { created_at: 'asc' },
    });
    if (!record) return null;
    return ScheduleSettings.create({
      id: record.id,
      timezone: record.timezone,
      bufferMinutes: record.buffer_minutes,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }

  async upsert(params: { timezone: string; bufferMinutes: number }): Promise<ScheduleSettings> {
    const existing = await this.prisma.scheduleSettings.findFirst({
      orderBy: { created_at: 'asc' },
    });

    const record = existing
      ? await this.prisma.scheduleSettings.update({
        where: { id: existing.id },
        data: {
          timezone: params.timezone,
          buffer_minutes: params.bufferMinutes,
        },
      })
      : await this.prisma.scheduleSettings.create({
        data: {
          timezone: params.timezone,
          buffer_minutes: params.bufferMinutes,
        },
      });

    return ScheduleSettings.create({
      id: record.id,
      timezone: record.timezone,
      bufferMinutes: record.buffer_minutes,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }
}
