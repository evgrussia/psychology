import { Test, TestingModule } from '@nestjs/testing';
import { UpsertGlossaryTermUseCase } from './UpsertGlossaryTermUseCase';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { GlossaryTerm } from '@domain/content/entities/GlossaryTerm';
import { ContentStatus, GlossaryTermCategory } from '@domain/content/value-objects/ContentEnums';

describe('UpsertGlossaryTermUseCase', () => {
  let useCase: UpsertGlossaryTermUseCase;
  let glossaryRepository: jest.Mocked<IGlossaryRepository>;

  beforeEach(async () => {
    const mockGlossaryRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertGlossaryTermUseCase,
        {
          provide: 'IGlossaryRepository',
          useValue: mockGlossaryRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpsertGlossaryTermUseCase>(UpsertGlossaryTermUseCase);
    glossaryRepository = module.get('IGlossaryRepository');
  });

  it('should create new glossary term', async () => {
    const dto = {
      slug: 'new-term',
      title: 'New Term',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'New definition',
      bodyMarkdown: '# New content',
      metaDescription: 'New meta description',
      keywords: 'new, keyword',
      status: ContentStatus.draft,
      synonyms: ['synonym1'],
      relatedContentIds: [],
    };

    glossaryRepository.findById.mockResolvedValue(null);
    glossaryRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(result).toMatchObject({
      slug: 'new-term',
      title: 'New Term',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'New definition',
      bodyMarkdown: '# New content',
      metaDescription: 'New meta description',
      keywords: 'new, keyword',
      status: ContentStatus.draft,
      synonyms: ['synonym1'],
      relatedContentIds: [],
    });
    expect(glossaryRepository.save).toHaveBeenCalled();
  });

  it('should update existing glossary term', async () => {
    const existingTerm = GlossaryTerm.create({
      id: 'term-1',
      slug: 'existing-term',
      title: 'Existing Term',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'Old definition',
      bodyMarkdown: '# Old content',
      status: ContentStatus.draft,
      synonyms: [],
      relatedContentIds: [],
    });

    const dto = {
      id: 'term-1',
      slug: 'updated-term',
      title: 'Updated Term',
      category: GlossaryTermCategory.state,
      shortDefinition: 'Updated definition',
      bodyMarkdown: '# Updated content',
      metaDescription: 'Updated meta description',
      keywords: 'updated, keyword',
      status: ContentStatus.published,
      synonyms: ['synonym1', 'synonym2'],
      relatedContentIds: ['content-1'],
    };

    glossaryRepository.findById.mockResolvedValue(existingTerm);
    glossaryRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(result).toMatchObject({
      slug: 'updated-term',
      title: 'Updated Term',
      category: GlossaryTermCategory.state,
      shortDefinition: 'Updated definition',
      bodyMarkdown: '# Updated content',
      metaDescription: 'Updated meta description',
      keywords: 'updated, keyword',
      status: ContentStatus.published,
      synonyms: ['synonym1', 'synonym2'],
      relatedContentIds: ['content-1'],
    });
    expect(glossaryRepository.save).toHaveBeenCalled();
  });

  it('should use default status if not provided', async () => {
    const dto = {
      slug: 'new-term',
      title: 'New Term',
      category: GlossaryTermCategory.concept,
      shortDefinition: 'New definition',
      bodyMarkdown: '# New content',
    };

    glossaryRepository.findById.mockResolvedValue(null);
    glossaryRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(result.status).toBe(ContentStatus.draft);
  });
});
