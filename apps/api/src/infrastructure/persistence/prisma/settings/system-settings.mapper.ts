import { SystemSettings } from '@domain/settings/entities/SystemSettings';
import { SystemSettings as PrismaSystemSettings } from '@prisma/client';

export class SystemSettingsMapper {
  static toDomain(record: PrismaSystemSettings): SystemSettings {
    return SystemSettings.create({
      id: record.id,
      maintenanceMode: record.maintenance_mode,
      registrationEnabled: record.registration_enabled,
      googleCalendarSyncMode: record.google_calendar_sync_mode,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }
}
