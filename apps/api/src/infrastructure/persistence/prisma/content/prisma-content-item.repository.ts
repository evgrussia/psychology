import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IContentItemRepository } from '../../../../../domain/content/repositories/IContentItemRepository';
import { ContentItem } from '../../../../../domain/content/entities/ContentItem';
import { ContentItemMapper } from './content-item.mapper';
import { ContentType } from '../../../../../domain/content/value-objects/ContentEnums';

@Injectable()
export class PrismaContentItemRepository implements IContentItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(type: ContentType, slug: string): Promise<ContentItem | null> {
    const item = await this.prisma.contentItem.findUnique({
      where: {
        content_type_slug: {
          content_type: type,
          slug: slug,
        },
      },
      include: {
        topics: true,
        tags: true,
      },
    });

    if (!item) return null;

    return ContentItemMapper.toDomain(item);
  }

  async findById(id: string): Promise<ContentItem | null> {
    const item = await this.prisma.contentItem.findUnique({
      where: { id },
      include: {
        topics: true,
        tags: true,
      },
    });

    if (!item) return null;

    return ContentItemMapper.toDomain(item);
  }

  async findAll(filters?: { type?: ContentType; status?: ContentStatus }): Promise<ContentItem[]> {
    const items = await this.prisma.contentItem.findMany({
      where: {
        content_type: filters?.type,
        status: filters?.status,
      },
      include: {
        topics: true,
        tags: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return items.map(item => ContentItemMapper.toDomain(item));
  }

  async save(contentItem: ContentItem): Promise<void> {
    const data = ContentItemMapper.toPrisma(contentItem);
    const topicCodes = contentItem.topicCodes;
    const tagIds = contentItem.tagIds;

    await this.prisma.$transaction(async (tx) => {
      await tx.contentItem.upsert({
        where: { id: contentItem.id },
        update: data,
        create: data as any,
      });

      // Update topics
      await tx.contentItemTopic.deleteMany({
        where: { content_item_id: contentItem.id },
      });
      if (topicCodes.length > 0) {
        await tx.contentItemTopic.createMany({
          data: topicCodes.map(code => ({
            content_item_id: contentItem.id,
            topic_code: code,
          })),
        });
      }

      // Update tags
      await tx.contentItemTag.deleteMany({
        where: { content_item_id: contentItem.id },
      });
      if (tagIds.length > 0) {
        await tx.contentItemTag.createMany({
          data: tagIds.map(id => ({
            content_item_id: contentItem.id,
            tag_id: id,
          })),
        });
      }
    });
  }
}
