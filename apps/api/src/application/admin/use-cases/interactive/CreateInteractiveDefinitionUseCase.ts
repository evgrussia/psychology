import { Inject, Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveConfig, RitualConfig } from '@domain/interactive/types/InteractiveConfig';

@Injectable()
export class CreateInteractiveDefinitionUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(params: {
    type: InteractiveType;
    slug: string;
    title: string;
    topicCode?: string | null;
    config?: InteractiveConfig;
  }): Promise<{ id: string }> {
    const existing = await this.definitionRepository.findAnyByTypeAndSlug(params.type, params.slug);
    if (existing) {
      throw new ConflictException(`Interactive with slug "${params.slug}" already exists`);
    }

    if (params.type === InteractiveType.RITUAL && params.config) {
      this.validateRitualConfig(params.config as RitualConfig);
    }

    const definition = InteractiveDefinition.reconstitute({
      id: uuidv4(),
      type: params.type,
      slug: params.slug,
      title: params.title,
      topicCode: params.topicCode ?? null,
      status: InteractiveStatus.DRAFT,
      config: params.config ?? null,
      publishedAt: null,
    });

    await this.definitionRepository.create(definition);

    return { id: definition.id };
  }

  private validateRitualConfig(config: RitualConfig) {
    if (!config.why?.trim()) {
      throw new BadRequestException('Ritual config must include "why" text');
    }
    if (!config.steps?.length) {
      throw new BadRequestException('Ritual config must include at least one step');
    }
    for (const step of config.steps) {
      if (!step.id?.trim()) {
        throw new BadRequestException('Each ritual step must have an id');
      }
      if (!step.title?.trim()) {
        throw new BadRequestException('Each ritual step must have a title');
      }
      if (!step.content?.trim()) {
        throw new BadRequestException('Each ritual step must have content');
      }
    }
  }
}
