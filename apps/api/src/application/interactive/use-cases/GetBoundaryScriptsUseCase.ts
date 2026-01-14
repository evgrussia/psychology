import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { BoundariesConfig } from '@domain/interactive/types/InteractiveConfig';

export interface GetBoundaryScriptsResponse {
  id: string;
  slug: string;
  title: string;
  config: BoundariesConfig;
}

@Injectable()
export class GetBoundaryScriptsUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(params: { slug: string }): Promise<GetBoundaryScriptsResponse> {
    const definition = await this.definitionRepository.findByTypeAndSlug(
      InteractiveType.BOUNDARIES,
      params.slug,
    );

    if (!definition) {
      throw new NotFoundException(`Boundary script not found: ${params.slug}`);
    }

    return {
      id: definition.id,
      slug: definition.slug,
      title: definition.title,
      config: definition.config as BoundariesConfig,
    };
  }
}
