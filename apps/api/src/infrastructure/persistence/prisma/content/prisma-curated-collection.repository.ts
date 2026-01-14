import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ICuratedCollectionRepository } from '@domain/content/repositories/ICuratedCollectionRepository';
import { CuratedCollection } from '@domain/content/entities/CuratedCollection';
import { CuratedCollectionMapper } from './curated-collection.mapper';
import { ContentStatus } from '@domain/content/value-objects/ContentEnums';

@Injectable()
export class PrismaCuratedCollectionRepository implements ICuratedCollectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CuratedCollection | null> {
    const collection = await this.prisma.curatedCollection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!collection) return null;

    return CuratedCollectionMapper.toDomain(collection);
  }

  async findBySlug(slug: string): Promise<CuratedCollection | null> {
    const collection = await this.prisma.curatedCollection.findUnique({
      where: { slug },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!collection) return null;

    return CuratedCollectionMapper.toDomain(collection);
  }

  async findAll(): Promise<CuratedCollection[]> {
    const collections = await this.prisma.curatedCollection.findMany({
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { slug: 'asc' },
    });

    return collections.map(c => CuratedCollectionMapper.toDomain(c));
  }

  async findPublished(): Promise<CuratedCollection[]> {
    const collections = await this.prisma.curatedCollection.findMany({
      where: {
        status: ContentStatus.published,
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { published_at: 'desc' },
    });

    return collections.map(c => CuratedCollectionMapper.toDomain(c));
  }

  async save(collection: CuratedCollection): Promise<void> {
    const data = CuratedCollectionMapper.toPrisma(collection);
    const items = collection.items;

    await this.prisma.$transaction(async (tx) => {
      await tx.curatedCollection.upsert({
        where: { id: collection.id },
        update: data,
        create: data as any,
      });

      // Simple strategy: delete and recreate items for reordering simplicity in MVP
      // For larger collections, a more surgical update would be better
      await tx.curatedItem.deleteMany({
        where: { collection_id: collection.id },
      });

      if (items.length > 0) {
        await tx.curatedItem.createMany({
          data: items.map(item => CuratedCollectionMapper.itemToPrisma(item) as any),
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.curatedItem.deleteMany({
        where: { collection_id: id },
      });
      await tx.curatedCollection.delete({
        where: { id },
      });
    });
  }
}
