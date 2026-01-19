import { ContentItem } from '../entities/ContentItem';
import { ContentType, ContentStatus } from '../value-objects/ContentEnums';

export interface IContentItemRepository {
  findBySlug(type: ContentType, slug: string): Promise<ContentItem | null>;
  findById(id: string): Promise<ContentItem | null>;
  findAll(filters?: {
    type?: ContentType;
    status?: ContentStatus;
    authorUserId?: string;
    topicCode?: string;
    tagId?: string;
  }): Promise<ContentItem[]>;
  findByTopic(topicCode: string, filters?: { type?: ContentType; status?: ContentStatus }): Promise<ContentItem[]>;
  save(contentItem: ContentItem): Promise<void>;
}
