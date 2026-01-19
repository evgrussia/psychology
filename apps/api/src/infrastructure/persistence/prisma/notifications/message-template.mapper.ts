import { MessageTemplate } from '@domain/notifications/entities/MessageTemplate';
import { MessageTemplateVersion } from '@domain/notifications/entities/MessageTemplateVersion';
import { MessageTemplate as PrismaMessageTemplate, MessageTemplateVersion as PrismaMessageTemplateVersion } from '@prisma/client';

export class MessageTemplateMapper {
  static toDomain(record: PrismaMessageTemplate): MessageTemplate {
    return MessageTemplate.create({
      id: record.id,
      channel: record.channel,
      category: record.category,
      name: record.name,
      status: record.status,
      language: record.language,
      activeVersionId: record.active_version_id,
      activatedAt: record.activated_at,
      createdAt: record.created_at,
    });
  }

  static versionToDomain(record: PrismaMessageTemplateVersion): MessageTemplateVersion {
    return MessageTemplateVersion.create({
      id: record.id,
      templateId: record.template_id,
      version: record.version,
      subject: record.subject,
      bodyMarkdown: record.body_markdown,
      updatedByUserId: record.updated_by_user_id,
      createdAt: record.created_at,
    });
  }
}
