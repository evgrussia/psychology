import { GetTopicLandingUseCase } from './GetTopicLandingUseCase';
import { ITopicRepository } from '@domain/content/repositories/ITopicRepository';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { Topic } from '@domain/content/entities/Topic';
import { ContentItem } from '@domain/content/entities/ContentItem';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';
import { NotFoundException } from '@nestjs/common';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';

describe('GetTopicLandingUseCase', () => {
  let useCase: GetTopicLandingUseCase;
  let topicRepository: jest.Mocked<ITopicRepository>;
  let contentRepository: jest.Mocked<IContentItemRepository>;
  let interactiveRepository: jest.Mocked<IInteractiveDefinitionRepository>;

  beforeEach(() => {
    topicRepository = {
      findByCode: jest.fn(),
      findAllActive: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    contentRepository = {
      findByTopic: jest.fn(),
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    interactiveRepository = {
      findByTopic: jest.fn(),
      findById: jest.fn(),
      findPublished: jest.fn(),
      findByTypeAndSlug: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    } as any;
    useCase = new GetTopicLandingUseCase(
      topicRepository,
      contentRepository,
      interactiveRepository,
    );
  });

  it('should return topic landing data', async () => {
    const topic = Topic.reconstitute({ code: 'anxiety', title: 'Anxiety', isActive: true });
    topicRepository.findByCode.mockResolvedValue(topic);

    const landing = ContentItem.create({
      id: 'landing-1',
      contentType: ContentType.landing,
      slug: 'anxiety-landing',
      title: 'How to handle anxiety',
      bodyMarkdown: 'Some text',
      status: ContentStatus.published,
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      topicCodes: ['anxiety'],
    });

    const relatedItem = ContentItem.create({
      id: 'article-1',
      contentType: ContentType.article,
      slug: 'anxiety-article',
      title: 'Anxiety Article',
      bodyMarkdown: 'Some text',
      status: ContentStatus.published,
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      topicCodes: ['anxiety'],
    });

    contentRepository.findByTopic.mockImplementation(async (code, filters) => {
      if (filters?.type === ContentType.landing) return [landing];
      return [landing, relatedItem];
    });

    const interactive = new InteractiveDefinition(
      'int-1',
      InteractiveType.QUIZ,
      'anxiety-quiz',
      'Anxiety Quiz',
      'anxiety',
      InteractiveStatus.PUBLISHED,
      null,
      new Date(),
    );
    interactiveRepository.findByTopic.mockResolvedValue([interactive]);

    const result = await useCase.execute({ topicSlug: 'anxiety' });

    expect(result.topic.code).toBe('anxiety');
    expect(result.landing?.id).toBe('landing-1');
    expect(result.relatedContent).toHaveLength(1);
    expect(result.relatedContent[0].id).toBe('article-1');
    expect(result.relatedInteractives).toHaveLength(1);
    expect(result.relatedInteractives[0].id).toBe('int-1');
  });

  it('should throw NotFoundException if topic not found', async () => {
    topicRepository.findByCode.mockResolvedValue(null);

    await expect(useCase.execute({ topicSlug: 'unknown' }))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if topic is inactive', async () => {
    const topic = Topic.reconstitute({ code: 'inactive', title: 'Inactive', isActive: false });
    topicRepository.findByCode.mockResolvedValue(topic);

    await expect(useCase.execute({ topicSlug: 'inactive' }))
      .rejects.toThrow(NotFoundException);
  });
});
