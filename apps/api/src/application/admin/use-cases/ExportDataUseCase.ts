import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../audit/dto/audit-log.dto';

export enum ExportType {
  LEADS = 'leads',
  APPOINTMENTS = 'appointments',
  AUDIT_LOG = 'audit_log',
}

export interface ExportDataDto {
  type: ExportType;
  format: 'csv' | 'json';
}

@Injectable()
export class ExportDataUseCase {
  constructor(
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(dto: ExportDataDto, actorUserId: string, actorRole: string): Promise<{ url: string }> {
    // 1. Check permissions (only owner and assistant can export)
    if (actorRole !== 'owner' && actorRole !== 'assistant') {
      throw new ForbiddenException('Only owners and assistants can export data');
    }

    // 2. Perform export (mocked for now)
    const exportUrl = `https://storage.example.com/exports/${dto.type}_${Date.now()}.${dto.format}`;

    // 3. Log to audit log (CRITICAL for FEAT-PLT-05)
    try {
      await this.auditLogHelper.logAction(
        actorUserId,
        actorRole,
        AuditLogAction.ADMIN_DATA_EXPORTED,
        'System',
        dto.type,
        null, // No old value
        {
          exportType: dto.type,
          format: dto.format,
          url: exportUrl,
        }
      );
    } catch (error) {
      // For critical actions like export, we might want to fail the operation if logging fails
      // but the spec says "best effort" for non-critical, and for export it's "желателен вместе в транзакции".
      // Since we don't have transactions for audit log yet, we just log the error.
      console.error('Failed to log data export to audit log:', error);
    }

    return { url: exportUrl };
  }
}
