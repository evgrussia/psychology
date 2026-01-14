import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { GlossaryTerm } from '@domain/content/entities/GlossaryTerm';
import { GlossaryMapper } from './glossary.mapper';
import { ContentStatus, GlossaryTermCategory } from '@domain/content/value-objects/ContentEnums';

@Injectable()
export class PrismaGlossaryRepository implements IGlossaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<GlossaryTerm | null> {
    const term = await this.prisma.glossaryTerm.findUnique({
      where: { slug },
      include: { synonyms: true, links: true },
    });

    if (!term) return null;

    return GlossaryMapper.toDomain(term);
  }

  async findById(id: string): Promise<GlossaryTerm | null> {
    const term = await this.prisma.glossaryTerm.findUnique({
      where: { id },
      include: { synonyms: true, links: true },
    });

    if (!term) return null;

    return GlossaryMapper.toDomain(term);
  }

  async findAll(filters?: { 
    status?: ContentStatus; 
    category?: GlossaryTermCategory;
    search?: string;
  }): Promise<GlossaryTerm[]> {
    const terms = await this.prisma.glossaryTerm.findMany({
      where: {
        status: filters?.status,
        category: filters?.category,
        OR: filters?.search ? [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { short_definition: { contains: filters.search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: { synonyms: true, links: true },
      orderBy: { title: 'asc' },
    });

    return terms.map(term => GlossaryMapper.toDomain(term));
  }

  async save(term: GlossaryTerm): Promise<void> {
    const data = GlossaryMapper.toPrisma(term);
    const synonyms = term.synonyms;
    const relatedContentIds = term.relatedContentIds;

    await this.prisma.$transaction(async (tx) => {
      await tx.glossaryTerm.upsert({
        where: { id: term.id },
        update: data,
        create: data as any,
      });

      // Update synonyms
      await tx.glossaryTermSynonym.deleteMany({
        where: { term_id: term.id },
      });
      if (synonyms.length > 0) {
        await tx.glossaryTermSynonym.createMany({
          data: synonyms.map(s => ({
            term_id: term.id,
            synonym: s,
          })),
        });
      }

      // Update links to related content
      await tx.glossaryTermLink.deleteMany({
        where: { term_id: term.id },
      });
      if (relatedContentIds.length > 0) {
        await tx.glossaryTermLink.createMany({
          data: relatedContentIds.map(contentId => ({
            term_id: term.id,
            content_item_id: contentId,
            link_type: 'manual', // or any other type if needed
          })),
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.glossaryTermSynonym.deleteMany({
        where: { term_id: id },
      });
      await tx.glossaryTermLink.deleteMany({
        where: { term_id: id },
      });
      await tx.glossaryTerm.delete({
        where: { id },
      });
    });
  }
}
