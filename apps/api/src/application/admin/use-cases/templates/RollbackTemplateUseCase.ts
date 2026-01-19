import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMessageTemplateRepository } from '@domain/notifications/repositories/IMessageTemplateRepository';
import { MessageTemplateVersionDto } from '../../dto/templates.dto';

@Injectable()
export class RollbackTemplateUseCase {
  constructor(
    @Inject('IMessageTemplateRepository')
    private readonly templateRepository: IMessageTemplateRepository,
  ) {}

  async execute(templateId: string, versionId: string, actorUserId: string): Promise<MessageTemplateVersionDto> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const sourceVersion = await this.templateRepository.findVersionById(versionId);
    if (!sourceVersion || sourceVersion.templateId !== templateId) {
      throw new BadRequestException('Version does not belong to template');
    }

    const newVersion = await this.templateRepository.createVersion({
      templateId,
      subject: sourceVersion.subject ?? null,
      bodyMarkdown: sourceVersion.bodyMarkdown,
      updatedByUserId: actorUserId,
    });

    return {
      id: newVersion.id,
      template_id: newVersion.templateId,
      version: newVersion.version,
      subject: newVersion.subject ?? null,
      body_markdown: newVersion.bodyMarkdown,
      updated_by_user_id: newVersion.updatedByUserId,
      created_at: newVersion.createdAt.toISOString(),
    };
  }
}
