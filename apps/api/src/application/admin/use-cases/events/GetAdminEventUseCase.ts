import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Injectable()
export class GetAdminEventUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description_markdown: event.description_markdown,
      starts_at: event.starts_at.toISOString(),
      ends_at: event.ends_at ? event.ends_at.toISOString() : null,
      format: event.format,
      location_text: event.location_text,
      status: event.status,
      capacity: event.capacity,
      registration_open: event.registration_open,
      published_at: event.published_at ? event.published_at.toISOString() : null,
    };
  }
}

