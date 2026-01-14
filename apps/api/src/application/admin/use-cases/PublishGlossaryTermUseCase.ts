import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { GlossaryTermResponseDto } from '../dto/glossary.dto';

@Injectable()
export class PublishGlossaryTermUseCase {
  constructor(
    @Inject('IGlossaryRepository')
    private readonly glossaryRepository: IGlossaryRepository,
  ) {}

  async execute(id: string): Promise<GlossaryTermResponseDto> {
    const term = await this.glossaryRepository.findById(id);
    if (!term) {
      throw new NotFoundException(`Glossary term with ID ${id} not found`);
    }

    term.publish();
    await this.glossaryRepository.save(term);

    return term.toObject() as GlossaryTermResponseDto;
  }
}
