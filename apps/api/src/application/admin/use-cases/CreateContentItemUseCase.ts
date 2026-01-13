import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { IContentItemRepository } from '../../../domain/content/repositories/IContentItemRepository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ContentItem } from '../../../domain/content/entities/ContentItem';
import { CreateContentItemDto, ContentItemResponseDto } from '../dto/content.dto';
import { ContentStatus } from '../../../domain/content/value-objects/ContentEnums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateContentItemUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateContentItemDto, authorUserId: string): Promise<ContentItemResponseDto> {
    const existing = await this.contentItemRepo.findBySlug(dto.contentType, dto.slug);
    if (existing) {
      throw new ConflictException(`Content with slug "${dto.slug}" and type "${dto.contentType}" already exists`);
    }

    const now = new Date();
    const contentItem = ContentItem.create({
      id: uuidv4(),
      contentType: dto.contentType,
      slug: dto.slug,
      title: dto.title,
      excerpt: dto.excerpt,
      bodyMarkdown: dto.bodyMarkdown,
      status: ContentStatus.draft,
      authorUserId,
      timeToBenefit: dto.timeToBenefit,
      format: dto.format,
      supportLevel: dto.supportLevel,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      seoKeywords: dto.seoKeywords,
      canonicalUrl: dto.canonicalUrl,
      topicCodes: dto.topicCodes,
      tagIds: dto.tagIds,
      createdAt: now,
      updatedAt: now,
    });

    await this.contentItemRepo.save(contentItem);

    // Save revision after successful save
    await this.prisma.contentRevision.create({
      data: {
        content_item_id: contentItem.id,
        title: contentItem.title,
        body_markdown: contentItem.bodyMarkdown,
        excerpt: contentItem.excerpt,
        changed_by_user_id: authorUserId,
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
