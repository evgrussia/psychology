import { GetHomepageModelUseCase } from './GetHomepageModelUseCase';
import { ITopicRepository } from '../../../domain/content/repositories/ITopicRepository';
import { IInteractiveDefinitionRepository } from '../../../domain/interactive/repositories/IInteractiveDefinitionRepository';
import { Topic } from '../../../domain/content/entities/Topic';
import { InteractiveDefinition } from '../../../domain/interactive/entities/InteractiveDefinition';
import { InteractiveType } from '../../../domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '../../../domain/interactive/value-objects/InteractiveStatus';

describe('GetHomepageModelUseCase', () => {
  let useCase: GetHomepageModelUseCase;
  let topicRepository: jest.Mocked<ITopicRepository>;
  let interactiveRepository: jest.Mocked<IInteractiveDefinitionRepository>;

  beforeEach(() => {
    topicRepository = {
      findAllActive: jest.fn(),
    };
    interactiveRepository = {
      findPublished: jest.fn(),
      findByTopic: jest.fn(),
    };
    useCase = new GetHomepageModelUseCase(topicRepository, interactiveRepository);
  });

  it('should return homepage model with topics and interactives', async () => {
    const topics = [
      Topic.reconstitute({ code: 'anxiety', title: 'Anxiety', isActive: true }),
    ];
    const interactives = [
      InteractiveDefinition.reconstitute({
        id: '1',
        type: InteractiveType.QUIZ,
        slug: 'anxiety-quiz',
        title: 'Anxiety Quiz',
        topicCode: 'anxiety',
        status: InteractiveStatus.PUBLISHED,
        publishedAt: new Date(),
      }),
    ];

    topicRepository.findAllActive.mockResolvedValue(topics);
    interactiveRepository.findPublished.mockResolvedValue(interactives);

    const result = await useCase.execute({ locale: 'ru' });

    expect(result.topics).toHaveLength(1);
    expect(result.topics[0].code).toBe('anxiety');
    expect(result.featured_interactives).toHaveLength(1);
    expect(result.featured_interactives[0].slug).toBe('anxiety-quiz');
    expect(result.trust_blocks).toHaveLength(3);
  });
});
