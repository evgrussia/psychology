import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Injectable()
export class ListPublicEventsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const items = await this.prisma.event.findMany({
      where: { status: 'published' },
      orderBy: { starts_at: 'asc' },
    });

    return items.map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      description_markdown: event.description_markdown,
      starts_at: event.starts_at.toISOString(),
      ends_at: event.ends_at ? event.ends_at.toISOString() : null,
      format: event.format,
      location_text: event.location_text,
      capacity: event.capacity,
      registration_open: event.registration_open,
    }));
  }
}

