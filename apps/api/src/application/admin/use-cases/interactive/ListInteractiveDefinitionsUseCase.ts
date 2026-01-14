import { Inject, Injectable  } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';

@Injectable()
export class ListInteractiveDefinitionsUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository') private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(filters?: { type?: InteractiveType; status?: InteractiveStatus }) {
    return await this.definitionRepository.findAll(filters);
  }
}
