import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PublishGlossaryTermUseCase } from './PublishGlossaryTermUseCase';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { GlossaryTerm } from '@domain/content/entities/GlossaryTerm';
import { ContentStatus, GlossaryTermCategory } from '@domain/content/value-objects/ContentEnums';

describe('PublishGlossaryTermUseCase', () => {
  let useCase: PublishGlossaryTermUseCase;
  let glossaryRepository: jest.Mocked<IGlossaryRepository>;

  beforeEach(async () => {
    const mockGlossaryRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishGlossaryTermUseCase,
        {
          provide: 'IGlossaryRepository',
          useValue: mockGlossaryRepository,
        },
      ],
    }).compile();

    useCase = module.get<PublishGlossaryTermUseCase>(PublishGlossaryTermUseCase);
    glossaryRepository = module.get('IGlossaryRepository');
  });

  it('should publish glossary term', async () => {
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

    glossaryRepository.findById.mockResolvedValue(term);
    glossaryRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute('term-1');

    expect(result.status).toBe(ContentStatus.published);
    expect(result.publishedAt).toBeDefined();
    expect(glossaryRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if term not found', async () => {
    glossaryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);
  });
});
