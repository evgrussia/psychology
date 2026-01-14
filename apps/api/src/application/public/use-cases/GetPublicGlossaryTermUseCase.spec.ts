import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPublicGlossaryTermUseCase } from './GetPublicGlossaryTermUseCase';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { GlossaryTerm } from '@domain/content/entities/GlossaryTerm';
import { ContentStatus, GlossaryTermCategory } from '@domain/content/value-objects/ContentEnums';

describe('GetPublicGlossaryTermUseCase', () => {
  let useCase: GetPublicGlossaryTermUseCase;
  let glossaryRepository: jest.Mocked<IGlossaryRepository>;
  let contentItemRepository: jest.Mocked<IContentItemRepository>;

  beforeEach(async () => {
    const mockGlossaryRepository = {
      findBySlug: jest.fn(),
    };

    const mockContentItemRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPublicGlossaryTermUseCase,
        {
          provide: 'IGlossaryRepository',
          useValue: mockGlossaryRepository,
        },
        {
          provide: 'IContentItemRepository',
          useValue: mockContentItemRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetPublicGlossaryTermUseCase>(GetPublicGlossaryTermUseCase);
    glossaryRepository = module.get('IGlossaryRepository');
    contentItemRepository = module.get('IContentItemRepository');
  });

  it('should return glossary term with related content', async () => {
    const term = GlossaryTerm.create({
      id: 'term-1',
      slug: 'test-term',
      title: 'Test Term',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'Test definition',
      bodyMarkdown: '# Test content',
      metaDescription: 'Test meta description',
      keywords: 'test, keyword',
      status: ContentStatus.published,
      publishedAt: new Date(),
      synonyms: ['synonym1'],
      relatedContentIds: ['content-1'],
    });

    const relatedContent = {
      id: 'content-1',
      title: 'Related Article',
      slug: 'related-article',
      contentType: 'article',
      status: ContentStatus.published,
    };

    glossaryRepository.findBySlug.mockResolvedValue(term);
    contentItemRepository.findById.mockResolvedValue(relatedContent as any);

    const result = await useCase.execute('test-term');

    expect(result).toEqual({
      slug: 'test-term',
      title: 'Test Term',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'Test definition',
      bodyMarkdown: '# Test content',
      metaDescription: 'Test meta description',
      keywords: 'test, keyword',
      synonyms: ['synonym1'],
      relatedContent: [
        {
          id: 'content-1',
          title: 'Related Article',
          slug: 'related-article',
          contentType: 'article',
        },
      ],
    });
  });

  it('should throw NotFoundException if term not found', async () => {
    glossaryRepository.findBySlug.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if term is not published', async () => {
    const term = GlossaryTerm.create({
      id: 'term-1',
      slug: 'test-term',
      title: 'Test Term',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'Test definition',
      bodyMarkdown: '# Test content',
      status: ContentStatus.draft,
      synonyms: [],
      relatedContentIds: [],
    });

    glossaryRepository.findBySlug.mockResolvedValue(term);

    await expect(useCase.execute('test-term')).rejects.toThrow(NotFoundException);
  });

  it('should filter out unpublished related content', async () => {
    const term = GlossaryTerm.create({
      id: 'term-1',
      slug: 'test-term',
      title: 'Test Term',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'Test definition',
      bodyMarkdown: '# Test content',
      status: ContentStatus.published,
      publishedAt: new Date(),
      synonyms: [],
      relatedContentIds: ['content-1', 'content-2'],
    });

    const publishedContent = {
      id: 'content-1',
      title: 'Published Article',
      slug: 'published-article',
      contentType: 'article',
      status: ContentStatus.published,
    };

    const draftContent = {
      id: 'content-2',
      title: 'Draft Article',
      slug: 'draft-article',
      contentType: 'article',
      status: ContentStatus.draft,
    };

    glossaryRepository.findBySlug.mockResolvedValue(term);
    contentItemRepository.findById
      .mockResolvedValueOnce(publishedContent as any)
      .mockResolvedValueOnce(draftContent as any);

    const result = await useCase.execute('test-term');

    expect(result.relatedContent).toHaveLength(1);
    expect(result.relatedContent[0].id).toBe('content-1');
  });
});
