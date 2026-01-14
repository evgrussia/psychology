import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITopicRepository } from '@domain/content/repositories/ITopicRepository';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { TopicLandingDto } from '../dto/topics.dto';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';

@Injectable()
export class GetTopicLandingUseCase {
  constructor(
    @Inject('ITopicRepository')
    private readonly topicRepository: ITopicRepository,
    @Inject('IContentItemRepository')
    private readonly contentItemRepository: IContentItemRepository,
    @Inject('IInteractiveDefinitionRepository')
    private readonly interactiveRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(params: { topicSlug: string }): Promise<TopicLandingDto> {
    const topic = await this.topicRepository.findByCode(params.topicSlug);
    if (!topic || !topic.isActive) {
      throw new NotFoundException(`Topic with slug ${params.topicSlug} not found`);
    }

    // 1. Get landing page for this topic
    const landings = await this.contentItemRepository.findByTopic(topic.code, {
      type: ContentType.landing,
      status: ContentStatus.published,
    });
    const landing = landings[0]; // Take the first landing if multiple exist

    // 2. Get related content (articles, resources)
    const relatedContent = await this.contentItemRepository.findByTopic(topic.code, {
      status: ContentStatus.published,
    });
    // Filter out the landing itself and limit to 4 items
    const filteredContent = relatedContent
      .filter(item => item.contentType !== ContentType.landing)
      .slice(0, 4);

    // 3. Get related interactives
    const relatedInteractives = await this.interactiveRepository.findByTopic(topic.code);

    return {
      topic: {
        code: topic.code,
        title: topic.title,
        isActive: topic.isActive,
      },
      landing: landing ? landing.toObject() : undefined,
      relatedContent: filteredContent.map(item => item.toObject()),
      relatedInteractives: relatedInteractives.map(interactive => ({
        id: interactive.id,
        slug: interactive.slug,
        title: interactive.title,
        type: interactive.type,
      })),
      relatedServices: [], // Planned for later
    };
  }
}
