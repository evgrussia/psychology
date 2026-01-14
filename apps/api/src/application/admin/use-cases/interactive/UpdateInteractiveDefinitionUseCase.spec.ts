import { Test, TestingModule } from '@nestjs/testing';
import { UpdateInteractiveDefinitionUseCase } from './UpdateInteractiveDefinitionUseCase';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuizConfig } from '@domain/interactive/types/InteractiveConfig';
import { ResultLevel } from '@domain/interactive/value-objects/ResultLevel';
import { ValidateNavigatorDefinitionUseCase } from '../../../interactive/use-cases/ValidateNavigatorDefinitionUseCase';

describe('UpdateInteractiveDefinitionUseCase', () => {
  let useCase: UpdateInteractiveDefinitionUseCase;
  let repository: jest.Mocked<IInteractiveDefinitionRepository>;
  let validateNavigatorUseCase: jest.Mocked<ValidateNavigatorDefinitionUseCase>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findPublished: jest.fn(),
      findByTopic: jest.fn(),
      findByTypeAndSlug: jest.fn(),
    };

    const mockValidateNavigatorUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateInteractiveDefinitionUseCase,
        {
          provide: 'IInteractiveDefinitionRepository',
          useValue: mockRepository,
        },
        {
          provide: ValidateNavigatorDefinitionUseCase,
          useValue: mockValidateNavigatorUseCase,
        },
      ],
    }).compile();

    useCase = module.get<UpdateInteractiveDefinitionUseCase>(UpdateInteractiveDefinitionUseCase);
    repository = module.get<jest.Mocked<IInteractiveDefinitionRepository>>('IInteractiveDefinitionRepository');
    validateNavigatorUseCase = module.get<jest.Mocked<ValidateNavigatorDefinitionUseCase>>(ValidateNavigatorDefinitionUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('validateQuizConfig', () => {
    const mockDefinition = InteractiveDefinition.reconstitute({
      id: 'test-id',
      type: InteractiveType.QUIZ,
      slug: 'test-quiz',
      title: 'Test Quiz',
      topicCode: null,
      status: InteractiveStatus.DRAFT,
      config: null,
      publishedAt: null,
    });

    beforeEach(() => {
      repository.findById.mockResolvedValue(mockDefinition);
    });

    it('should throw error if questions are empty', async () => {
      const invalidConfig: QuizConfig = {
        questions: [],
        thresholds: [
          { level: ResultLevel.LOW, minScore: 0, maxScore: 4 },
        ],
        results: [
          { level: ResultLevel.LOW, title: 'Low', description: 'Desc', recommendations: { now: [], week: [] } },
        ],
      };

      await expect(
        useCase.execute('test-id', { config: invalidConfig })
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw error if thresholds are empty', async () => {
      const invalidConfig: QuizConfig = {
        questions: [
          { id: 'q1', text: 'Question 1', options: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }] },
        ],
        thresholds: [],
        results: [
          { level: ResultLevel.LOW, title: 'Low', description: 'Desc', recommendations: { now: [], week: [] } },
        ],
      };

      await expect(
        useCase.execute('test-id', { config: invalidConfig })
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw error if results are empty', async () => {
      const invalidConfig: QuizConfig = {
        questions: [
          { id: 'q1', text: 'Question 1', options: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }] },
        ],
        thresholds: [
          { level: ResultLevel.LOW, minScore: 0, maxScore: 4 },
        ],
        results: [],
      };

      await expect(
        useCase.execute('test-id', { config: invalidConfig })
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw error if thresholds overlap', async () => {
      const invalidConfig: QuizConfig = {
        questions: [
          { id: 'q1', text: 'Question 1', options: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }] },
        ],
        thresholds: [
          { level: ResultLevel.LOW, minScore: 0, maxScore: 5 },
          { level: ResultLevel.MODERATE, minScore: 4, maxScore: 9 }, // Overlap: 5 >= 4
        ],
        results: [
          { level: ResultLevel.LOW, title: 'Low', description: 'Desc', recommendations: { now: [], week: [] } },
          { level: ResultLevel.MODERATE, title: 'Moderate', description: 'Desc', recommendations: { now: [], week: [] } },
        ],
      };

      await expect(
        useCase.execute('test-id', { config: invalidConfig })
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should accept valid config without overlap', async () => {
      const validConfig: QuizConfig = {
        questions: [
          { id: 'q1', text: 'Question 1', options: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }] },
        ],
        thresholds: [
          { level: ResultLevel.LOW, minScore: 0, maxScore: 4 },
          { level: ResultLevel.MODERATE, minScore: 5, maxScore: 9 },
        ],
        results: [
          { level: ResultLevel.LOW, title: 'Low', description: 'Desc', recommendations: { now: [], week: [] } },
          { level: ResultLevel.MODERATE, title: 'Moderate', description: 'Desc', recommendations: { now: [], week: [] } },
        ],
      };

      repository.save.mockResolvedValue();

      await useCase.execute('test-id', { config: validConfig });

      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if definition not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
