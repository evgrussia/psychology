import { Injectable, Inject } from '@nestjs/common';
import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../audit/dto/audit-log.dto';

export interface UpdateSystemSettingsDto {
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
}

@Injectable()
export class UpdateSystemSettingsUseCase {
  constructor(
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(dto: UpdateSystemSettingsDto, actorUserId: string, actorRole: string): Promise<void> {
    // This would typically update a settings table or a config file
    // For now we'll just log the action
    
    // Mocking current values
    const currentSettings = {
      maintenanceMode: false,
      registrationEnabled: true,
    };

    // Log to audit log
    try {
      await this.auditLogHelper.logAction(
        actorUserId,
        actorRole,
        AuditLogAction.ADMIN_SETTINGS_CHANGED,
        'SystemSettings',
        'global',
        currentSettings,
        { ...currentSettings, ...dto }
      );
    } catch (error) {
      console.error('Failed to log settings change to audit log:', error);
    }
  }
}
