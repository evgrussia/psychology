import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';

@Injectable()
export class DeleteGlossaryTermUseCase {
  constructor(
    @Inject('IGlossaryRepository')
    private readonly glossaryRepository: IGlossaryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const term = await this.glossaryRepository.findById(id);
    if (!term) {
      throw new NotFoundException(`Glossary term with ID ${id} not found`);
    }

    await this.glossaryRepository.delete(id);
  }
}
