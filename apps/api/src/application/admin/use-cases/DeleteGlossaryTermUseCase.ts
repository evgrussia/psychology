import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '@application/audit/dto/audit-log.dto';

export interface DeleteGlossaryTermAuditContext {
  actorUserId: string | null;
  actorRole: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class DeleteGlossaryTermUseCase {
  constructor(
    @Inject('IGlossaryRepository')
    private readonly glossaryRepository: IGlossaryRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(id: string, audit: DeleteGlossaryTermAuditContext): Promise<void> {
    const term = await this.glossaryRepository.findById(id);
    if (!term) {
      throw new NotFoundException(`Glossary term with ID ${id} not found`);
    }

    await this.glossaryRepository.delete(id);

    try {
      await this.auditLogHelper.logAction(
        audit.actorUserId,
        audit.actorRole ?? 'unknown',
        AuditLogAction.ADMIN_CONTENT_DELETED,
        'GlossaryTerm',
        id,
        {
          status: term.status,
          slug: term.slug,
        },
        null,
        audit.ipAddress ?? null,
        audit.userAgent ?? null,
      );
    } catch (error) {
      // best-effort logging
    }
  }
}
