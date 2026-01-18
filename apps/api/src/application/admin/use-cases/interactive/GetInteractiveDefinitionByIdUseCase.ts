import { Inject, Injectable, NotFoundException  } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';

@Injectable()
export class GetInteractiveDefinitionByIdUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository') private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(id: string) {
    const definition = await this.definitionRepository.findById(id, { includeDraft: true });
    if (!definition) {
      throw new NotFoundException(`Interactive definition with ID ${id} not found`);
    }
    return definition;
  }
}
