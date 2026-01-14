import { GetTopicsUseCase } from './GetTopicsUseCase';
import { ITopicRepository } from '@domain/content/repositories/ITopicRepository';
import { Topic } from '@domain/content/entities/Topic';

describe('GetTopicsUseCase', () => {
  let useCase: GetTopicsUseCase;
  let topicRepository: jest.Mocked<ITopicRepository>;

  beforeEach(() => {
    topicRepository = {
      findAllActive: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    useCase = new GetTopicsUseCase(topicRepository);
  });

  it('should return all active topics', async () => {
    const topics = [
      Topic.reconstitute({ code: 'anxiety', title: 'Anxiety', isActive: true }),
      Topic.reconstitute({ code: 'burnout', title: 'Burnout', isActive: true }),
    ];
    topicRepository.findAllActive.mockResolvedValue(topics);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].code).toBe('anxiety');
    expect(result[1].code).toBe('burnout');
    expect(topicRepository.findAllActive).toHaveBeenCalled();
  });
});
