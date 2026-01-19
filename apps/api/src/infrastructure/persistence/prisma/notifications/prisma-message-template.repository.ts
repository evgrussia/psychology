import { Injectable } from '@nestjs/common';
import { Prisma, MessageChannel, MessageCategory, ContentStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { IMessageTemplateRepository, MessageTemplateListFilters } from '@domain/notifications/repositories/IMessageTemplateRepository';
import { MessageTemplate } from '@domain/notifications/entities/MessageTemplate';
import { MessageTemplateVersion } from '@domain/notifications/entities/MessageTemplateVersion';
import { MessageTemplateMapper } from './message-template.mapper';

@Injectable()
export class PrismaMessageTemplateRepository implements IMessageTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters?: MessageTemplateListFilters): Promise<MessageTemplate[]> {
    const where: Prisma.MessageTemplateWhereInput = {};
    if (filters?.channel) {
      where.channel = filters.channel as MessageChannel;
    }
    if (filters?.category) {
      where.category = filters.category as MessageCategory;
    }
    if (filters?.status) {
      where.status = filters.status as ContentStatus;
    }
    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const records = await this.prisma.messageTemplate.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return records.map(MessageTemplateMapper.toDomain);
  }

  async findById(id: string): Promise<MessageTemplate | null> {
    const record = await this.prisma.messageTemplate.findUnique({ where: { id } });
    return record ? MessageTemplateMapper.toDomain(record) : null;
  }

  async listVersions(templateId: string): Promise<MessageTemplateVersion[]> {
    const records = await this.prisma.messageTemplateVersion.findMany({
      where: { template_id: templateId },
      orderBy: { version: 'desc' },
    });
    return records.map(MessageTemplateMapper.versionToDomain);
  }

  async findVersionById(versionId: string): Promise<MessageTemplateVersion | null> {
    const record = await this.prisma.messageTemplateVersion.findUnique({ where: { id: versionId } });
    return record ? MessageTemplateMapper.versionToDomain(record) : null;
  }

  async createTemplate(data: {
    channel: string;
    category: string;
    name: string;
    language: string;
  }): Promise<MessageTemplate> {
    const record = await this.prisma.messageTemplate.create({
      data: {
        channel: data.channel as MessageChannel,
        category: data.category as MessageCategory,
        name: data.name,
        language: data.language,
        status: 'draft',
      },
    });
    return MessageTemplateMapper.toDomain(record);
  }

  async createVersion(data: {
    templateId: string;
    subject?: string | null;
    bodyMarkdown: string;
    updatedByUserId: string;
  }): Promise<MessageTemplateVersion> {
    const { templateId } = data;
    const record = await this.prisma.$transaction(async (tx) => {
      const maxVersion = await tx.messageTemplateVersion.aggregate({
        where: { template_id: templateId },
        _max: { version: true },
      });
      const version = (maxVersion._max.version ?? 0) + 1;
      return tx.messageTemplateVersion.create({
        data: {
          template_id: templateId,
          version,
          subject: data.subject ?? null,
          body_markdown: data.bodyMarkdown,
          updated_by_user_id: data.updatedByUserId,
        },
      });
    });
    return MessageTemplateMapper.versionToDomain(record);
  }

  async setActiveVersion(data: {
    templateId: string;
    versionId: string | null;
    status: string;
    activatedAt: Date | null;
  }): Promise<MessageTemplate> {
    const record = await this.prisma.messageTemplate.update({
      where: { id: data.templateId },
      data: {
        active_version_id: data.versionId,
        status: data.status as ContentStatus,
        activated_at: data.activatedAt,
      },
    });
    return MessageTemplateMapper.toDomain(record);
  }
}
