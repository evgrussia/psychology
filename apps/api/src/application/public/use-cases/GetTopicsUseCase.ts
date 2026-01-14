import { Injectable, Inject } from '@nestjs/common';
import { ITopicRepository } from '@domain/content/repositories/ITopicRepository';
import { TopicDto } from '../dto/topics.dto';

@Injectable()
export class GetTopicsUseCase {
  constructor(
    @Inject('ITopicRepository')
    private readonly topicRepository: ITopicRepository,
  ) {}

  async execute(): Promise<TopicDto[]> {
    const topics = await this.topicRepository.findAllActive();
    return topics.map(topic => ({
      code: topic.code,
      title: topic.title,
      isActive: topic.isActive,
    }));
  }
}
