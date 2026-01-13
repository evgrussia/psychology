import { CreateContentItemUseCase } from './CreateContentItemUseCase';
import { IContentItemRepository } from '../../../domain/content/repositories/IContentItemRepository';
import { ContentType, ContentStatus } from '../../../domain/content/value-objects/ContentEnums';
import { ConflictException } from '@nestjs/common';

describe('CreateContentItemUseCase', () => {
  let useCase: CreateContentItemUseCase;
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
    useCase = new CreateContentItemUseCase(repository, prisma);
  });

  it('should create a new content item', async () => {
    const dto = {
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: '# Hello',
    };
    const authorId = 'user-1';
    repository.findBySlug.mockResolvedValue(null);

    const result = await useCase.execute(dto, authorId);

    expect(result.slug).toBe(dto.slug);
    expect(result.status).toBe(ContentStatus.draft);
    expect(repository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if slug already exists', async () => {
    const dto = {
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: '# Hello',
    };
    repository.findBySlug.mockResolvedValue({} as any);

    await expect(useCase.execute(dto, 'user-1')).rejects.toThrow(ConflictException);
  });

  it('should save a revision when creating content', async () => {
    const dto = {
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: '# Hello',
    };
    const authorId = 'user-1';
    repository.findBySlug.mockResolvedValue(null);

    await useCase.execute(dto, authorId);

    expect(prisma.contentRevision.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: dto.title,
        body_markdown: dto.bodyMarkdown,
        changed_by_user_id: authorId,
      }),
    }));
  });
});
