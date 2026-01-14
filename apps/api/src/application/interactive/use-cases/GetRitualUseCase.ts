import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { IMediaAssetRepository } from '@domain/media/repositories/IMediaAssetRepository';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { RitualDto } from '../dto/ritual.dto';
import { RitualConfig } from '@domain/interactive/types/InteractiveConfig';

@Injectable()
export class GetRitualUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly repository: IInteractiveDefinitionRepository,
    @Inject('IMediaAssetRepository')
    private readonly mediaRepository: IMediaAssetRepository,
  ) {}

  async execute(slug: string): Promise<RitualDto> {
    const ritual = await this.repository.findByTypeAndSlug(InteractiveType.RITUAL, slug);

    if (!ritual) {
      throw new NotFoundException(`Ritual with slug ${slug} not found`);
    }

    const config = ritual.config as RitualConfig;
    let audioUrl: string | undefined;

    // Load audio URL if audioMediaAssetId is present
    if (config?.audioMediaAssetId) {
      try {
        const mediaAsset = await this.mediaRepository.findById(config.audioMediaAssetId);
        if (mediaAsset) {
          audioUrl = mediaAsset.publicUrl;
        }
      } catch (error) {
        // If audio asset not found, continue without audio (graceful degradation)
        console.warn(`Audio asset ${config.audioMediaAssetId} not found for ritual ${slug}`);
      }
    }

    return {
      id: ritual.id,
      slug: ritual.slug,
      title: ritual.title,
      topicCode: ritual.topicCode,
      status: ritual.status,
      config: {
        ...config,
        audioUrl, // Add audioUrl to config
      } as RitualConfig & { audioUrl?: string },
      publishedAt: ritual.publishedAt,
    };
  }
}
