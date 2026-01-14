import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { NavigatorConfig } from '@domain/interactive/types/InteractiveConfig';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetNavigatorDefinitionUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(params: { slug: string }): Promise<{ definition: NavigatorConfig }> {
    const definition = await this.definitionRepository.findByTypeAndSlug(
      InteractiveType.NAVIGATOR,
      params.slug,
    );

    if (!definition || !definition.config) {
      throw new NotFoundException(`Navigator definition not found: ${params.slug}`);
    }

    // Cast is safe here because we know the type is NAVIGATOR
    return { definition: definition.config as NavigatorConfig };
  }
}
