import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILeadRepository } from '@domain/crm/repositories/ILeadRepository';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';

@Injectable()
export class AddLeadNoteUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(
    leadId: string,
    text: string,
    actorUserId: string,
    actorRole: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ) {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const encrypted = this.encryptionService.encrypt(text);
    const note = await this.leadRepository.addNote(leadId, actorUserId, encrypted);

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      'admin_lead_note_added',
      'lead_note',
      note.id,
      null,
      { lead_id: leadId },
      ipAddress ?? null,
      userAgent ?? null,
    );

    return {
      id: note.id,
      leadId: note.leadId,
      authorUserId: note.authorUserId,
      text,
      createdAt: note.createdAt,
      author: note.author ?? null,
    };
  }
}
