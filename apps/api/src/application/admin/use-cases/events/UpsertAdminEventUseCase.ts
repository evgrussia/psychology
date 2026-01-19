import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import * as crypto from 'crypto';

export interface UpsertAdminEventDto {
  slug: string;
  title: string;
  description_markdown: string;
  starts_at: string;
  ends_at?: string | null;
  format: 'online' | 'offline' | 'hybrid';
  location_text?: string | null;
  status?: 'draft' | 'published' | 'archived';
  capacity?: number | null;
  registration_open?: boolean;
}

@Injectable()
export class UpsertAdminEventUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: UpsertAdminEventDto) {
    const startsAt = this.parseDate(dto.starts_at, 'starts_at');
    const endsAt = dto.ends_at ? this.parseDate(dto.ends_at, 'ends_at') : null;
    if (!dto.slug?.trim()) throw new BadRequestException('slug is required');
    if (!dto.title?.trim()) throw new BadRequestException('title is required');
    if (!dto.description_markdown?.trim()) throw new BadRequestException('description_markdown is required');

    const event = await this.prisma.event.create({
      data: {
        id: crypto.randomUUID(),
        slug: dto.slug.trim(),
        title: dto.title.trim(),
        description_markdown: dto.description_markdown,
        starts_at: startsAt,
        ends_at: endsAt,
        format: dto.format,
        location_text: dto.location_text ?? null,
        status: dto.status ?? 'draft',
        capacity: dto.capacity ?? null,
        registration_open: dto.registration_open ?? true,
        published_at: dto.status === 'published' ? new Date() : null,
      },
    });

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      status: event.status,
      starts_at: event.starts_at.toISOString(),
    };
  }

  async update(id: string, dto: UpsertAdminEventDto) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');

    const startsAt = this.parseDate(dto.starts_at, 'starts_at');
    const endsAt = dto.ends_at ? this.parseDate(dto.ends_at, 'ends_at') : null;

    const status = dto.status ?? existing.status;
    const publishedAt = status === 'published' && !existing.published_at ? new Date() : existing.published_at;

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        slug: dto.slug.trim(),
        title: dto.title.trim(),
        description_markdown: dto.description_markdown,
        starts_at: startsAt,
        ends_at: endsAt,
        format: dto.format,
        location_text: dto.location_text ?? null,
        status,
        capacity: dto.capacity ?? null,
        registration_open: dto.registration_open ?? existing.registration_open,
        published_at: publishedAt,
      },
    });

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      status: event.status,
      starts_at: event.starts_at.toISOString(),
    };
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date for ${field}`);
    }
    return date;
  }
}

