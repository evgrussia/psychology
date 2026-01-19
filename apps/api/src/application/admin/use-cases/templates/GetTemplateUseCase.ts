import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMessageTemplateRepository } from '@domain/notifications/repositories/IMessageTemplateRepository';
import { MessageTemplateDetailDto, MessageTemplateVersionDto } from '../../dto/templates.dto';

@Injectable()
export class GetTemplateUseCase {
  constructor(
    @Inject('IMessageTemplateRepository')
    private readonly templateRepository: IMessageTemplateRepository,
  ) {}

  async execute(templateId: string): Promise<MessageTemplateDetailDto> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const versions = await this.templateRepository.listVersions(templateId);
    const versionDtos: MessageTemplateVersionDto[] = versions.map((version) => ({
      id: version.id,
      template_id: version.templateId,
      version: version.version,
      subject: version.subject ?? null,
      body_markdown: version.bodyMarkdown,
      updated_by_user_id: version.updatedByUserId,
      created_at: version.createdAt.toISOString(),
    }));

    return {
      id: template.id,
      channel: template.channel,
      category: template.category,
      name: template.name,
      status: template.status,
      language: template.language,
      active_version_id: template.activeVersionId ?? null,
      activated_at: template.activatedAt ? template.activatedAt.toISOString() : null,
      created_at: template.createdAt.toISOString(),
      versions: versionDtos,
    };
  }
}
