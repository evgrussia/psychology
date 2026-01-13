import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IContentItemRepository } from '../../../domain/content/repositories/IContentItemRepository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UpdateContentItemDto, ContentItemResponseDto } from '../dto/content.dto';
import { ContentStatus } from '../../../domain/content/value-objects/ContentEnums';

@Injectable()
export class UpdateContentItemUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, dto: UpdateContentItemDto, actorUserId: string): Promise<ContentItemResponseDto> {
    const contentItem = await this.contentItemRepo.findById(id);
    if (!contentItem) {
      throw new NotFoundException(`Content item with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== contentItem.slug) {
      const existing = await this.contentItemRepo.findBySlug(contentItem.contentType, dto.slug);
      if (existing) {
        throw new ConflictException(`Content with slug "${dto.slug}" and type "${contentItem.contentType}" already exists`);
      }
    }

    const { status, ...updates } = dto;
    
    contentItem.update(updates as any);

    if (status && status !== contentItem.status) {
      if (status === ContentStatus.published) {
        contentItem.publish();
      } else if (status === ContentStatus.archived) {
        contentItem.archive();
      } else {
        contentItem.update({ status } as any);
      }
    }

    await this.contentItemRepo.save(contentItem);

    // Save revision
    await this.prisma.contentRevision.create({
      data: {
        content_item_id: contentItem.id,
        title: contentItem.title,
        body_markdown: contentItem.bodyMarkdown,
        excerpt: contentItem.excerpt,
        changed_by_user_id: actorUserId,
        meta: {
          contentType: contentItem.contentType,
          timeToBenefit: contentItem.timeToBenefit,
          format: contentItem.format,
          supportLevel: contentItem.supportLevel,
          seoTitle: contentItem.seoTitle,
          seoDescription: contentItem.seoDescription,
          seoKeywords: contentItem.seoKeywords,
          canonicalUrl: contentItem.canonicalUrl,
          topicCodes: contentItem.topicCodes,
          tagIds: contentItem.tagIds,
        },
      },
    });

    return contentItem.toObject();
  }
}
