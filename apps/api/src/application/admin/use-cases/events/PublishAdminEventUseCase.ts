import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Injectable()
export class PublishAdminEventUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        status: 'published',
        published_at: existing.published_at ?? new Date(),
      },
    });
    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      status: event.status,
      published_at: event.published_at?.toISOString() ?? null,
    };
  }
}

