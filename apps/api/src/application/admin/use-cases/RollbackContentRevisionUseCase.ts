import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IContentItemRepository } from '../../../domain/content/repositories/IContentItemRepository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ContentItemResponseDto } from '../dto/content.dto';

@Injectable()
export class RollbackContentRevisionUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(contentItemId: string, revisionId: string): Promise<ContentItemResponseDto> {
    const revision = await this.prisma.contentRevision.findUnique({
      where: { id: revisionId },
    });

    if (!revision || revision.content_item_id !== contentItemId) {
      throw new NotFoundException(`Revision with ID "${revisionId}" not found for content item "${contentItemId}"`);
    }

    const contentItem = await this.contentItemRepo.findById(contentItemId);
    if (!contentItem) {
      throw new NotFoundException(`Content item with ID "${contentItemId}" not found`);
    }

    const meta = revision.meta as any;

    contentItem.update({
      title: revision.title,
      bodyMarkdown: revision.body_markdown,
      excerpt: revision.excerpt ?? undefined,
      seoTitle: meta?.seoTitle,
      seoDescription: meta?.seoDescription,
      seoKeywords: meta?.seoKeywords,
      canonicalUrl: meta?.canonicalUrl,
      timeToBenefit: meta?.timeToBenefit,
      format: meta?.format,
      supportLevel: meta?.supportLevel,
    });

    await this.contentItemRepo.save(contentItem);

    return contentItem.toObject();
  }
}
