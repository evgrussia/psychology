import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';

@Injectable()
export class GetInteractiveDefinitionVersionUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository') private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(definitionId: string, version: number) {
    const result = await this.definitionRepository.getVersion(definitionId, version);
    if (!result) {
      throw new NotFoundException(`Interactive definition version not found: ${definitionId} v${version}`);
    }
    return result;
  }
}
