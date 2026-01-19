import { Inject, Injectable } from '@nestjs/common';
import { IMessageTemplateRepository } from '@domain/notifications/repositories/IMessageTemplateRepository';
import { ListTemplatesRequestDto, MessageTemplateListItemDto } from '../../dto/templates.dto';

@Injectable()
export class ListTemplatesUseCase {
  constructor(
    @Inject('IMessageTemplateRepository')
    private readonly templateRepository: IMessageTemplateRepository,
  ) {}

  async execute(filters?: ListTemplatesRequestDto): Promise<MessageTemplateListItemDto[]> {
    const templates = await this.templateRepository.list(filters);
    return templates.map((template) => ({
      id: template.id,
      channel: template.channel,
      category: template.category,
      name: template.name,
      status: template.status,
      language: template.language,
      active_version_id: template.activeVersionId ?? null,
      activated_at: template.activatedAt ? template.activatedAt.toISOString() : null,
      created_at: template.createdAt.toISOString(),
    }));
  }
}
