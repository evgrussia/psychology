import { 
  ContentItem as PrismaContentItem,
  ContentItemTopic,
  ContentItemTag
} from '@prisma/client';
import { ContentItem } from '@domain/content/entities/ContentItem';
import { 
  ContentType, 
  ContentStatus, 
  TimeToBenefit, 
  ContentFormat, 
  SupportLevel 
} from '@domain/content/value-objects/ContentEnums';

type PrismaContentItemWithRelations = PrismaContentItem & {
  topics?: ContentItemTopic[];
  tags?: ContentItemTag[];
};

export class ContentItemMapper {
  static toDomain(prismaItem: PrismaContentItemWithRelations): ContentItem {
    return ContentItem.create({
      id: prismaItem.id,
      contentType: prismaItem.content_type as ContentType,
      slug: prismaItem.slug,
      title: prismaItem.title,
      excerpt: prismaItem.excerpt ?? undefined,
      bodyMarkdown: prismaItem.body_markdown,
      status: prismaItem.status as ContentStatus,
      publishedAt: prismaItem.published_at ?? undefined,
      authorUserId: prismaItem.author_user_id,
      timeToBenefit: (prismaItem.time_to_benefit as TimeToBenefit) ?? undefined,
      format: (prismaItem.format as ContentFormat) ?? undefined,
      supportLevel: (prismaItem.support_level as SupportLevel) ?? undefined,
      seoTitle: prismaItem.seo_title ?? undefined,
      seoDescription: prismaItem.seo_description ?? undefined,
      seoKeywords: prismaItem.seo_keywords ?? undefined,
      canonicalUrl: prismaItem.canonical_url ?? undefined,
      topicCodes: prismaItem.topics?.map(t => t.topic_code) || [],
      tagIds: prismaItem.tags?.map(t => t.tag_id) || [],
      createdAt: prismaItem.created_at,
      updatedAt: prismaItem.updated_at,
    });
  }

  static toPrisma(domainItem: ContentItem): Partial<PrismaContentItem> {
    const obj = domainItem.toObject();
    return {
      id: obj.id,
      content_type: obj.contentType,
      slug: obj.slug,
      title: obj.title,
      excerpt: obj.excerpt ?? null,
      body_markdown: obj.bodyMarkdown,
      status: obj.status,
      published_at: obj.publishedAt ?? null,
      author_user_id: obj.authorUserId,
      time_to_benefit: obj.timeToBenefit ?? null,
      format: obj.format ?? null,
      support_level: obj.supportLevel ?? null,
      seo_title: obj.seoTitle ?? null,
      seo_description: obj.seoDescription ?? null,
      seo_keywords: obj.seoKeywords ?? null,
      canonical_url: obj.canonicalUrl ?? null,
      created_at: obj.createdAt,
      updated_at: obj.updatedAt,
    };
  }
}
