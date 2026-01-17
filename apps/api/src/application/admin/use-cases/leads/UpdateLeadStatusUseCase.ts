import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILeadRepository } from '@domain/crm/repositories/ILeadRepository';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';

@Injectable()
export class UpdateLeadStatusUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(
    leadId: string,
    nextStatus: string,
    actorUserId: string,
    actorRole: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<void> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const previousStatus = lead.status;
    if (previousStatus === nextStatus) {
      return;
    }

    await this.leadRepository.updateStatus(leadId, nextStatus);

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      'admin_lead_status_changed',
      'lead',
      leadId,
      { status: previousStatus },
      { status: nextStatus },
      ipAddress ?? null,
      userAgent ?? null,
    );
  }
}
