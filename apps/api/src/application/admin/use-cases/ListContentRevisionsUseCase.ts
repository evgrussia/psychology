import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface ContentRevisionResponseDto {
  id: string;
  contentItemId: string;
  title: string;
  bodyMarkdown: string;
  excerpt?: string;
  meta: any;
  changedByUserId: string;
  createdAt: Date;
}

@Injectable()
export class ListContentRevisionsUseCase {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(contentItemId: string): Promise<ContentRevisionResponseDto[]> {
    const revisions = await this.prisma.contentRevision.findMany({
      where: { content_item_id: contentItemId },
      orderBy: { created_at: 'desc' },
    });

    return revisions.map(r => ({
      id: r.id,
      contentItemId: r.content_item_id,
      title: r.title,
      bodyMarkdown: r.body_markdown,
      excerpt: r.excerpt ?? undefined,
      meta: r.meta,
      changedByUserId: r.changed_by_user_id,
      createdAt: r.created_at,
    }));
  }
}
