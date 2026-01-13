import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ITagRepository } from '../../../../../domain/content/repositories/ITagRepository';
import { Tag } from '../../../../../domain/content/entities/Tag';
import { TagMapper } from './tag.mapper';

@Injectable()
export class PrismaTagRepository implements ITagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
    });
    if (!tag) return null;
    return TagMapper.toDomain(tag);
  }

  async findById(id: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) return null;
    return TagMapper.toDomain(tag);
  }

  async findAll(): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      orderBy: { title: 'asc' },
    });
    return tags.map(tag => TagMapper.toDomain(tag));
  }

  async save(tag: Tag): Promise<void> {
    const data = TagMapper.toPrisma(tag);
    await this.prisma.tag.upsert({
      where: { id: tag.id },
      update: data,
      create: data,
    });
  }
}
