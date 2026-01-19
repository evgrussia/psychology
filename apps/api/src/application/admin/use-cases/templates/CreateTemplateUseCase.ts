import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IMessageTemplateRepository } from '@domain/notifications/repositories/IMessageTemplateRepository';
import { CreateTemplateRequestDto, MessageTemplateDetailDto, MessageTemplateVersionDto } from '../../dto/templates.dto';

@Injectable()
export class CreateTemplateUseCase {
  constructor(
    @Inject('IMessageTemplateRepository')
    private readonly templateRepository: IMessageTemplateRepository,
  ) {}

  async execute(dto: CreateTemplateRequestDto, actorUserId: string): Promise<MessageTemplateDetailDto> {
    if (!dto.body_markdown?.trim()) {
      throw new BadRequestException('Template body is required');
    }

    const template = await this.templateRepository.createTemplate({
      channel: dto.channel,
      category: dto.category,
      name: dto.name,
      language: dto.language ?? 'ru',
    });

    const version = await this.templateRepository.createVersion({
      templateId: template.id,
      subject: dto.subject ?? null,
      bodyMarkdown: dto.body_markdown,
      updatedByUserId: actorUserId,
    });

    const versionDto: MessageTemplateVersionDto = {
      id: version.id,
      template_id: version.templateId,
      version: version.version,
      subject: version.subject ?? null,
      body_markdown: version.bodyMarkdown,
      updated_by_user_id: version.updatedByUserId,
      created_at: version.createdAt.toISOString(),
    };

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
      versions: [versionDto],
    };
  }
}
