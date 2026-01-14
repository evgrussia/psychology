import { ListContentItemsUseCase } from './ListContentItemsUseCase';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentItem } from '@domain/content/entities/ContentItem';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';

describe('ListContentItemsUseCase', () => {
  let useCase: ListContentItemsUseCase;
  let repository: jest.Mocked<IContentItemRepository>;

  beforeEach(() => {
    repository = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByTopic: jest.fn(),
      save: jest.fn(),
    };
    useCase = new ListContentItemsUseCase(repository);
  });

  it('should return only published content by default', async () => {
    const publishedItem = ContentItem.create({
      id: 'content-1',
      contentType: ContentType.article,
      slug: 'published-article',
      title: 'Published Article',
      bodyMarkdown: '# Hello',
      status: ContentStatus.published,
      authorUserId: 'user-1',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const draftItem = ContentItem.create({
      id: 'content-2',
      contentType: ContentType.article,
      slug: 'draft-article',
      title: 'Draft Article',
      bodyMarkdown: '# Draft',
      status: ContentStatus.draft,
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findAll.mockResolvedValue([publishedItem, draftItem]);

    const result = await useCase.execute({
      type: ContentType.article,
    });

    expect(repository.findAll).toHaveBeenCalledWith({
      type: ContentType.article,
      status: ContentStatus.published,
    });
    expect(result.items.length).toBe(2);
  });

  it('should apply pagination', async () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      ContentItem.create({
        id: `content-${i}`,
        contentType: ContentType.article,
        slug: `article-${i}`,
        title: `Article ${i}`,
        bodyMarkdown: '# Hello',
        status: ContentStatus.published,
        authorUserId: 'user-1',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    repository.findAll.mockResolvedValue(items);

    const result = await useCase.execute({
      type: ContentType.article,
      limit: 5,
      offset: 2,
    });

    expect(result.items.length).toBe(5);
    expect(result.total).toBe(10);
    expect(result.items[0].slug).toBe('article-2');
  });

  it('should filter by content type', async () => {
    const article = ContentItem.create({
      id: 'content-1',
      contentType: ContentType.article,
      slug: 'article',
      title: 'Article',
      bodyMarkdown: '# Hello',
      status: ContentStatus.published,
      authorUserId: 'user-1',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const resource = ContentItem.create({
      id: 'content-2',
      contentType: ContentType.resource,
      slug: 'resource',
      title: 'Resource',
      bodyMarkdown: '# Resource',
      status: ContentStatus.published,
      authorUserId: 'user-1',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findAll.mockResolvedValue([article, resource]);

    const result = await useCase.execute({
      type: ContentType.article,
    });

    expect(repository.findAll).toHaveBeenCalledWith({
      type: ContentType.article,
      status: ContentStatus.published,
    });
  });
});
