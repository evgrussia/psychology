import { ArchiveContentItemUseCase } from './ArchiveContentItemUseCase';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentItem } from '@domain/content/entities/ContentItem';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';
import { NotFoundException } from '@nestjs/common';

describe('ArchiveContentItemUseCase', () => {
  let useCase: ArchiveContentItemUseCase;
  let repository: jest.Mocked<IContentItemRepository>;

  beforeEach(() => {
    repository = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByTopic: jest.fn(),
      save: jest.fn(),
    };
    useCase = new ArchiveContentItemUseCase(repository);
  });

  it('should archive content item', async () => {
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

    repository.findById.mockResolvedValue(contentItem);

    const result = await useCase.execute('content-1');

    expect(result.status).toBe(ContentStatus.archived);
    expect(repository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if content item not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);
  });
});
