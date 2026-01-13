import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { MediaAssetResponseDto } from '../dto/media-asset.dto';
import { MediaType } from '@domain/media/value-objects/MediaType';

@Injectable()
export class ListMediaAssetsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<MediaAssetResponseDto[]> {
    const assets = await this.prisma.mediaAsset.findMany({
      orderBy: { created_at: 'desc' },
    });

    return assets.map((asset) => ({
      id: asset.id,
      publicUrl: asset.public_url,
      mediaType: asset.media_type as unknown as MediaType,
      mimeType: asset.mime_type,
      sizeBytes: asset.size_bytes.toString(),
      title: asset.title || undefined,
      altText: asset.alt_text || undefined,
      createdAt: asset.created_at.toISOString(),
    }));
  }
}
