import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IMediaAssetRepository } from '@domain/media/repositories/IMediaAssetRepository';
import { MediaAsset } from '@domain/media/entities/MediaAsset';
import { MediaAssetMapper } from './media-asset.mapper';

@Injectable()
export class PrismaMediaAssetRepository implements IMediaAssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(mediaAsset: MediaAsset): Promise<void> {
    const data = MediaAssetMapper.toPrisma(mediaAsset);
    await this.prisma.mediaAsset.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  }

  async findById(id: string): Promise<MediaAsset | null> {
    const prismaMediaAsset = await this.prisma.mediaAsset.findUnique({
      where: { id },
    });
    if (!prismaMediaAsset) return null;
    return MediaAssetMapper.toDomain(prismaMediaAsset);
  }

  async findByObjectKey(objectKey: string): Promise<MediaAsset | null> {
    const prismaMediaAsset = await this.prisma.mediaAsset.findUnique({
      where: { object_key: objectKey },
    });
    if (!prismaMediaAsset) return null;
    return MediaAssetMapper.toDomain(prismaMediaAsset);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.mediaAsset.delete({
      where: { id },
    });
  }

  async isUsedInContent(id: string): Promise<boolean> {
    const count = await this.prisma.contentMedia.count({
      where: { media_asset_id: id },
    });
    return count > 0;
  }
}
