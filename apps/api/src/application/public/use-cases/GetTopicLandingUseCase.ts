import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITopicRepository } from '@domain/content/repositories/ITopicRepository';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { TopicLandingDto } from '../dto/topics.dto';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

@Injectable()
export class GetTopicLandingUseCase {
  constructor(
    @Inject('ITopicRepository')
    private readonly topicRepository: ITopicRepository,
    @Inject('IContentItemRepository')
    private readonly contentItemRepository: IContentItemRepository,
    @Inject('IInteractiveDefinitionRepository')
    private readonly interactiveRepository: IInteractiveDefinitionRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
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

    // 4. Get related services
    const relatedServices = await this.serviceRepository.findByTopic(topic.code, ServiceStatus.published);

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
      relatedServices: relatedServices.map(service => ({
        id: service.id,
        slug: service.slug,
        title: service.title,
        format: service.format,
        duration_minutes: service.durationMinutes,
        price_amount: service.priceAmount,
      })),
    };
  }
}
