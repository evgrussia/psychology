import { GetPageBySlugUseCase } from './GetPageBySlugUseCase';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentItem } from '@domain/content/entities/ContentItem';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';
import { NotFoundException } from '@nestjs/common';

describe('GetPageBySlugUseCase', () => {
  let useCase: GetPageBySlugUseCase;
  let contentItemRepository: jest.Mocked<IContentItemRepository>;

  beforeEach(() => {
    contentItemRepository = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByTopic: jest.fn(),
      save: jest.fn(),
    } as any;
    useCase = new GetPageBySlugUseCase(contentItemRepository);
  });

  it('should return page content when page exists and is published', async () => {
    const publishedAt = new Date('2026-01-10T12:00:00Z');
    const page = ContentItem.create({
      id: 'page-1',
      contentType: ContentType.page,
      slug: 'about',
      title: 'Обо мне',
      bodyMarkdown: '# Обо мне\n\nЯ психолог...',
      status: ContentStatus.published,
      publishedAt,
      authorUserId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-10T12:00:00Z'),
    });

    contentItemRepository.findBySlug.mockResolvedValue(page);

    const result = await useCase.execute({ slug: 'about' });

    expect(contentItemRepository.findBySlug).toHaveBeenCalledWith(ContentType.page, 'about');
    expect(result).toEqual(expect.objectContaining({
      id: 'page-1',
      type: ContentType.page,
      slug: 'about',
      title: 'Обо мне',
      body_markdown: '# Обо мне\n\nЯ психолог...',
      published_at: publishedAt,
      practical_block: null,
    }));
  });

  it('should throw NotFoundException when page does not exist', async () => {
    contentItemRepository.findBySlug.mockResolvedValue(null);

    await expect(useCase.execute({ slug: 'non-existent' })).rejects.toThrow(
      NotFoundException
    );
    await expect(useCase.execute({ slug: 'non-existent' })).rejects.toThrow(
      'Page with slug "non-existent" not found'
    );

    expect(contentItemRepository.findBySlug).toHaveBeenCalledWith(ContentType.page, 'non-existent');
  });

  it('should throw NotFoundException when page is in draft status', async () => {
    const draftPage = ContentItem.create({
      id: 'page-1',
      contentType: ContentType.page,
      slug: 'about',
      title: 'Обо мне',
      bodyMarkdown: '# Обо мне\n\nЯ психолог...',
      status: ContentStatus.draft,
      authorUserId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-10T12:00:00Z'),
    });

    contentItemRepository.findBySlug.mockResolvedValue(draftPage);

    await expect(useCase.execute({ slug: 'about' })).rejects.toThrow(
      NotFoundException
    );
    await expect(useCase.execute({ slug: 'about' })).rejects.toThrow(
      'Page with slug "about" not found'
    );
  });

  it('should throw NotFoundException when page is in review status', async () => {
    const reviewPage = ContentItem.create({
      id: 'page-1',
      contentType: ContentType.page,
      slug: 'about',
      title: 'Обо мне',
      bodyMarkdown: '# Обо мне\n\nЯ психолог...',
      status: ContentStatus.review,
      authorUserId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-10T12:00:00Z'),
    });

    contentItemRepository.findBySlug.mockResolvedValue(reviewPage);

    await expect(useCase.execute({ slug: 'about' })).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw NotFoundException when page is archived', async () => {
    const archivedPage = ContentItem.create({
      id: 'page-1',
      contentType: ContentType.page,
      slug: 'about',
      title: 'Обо мне',
      bodyMarkdown: '# Обо мне\n\nЯ психолог...',
      status: ContentStatus.archived,
      publishedAt: new Date('2026-01-01T00:00:00Z'),
      authorUserId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-10T12:00:00Z'),
    });

    contentItemRepository.findBySlug.mockResolvedValue(archivedPage);

    await expect(useCase.execute({ slug: 'about' })).rejects.toThrow(
      NotFoundException
    );
  });

  it('should return page without published_at when it is not set', async () => {
    const page = ContentItem.create({
      id: 'page-1',
      contentType: ContentType.page,
      slug: 'how-it-works',
      title: 'Как проходит работа',
      bodyMarkdown: '# Как проходит работа\n\nПроцесс...',
      status: ContentStatus.published,
      authorUserId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-10T12:00:00Z'),
    });

    contentItemRepository.findBySlug.mockResolvedValue(page);

    const result = await useCase.execute({ slug: 'how-it-works' });

    expect(result).toEqual(expect.objectContaining({
      id: 'page-1',
      type: ContentType.page,
      slug: 'how-it-works',
      title: 'Как проходит работа',
      body_markdown: '# Как проходит работа\n\nПроцесс...',
      published_at: undefined,
      practical_block: null,
    }));
  });

  it('should handle different page slugs correctly', async () => {
    const page1 = ContentItem.create({
      id: 'page-1',
      contentType: ContentType.page,
      slug: 'about',
      title: 'Обо мне',
      bodyMarkdown: 'Content 1',
      status: ContentStatus.published,
      publishedAt: new Date(),
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const page2 = ContentItem.create({
      id: 'page-2',
      contentType: ContentType.page,
      slug: 'how-it-works',
      title: 'Как проходит работа',
      bodyMarkdown: 'Content 2',
      status: ContentStatus.published,
      publishedAt: new Date(),
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    contentItemRepository.findBySlug
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const result1 = await useCase.execute({ slug: 'about' });
    const result2 = await useCase.execute({ slug: 'how-it-works' });

    expect(result1.title).toBe('Обо мне');
    expect(result2.title).toBe('Как проходит работа');
    expect(contentItemRepository.findBySlug).toHaveBeenCalledTimes(2);
  });
});
