import { 
  GlossaryTerm as PrismaGlossaryTerm,
  GlossaryTermSynonym as PrismaGlossaryTermSynonym,
  GlossaryTermLink as PrismaGlossaryTermLink
} from '@prisma/client';
import { GlossaryTerm } from '@domain/content/entities/GlossaryTerm';
import { 
  GlossaryTermCategory, 
  ContentStatus 
} from '@domain/content/value-objects/ContentEnums';

type PrismaGlossaryTermWithRelations = PrismaGlossaryTerm & {
  synonyms?: PrismaGlossaryTermSynonym[];
  links?: PrismaGlossaryTermLink[];
};

export class GlossaryMapper {
  static toDomain(prismaTerm: PrismaGlossaryTermWithRelations): GlossaryTerm {
    return GlossaryTerm.create({
      id: prismaTerm.id,
      slug: prismaTerm.slug,
      title: prismaTerm.title,
      category: prismaTerm.category as GlossaryTermCategory,
      shortDefinition: prismaTerm.short_definition,
      bodyMarkdown: prismaTerm.body_markdown,
      metaDescription: prismaTerm.meta_description ?? undefined,
      keywords: prismaTerm.keywords ?? undefined,
      status: prismaTerm.status as ContentStatus,
      publishedAt: prismaTerm.published_at ?? undefined,
      synonyms: prismaTerm.synonyms?.map(s => s.synonym) || [],
      relatedContentIds: prismaTerm.links?.map(l => l.content_item_id) || [],
    });
  }

  static toPrisma(domainTerm: GlossaryTerm): Partial<PrismaGlossaryTerm> {
    const obj = domainTerm.toObject();
    return {
      id: obj.id,
      slug: obj.slug,
      title: obj.title,
      category: obj.category,
      short_definition: obj.shortDefinition,
      body_markdown: obj.bodyMarkdown,
      meta_description: obj.metaDescription ?? null,
      keywords: obj.keywords ?? null,
      status: obj.status,
      published_at: obj.publishedAt ?? null,
    };
  }
}
