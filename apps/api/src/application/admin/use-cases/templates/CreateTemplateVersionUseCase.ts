import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IMessageTemplateRepository } from '@domain/notifications/repositories/IMessageTemplateRepository';
import { CreateTemplateVersionRequestDto, MessageTemplateVersionDto } from '../../dto/templates.dto';

@Injectable()
export class CreateTemplateVersionUseCase {
  constructor(
    @Inject('IMessageTemplateRepository')
    private readonly templateRepository: IMessageTemplateRepository,
  ) {}

  async execute(
    templateId: string,
    dto: CreateTemplateVersionRequestDto,
    actorUserId: string,
  ): Promise<MessageTemplateVersionDto> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (!dto.body_markdown?.trim()) {
      throw new BadRequestException('Template body is required');
    }

    const version = await this.templateRepository.createVersion({
      templateId,
      subject: dto.subject ?? null,
      bodyMarkdown: dto.body_markdown,
      updatedByUserId: actorUserId,
    });

    return {
      id: version.id,
      template_id: version.templateId,
      version: version.version,
      subject: version.subject ?? null,
      body_markdown: version.bodyMarkdown,
      updated_by_user_id: version.updatedByUserId,
      created_at: version.createdAt.toISOString(),
    };
  }
}
