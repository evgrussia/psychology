import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Injectable()
export class ListAdminEventsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const items = await this.prisma.event.findMany({
      orderBy: { starts_at: 'asc' },
    });
    return items.map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      status: event.status,
      starts_at: event.starts_at.toISOString(),
      ends_at: event.ends_at ? event.ends_at.toISOString() : null,
      format: event.format,
      location_text: event.location_text,
      capacity: event.capacity,
      registration_open: event.registration_open,
      published_at: event.published_at ? event.published_at.toISOString() : null,
      updated_at: event.updated_at.toISOString(),
    }));
  }
}

