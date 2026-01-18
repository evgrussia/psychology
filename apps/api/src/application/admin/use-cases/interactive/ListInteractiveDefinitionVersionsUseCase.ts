import { Inject, Injectable } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';

@Injectable()
export class ListInteractiveDefinitionVersionsUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository') private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(definitionId: string) {
    return await this.definitionRepository.listVersions(definitionId);
  }
}
