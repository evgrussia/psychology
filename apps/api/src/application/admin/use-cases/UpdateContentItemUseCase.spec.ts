import { UpdateContentItemUseCase } from './UpdateContentItemUseCase';
import { IContentItemRepository } from '../../../domain/content/repositories/IContentItemRepository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ContentItem } from '../../../domain/content/entities/ContentItem';
import { ContentType, ContentStatus } from '../../../domain/content/value-objects/ContentEnums';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UpdateContentItemUseCase', () => {
  let useCase: UpdateContentItemUseCase;
  let repository: jest.Mocked<IContentItemRepository>;
  let prisma: any;

  beforeEach(() => {
    repository = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    prisma = {
      contentRevision: {
        create: jest.fn(),
      },
    };
    useCase = new UpdateContentItemUseCase(repository, prisma);
  });

  it('should update content item', async () => {
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

    repository.findById.mockResolvedValue(contentItem);
    repository.findBySlug.mockResolvedValue(null);

    const result = await useCase.execute('content-1', {
      title: 'Updated Title',
      bodyMarkdown: '# Updated',
    }, 'user-1');

    expect(result.title).toBe('Updated Title');
    expect(result.bodyMarkdown).toBe('# Updated');
    expect(repository.save).toHaveBeenCalled();
    expect(prisma.contentRevision.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException if content item not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', { title: 'New Title' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if new slug already exists', async () => {
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

    const existingItem = ContentItem.create({
      id: 'content-2',
      contentType: ContentType.article,
      slug: 'existing-slug',
      title: 'Existing',
      bodyMarkdown: '# Existing',
      status: ContentStatus.draft,
      authorUserId: 'user-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findById.mockResolvedValue(contentItem);
    repository.findBySlug.mockResolvedValue(existingItem);

    await expect(
      useCase.execute('content-1', { slug: 'existing-slug' }, 'user-1'),
    ).rejects.toThrow(ConflictException);
  });

  it('should publish content when status changes to published', async () => {
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

    repository.findById.mockResolvedValue(contentItem);
    repository.findBySlug.mockResolvedValue(null);

    const result = await useCase.execute('content-1', {
      status: ContentStatus.published,
    }, 'user-1');

    expect(result.status).toBe(ContentStatus.published);
    expect(result.publishedAt).toBeDefined();
  });

  it('should archive content when status changes to archived', async () => {
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
    repository.findBySlug.mockResolvedValue(null);

    const result = await useCase.execute('content-1', {
      status: ContentStatus.archived,
    }, 'user-1');

    expect(result.status).toBe(ContentStatus.archived);
  });

  it('should create revision on update', async () => {
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

    repository.findById.mockResolvedValue(contentItem);
    repository.findBySlug.mockResolvedValue(null);

    await useCase.execute('content-1', {
      title: 'Updated Title',
    }, 'user-2');

    expect(prisma.contentRevision.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content_item_id: 'content-1',
          title: 'Updated Title',
          changed_by_user_id: 'user-2',
        }),
      }),
    );
  });
});
