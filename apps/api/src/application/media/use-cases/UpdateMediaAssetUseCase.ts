import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { MediaAssetResponseDto, UpdateMediaDto } from '../dto/media-asset.dto';
import { MediaType } from '@domain/media/value-objects/MediaType';

@Injectable()
export class UpdateMediaAssetUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateMediaDto): Promise<MediaAssetResponseDto> {
    const existing = await this.prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Media asset not found');
    }

    const updated = await this.prisma.mediaAsset.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        alt_text: dto.altText ?? existing.alt_text,
      },
    });

    return {
      id: updated.id,
      publicUrl: updated.public_url,
      mediaType: updated.media_type as unknown as MediaType,
      mimeType: updated.mime_type,
      sizeBytes: updated.size_bytes.toString(),
      title: updated.title || undefined,
      altText: updated.alt_text || undefined,
      createdAt: updated.created_at.toISOString(),
    };
  }
}
