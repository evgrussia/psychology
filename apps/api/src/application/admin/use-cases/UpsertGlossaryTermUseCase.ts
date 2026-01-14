import { Injectable, Inject } from '@nestjs/common';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { UpsertGlossaryTermDto, GlossaryTermResponseDto } from '../dto/glossary.dto';
import { GlossaryTerm } from '@domain/content/entities/GlossaryTerm';
import { ContentStatus } from '@domain/content/value-objects/ContentEnums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UpsertGlossaryTermUseCase {
  constructor(
    @Inject('IGlossaryRepository')
    private readonly glossaryRepository: IGlossaryRepository,
  ) {}

  async execute(dto: UpsertGlossaryTermDto): Promise<GlossaryTermResponseDto> {
    let term: GlossaryTerm | null = null;

    if (dto.id) {
      term = await this.glossaryRepository.findById(dto.id);
    }

    if (term) {
      term.update({
        slug: dto.slug,
        title: dto.title,
        category: dto.category,
        shortDefinition: dto.shortDefinition,
        bodyMarkdown: dto.bodyMarkdown,
        metaDescription: dto.metaDescription,
        keywords: dto.keywords,
        status: dto.status,
        synonyms: dto.synonyms,
        relatedContentIds: dto.relatedContentIds,
      });
    } else {
      term = GlossaryTerm.create({
        id: dto.id || uuidv4(),
        slug: dto.slug,
        title: dto.title,
        category: dto.category,
        shortDefinition: dto.shortDefinition,
        bodyMarkdown: dto.bodyMarkdown,
        metaDescription: dto.metaDescription,
        keywords: dto.keywords,
        status: dto.status || ContentStatus.draft,
        synonyms: dto.synonyms,
        relatedContentIds: dto.relatedContentIds,
      });
    }

    await this.glossaryRepository.save(term);
    return term.toObject() as GlossaryTermResponseDto;
  }
}
