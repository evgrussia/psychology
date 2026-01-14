import { Injectable, Inject } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { RitualDto, ListRitualsResponse } from '../dto/ritual.dto';
import { RitualConfig } from '@domain/interactive/types/InteractiveConfig';

@Injectable()
export class ListRitualsUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly repository: IInteractiveDefinitionRepository,
  ) {}

  async execute(query: { topicCode?: string }): Promise<ListRitualsResponse> {
    const definitions = await this.repository.findPublished();
    
    const rituals = definitions
      .filter(d => d.type === InteractiveType.RITUAL)
      .filter(d => !query.topicCode || d.topicCode === query.topicCode)
      .map(d => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        topicCode: d.topicCode,
        status: d.status,
        config: d.config as RitualConfig,
        publishedAt: d.publishedAt,
      }));

    return {
      items: rituals,
      total: rituals.length,
    };
  }
}
