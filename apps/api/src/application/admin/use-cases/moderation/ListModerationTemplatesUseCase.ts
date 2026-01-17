import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ModerationTemplateDto } from '../../dto/moderation.dto';

@Injectable()
export class ListModerationTemplatesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<ModerationTemplateDto[]> {
    const templates = await this.prisma.messageTemplate.findMany({
      where: { category: 'moderation' },
      orderBy: { name: 'asc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            updated_by: {
              select: {
                id: true,
                email: true,
                display_name: true,
              },
            },
          },
        },
      },
    });

    return templates.map((template) => {
      const version = template.versions[0];
      return {
        id: template.id,
        name: template.name,
        channel: template.channel,
        status: template.status,
        latestVersion: version
          ? {
              id: version.id,
              version: version.version,
              subject: version.subject ?? null,
              bodyMarkdown: version.body_markdown,
              updatedBy: version.updated_by
                ? {
                    id: version.updated_by.id,
                    email: version.updated_by.email,
                    displayName: version.updated_by.display_name,
                  }
                : null,
              createdAt: version.created_at,
            }
          : null,
      };
    });
  }
}
