import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IGlossaryRepository } from '@domain/content/repositories/IGlossaryRepository';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { PublicGlossaryTermResponseDto } from '../dto/glossary.dto';
import { ContentStatus } from '@domain/content/value-objects/ContentEnums';

@Injectable()
export class GetPublicGlossaryTermUseCase {
  constructor(
    @Inject('IGlossaryRepository')
    private readonly glossaryRepository: IGlossaryRepository,
    @Inject('IContentItemRepository')
    private readonly contentItemRepository: IContentItemRepository,
  ) {}

  async execute(slug: string): Promise<PublicGlossaryTermResponseDto> {
    const term = await this.glossaryRepository.findBySlug(slug);
    
    if (!term || term.status !== ContentStatus.published) {
      throw new NotFoundException(`Glossary term with slug ${slug} not found`);
    }

    const relatedItems = await Promise.all(
      term.relatedContentIds.map(id => this.contentItemRepository.findById(id))
    );

    const relatedContent = relatedItems
      .filter(item => item !== null && item.status === ContentStatus.published)
      .map(item => ({
        id: item!.id,
        title: item!.title,
        slug: item!.slug,
        contentType: item!.contentType,
      }));

    return {
      slug: term.slug,
      title: term.title,
      category: term.category,
      shortDefinition: term.shortDefinition,
      bodyMarkdown: term.bodyMarkdown,
      metaDescription: term.metaDescription,
      keywords: term.keywords,
      synonyms: term.synonyms,
      relatedContent,
    };
  }
}
