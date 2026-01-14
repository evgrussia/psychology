import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';

@Injectable()
export class GetInteractiveDefinitionUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(type: InteractiveType, slug: string): Promise<InteractiveDefinition> {
    const definition = await this.definitionRepository.findByTypeAndSlug(type, slug);

    if (!definition) {
      throw new NotFoundException(`Interactive definition of type ${type} with slug ${slug} not found or not published`);
    }

    return definition;
  }
}
