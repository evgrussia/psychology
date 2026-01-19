import { ContentType, ContentStatus, TimeToBenefit, ContentFormat, SupportLevel } from '../value-objects/ContentEnums';
import { ContentItemResponseDto } from '../../../application/admin/dto/content.dto';

export interface ContentItemProps {
  id: string;
  contentType: ContentType;
  slug: string;
  title: string;
  excerpt?: string;
  bodyMarkdown: string;
  status: ContentStatus;
  publishedAt?: Date;
  authorUserId: string;
  timeToBenefit?: TimeToBenefit;
  format?: ContentFormat;
  supportLevel?: SupportLevel;
  practicalBlock?: Record<string, unknown> | null;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  topicCodes?: string[];
  tagIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class ContentItem {
  constructor(private readonly props: ContentItemProps) {}

  get id(): string { return this.props.id; }
  get contentType(): ContentType { return this.props.contentType; }
  get slug(): string { return this.props.slug; }
  get title(): string { return this.props.title; }
  get excerpt(): string | undefined { return this.props.excerpt; }
  get bodyMarkdown(): string { return this.props.bodyMarkdown; }
  get status(): ContentStatus { return this.props.status; }
  get publishedAt(): Date | undefined { return this.props.publishedAt; }
  get authorUserId(): string { return this.props.authorUserId; }
  get timeToBenefit(): TimeToBenefit | undefined { return this.props.timeToBenefit; }
  get format(): ContentFormat | undefined { return this.props.format; }
  get supportLevel(): SupportLevel | undefined { return this.props.supportLevel; }
  get practicalBlock(): Record<string, unknown> | null | undefined { return this.props.practicalBlock; }
  get seoTitle(): string | undefined { return this.props.seoTitle; }
  get seoDescription(): string | undefined { return this.props.seoDescription; }
  get seoKeywords(): string | undefined { return this.props.seoKeywords; }
  get canonicalUrl(): string | undefined { return this.props.canonicalUrl; }
  get topicCodes(): string[] { return this.props.topicCodes || []; }
  get tagIds(): string[] { return this.props.tagIds || []; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  static create(props: ContentItemProps): ContentItem {
    return new ContentItem(props);
  }

  toObject(): ContentItemResponseDto {
    return {
      ...this.props,
      topicCodes: this.props.topicCodes || [],
      tagIds: this.props.tagIds || [],
    };
  }

  update(updates: Partial<Omit<ContentItemProps, 'id' | 'createdAt' | 'updatedAt'>>): ContentItem {
    Object.assign(this.props, {
      ...updates,
      updatedAt: new Date(),
    });
    return this;
  }

  publish(): ContentItem {
    this.props.status = ContentStatus.published;
    this.props.publishedAt = new Date();
    this.props.updatedAt = new Date();
    return this;
  }

  archive(): ContentItem {
    this.props.status = ContentStatus.archived;
    this.props.updatedAt = new Date();
    return this;
  }
}
