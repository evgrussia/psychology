import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMessageTemplateRepository } from '@domain/notifications/repositories/IMessageTemplateRepository';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '@application/audit/dto/audit-log.dto';
import { MessageTemplateDetailDto } from '../../dto/templates.dto';

@Injectable()
export class ActivateTemplateUseCase {
  constructor(
    @Inject('IMessageTemplateRepository')
    private readonly templateRepository: IMessageTemplateRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(
    templateId: string,
    versionId: string | null,
    actorUserId: string | null,
    actorRole: string,
  ): Promise<MessageTemplateDetailDto> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    let activatedAt: Date | null = null;
    if (versionId) {
      const version = await this.templateRepository.findVersionById(versionId);
      if (!version || version.templateId !== templateId) {
        throw new BadRequestException('Version does not belong to template');
      }
      activatedAt = new Date();
    }

    const oldValue = {
      active_version_id: template.activeVersionId ?? null,
      status: template.status,
      activated_at: template.activatedAt ?? null,
    };

    const updated = await this.templateRepository.setActiveVersion({
      templateId,
      versionId: versionId ?? null,
      status: versionId ? 'active' : 'draft',
      activatedAt,
    });

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      AuditLogAction.ADMIN_TEMPLATE_ACTIVATED,
      'MessageTemplate',
      templateId,
      oldValue,
      {
        active_version_id: updated.activeVersionId ?? null,
        status: updated.status,
        activated_at: updated.activatedAt ?? null,
      },
    );

    const versions = await this.templateRepository.listVersions(templateId);
    return {
      id: updated.id,
      channel: updated.channel,
      category: updated.category,
      name: updated.name,
      status: updated.status,
      language: updated.language,
      active_version_id: updated.activeVersionId ?? null,
      activated_at: updated.activatedAt ? updated.activatedAt.toISOString() : null,
      created_at: updated.createdAt.toISOString(),
      versions: versions.map((version) => ({
        id: version.id,
        template_id: version.templateId,
        version: version.version,
        subject: version.subject ?? null,
        body_markdown: version.bodyMarkdown,
        updated_by_user_id: version.updatedByUserId,
        created_at: version.createdAt.toISOString(),
      })),
    };
  }
}
