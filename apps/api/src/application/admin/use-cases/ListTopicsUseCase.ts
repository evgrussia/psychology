import { Inject, Injectable } from '@nestjs/common';
import { ITopicRepository } from '@domain/content/repositories/ITopicRepository';

@Injectable()
export class ListTopicsUseCase {
  constructor(
    @Inject('ITopicRepository')
    private readonly topicRepo: ITopicRepository,
  ) {}

  async execute() {
    const topics = await this.topicRepo.findAll();
    return topics.map(t => t.toObject());
  }
}
