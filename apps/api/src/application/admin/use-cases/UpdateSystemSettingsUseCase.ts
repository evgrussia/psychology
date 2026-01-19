import { Injectable, Inject } from '@nestjs/common';
import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../audit/dto/audit-log.dto';
import { ISystemSettingsRepository } from '@domain/settings/repositories/ISystemSettingsRepository';

export interface UpdateSystemSettingsDto {
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
}

@Injectable()
export class UpdateSystemSettingsUseCase {
  constructor(
    @Inject('ISystemSettingsRepository')
    private readonly settingsRepository: ISystemSettingsRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(dto: UpdateSystemSettingsDto, actorUserId: string, actorRole: string) {
    const current = await this.settingsRepository.get();
    const currentSettings = {
      maintenanceMode: current?.maintenanceMode ?? false,
      registrationEnabled: current?.registrationEnabled ?? true,
    };

    const updated = await this.settingsRepository.upsert({
      maintenanceMode: dto.maintenanceMode ?? currentSettings.maintenanceMode,
      registrationEnabled: dto.registrationEnabled ?? currentSettings.registrationEnabled,
    });

    try {
      await this.auditLogHelper.logAction(
        actorUserId,
        actorRole,
        AuditLogAction.ADMIN_SETTINGS_CHANGED,
        'SystemSettings',
        'global',
        currentSettings,
        {
          maintenanceMode: updated.maintenanceMode,
          registrationEnabled: updated.registrationEnabled,
        },
      );
    } catch (error) {
      console.error('Failed to log settings change to audit log:', error);
    }

    return {
      maintenanceMode: updated.maintenanceMode,
      registrationEnabled: updated.registrationEnabled,
    };
  }
}
