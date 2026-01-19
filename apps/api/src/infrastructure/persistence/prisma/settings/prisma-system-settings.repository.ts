import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ISystemSettingsRepository } from '@domain/settings/repositories/ISystemSettingsRepository';
import { SystemSettings } from '@domain/settings/entities/SystemSettings';
import { SystemSettingsMapper } from './system-settings.mapper';

@Injectable()
export class PrismaSystemSettingsRepository implements ISystemSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SystemSettings | null> {
    const record = await this.prisma.systemSettings.findFirst({
      orderBy: { created_at: 'desc' },
    });
    return record ? SystemSettingsMapper.toDomain(record) : null;
  }

  async upsert(data: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    googleCalendarSyncMode: string;
  }): Promise<SystemSettings> {
    const existing = await this.prisma.systemSettings.findFirst({
      orderBy: { created_at: 'desc' },
    });

    const record = existing
      ? await this.prisma.systemSettings.update({
          where: { id: existing.id },
          data: {
            maintenance_mode: data.maintenanceMode,
            registration_enabled: data.registrationEnabled,
            google_calendar_sync_mode: data.googleCalendarSyncMode,
          },
        })
      : await this.prisma.systemSettings.create({
          data: {
            maintenance_mode: data.maintenanceMode,
            registration_enabled: data.registrationEnabled,
            google_calendar_sync_mode: data.googleCalendarSyncMode,
          },
        });

    return SystemSettingsMapper.toDomain(record);
  }
}
