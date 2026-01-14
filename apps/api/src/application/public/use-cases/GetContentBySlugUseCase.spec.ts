import { GetContentBySlugUseCase } from './GetContentBySlugUseCase';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentItem } from '@domain/content/entities/ContentItem';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';
import { NotFoundException } from '@nestjs/common';

describe('GetContentBySlugUseCase', () => {
  let useCase: GetContentBySlugUseCase;
  let repository: jest.Mocked<IContentItemRepository>;

  beforeEach(() => {
    repository = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByTopic: jest.fn(),
      save: jest.fn(),
    };
    useCase = new GetContentBySlugUseCase(repository);
  });

  it('should return published content by slug', async () => {
    const contentItem = ContentItem.create({
      id: 'content-1',
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: '# Hello',
      status: ContentStatus.published,
      authorUserId: 'user-1',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findBySlug.mockResolvedValue(contentItem);

    const result = await useCase.execute({
      type: ContentType.article,
      slug: 'test-article',
    });

    expect(result.id).toBe('content-1');
    expect(result.type).toBe(ContentType.article);
    expect(result.slug).toBe('test-article');
    expect(result.title).toBe('Test Article');
  });

  it('should throw NotFoundException if content not found', async () => {
    repository.findBySlug.mockResolvedValue(null);

    await expect(
      useCase.execute({
        type: ContentType.article,
        slug: 'non-existent',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if content is not published', async () => {
    const contentItem = ContentItem.create({
      id: 'content-1',
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: '# Hello',
      status: ContentStatus.draft,
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findBySlug.mockResolvedValue(contentItem);

    await expect(
      useCase.execute({
        type: ContentType.article,
        slug: 'test-article',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
