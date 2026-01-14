import { Injectable, Inject } from '@nestjs/common';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { PublicGlossaryListItemDto } from '../dto/glossary.dto';
import { ContentStatus, GlossaryTermCategory } from '@domain/content/value-objects/ContentEnums';

@Injectable()
export class ListPublicGlossaryTermsUseCase {
  constructor(
    @Inject('IGlossaryRepository')
    private readonly glossaryRepository: IGlossaryRepository,
  ) {}

  async execute(filters?: { 
    category?: GlossaryTermCategory;
    search?: string;
  }): Promise<PublicGlossaryListItemDto[]> {
    const terms = await this.glossaryRepository.findAll({
      ...filters,
      status: ContentStatus.published,
    });

    return terms.map(term => ({
      slug: term.slug,
      title: term.title,
      category: term.category,
      shortDefinition: term.shortDefinition,
    }));
  }
}
