import { Injectable, Inject } from '@nestjs/common';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { GlossaryTermResponseDto } from '../dto/glossary.dto';
import { ContentStatus, GlossaryTermCategory } from '@domain/content/value-objects/ContentEnums';

@Injectable()
export class ListGlossaryTermsUseCase {
  constructor(
    @Inject('IGlossaryRepository')
    private readonly glossaryRepository: IGlossaryRepository,
  ) {}

  async execute(filters?: { 
    status?: ContentStatus; 
    category?: GlossaryTermCategory;
    search?: string;
  }): Promise<GlossaryTermResponseDto[]> {
    const terms = await this.glossaryRepository.findAll(filters);
    return terms.map(term => term.toObject() as GlossaryTermResponseDto);
  }
}
