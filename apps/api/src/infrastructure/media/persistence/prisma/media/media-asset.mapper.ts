import { MediaAsset as PrismaMediaAsset, MediaStorageProvider as PrismaStorageProvider, MediaType as PrismaMediaType } from '@prisma/client';
import { MediaAsset } from '@domain/media/entities/MediaAsset';
import { MediaStorageProvider, MediaType } from '@domain/media/value-objects/MediaType';

export class MediaAssetMapper {
  static toDomain(prismaMediaAsset: PrismaMediaAsset): MediaAsset {
    return MediaAsset.create({
      id: prismaMediaAsset.id,
      storageProvider: prismaMediaAsset.storage_provider as unknown as MediaStorageProvider,
      objectKey: prismaMediaAsset.object_key,
      publicUrl: prismaMediaAsset.public_url,
      mediaType: prismaMediaAsset.media_type as unknown as MediaType,
      mimeType: prismaMediaAsset.mime_type,
      sizeBytes: prismaMediaAsset.size_bytes,
      title: prismaMediaAsset.title || undefined,
      altText: prismaMediaAsset.alt_text || undefined,
      uploadedByUserId: prismaMediaAsset.uploaded_by_user_id,
      createdAt: prismaMediaAsset.created_at,
    });
  }

  static toPrisma(domainMediaAsset: MediaAsset): PrismaMediaAsset {
    return {
      id: domainMediaAsset.id,
      storage_provider: domainMediaAsset.storageProvider as unknown as PrismaStorageProvider,
      object_key: domainMediaAsset.objectKey,
      public_url: domainMediaAsset.publicUrl,
      media_type: domainMediaAsset.mediaType as unknown as PrismaMediaType,
      mime_type: domainMediaAsset.mimeType,
      size_bytes: domainMediaAsset.sizeBytes,
      title: domainMediaAsset.title || null,
      alt_text: domainMediaAsset.altText || null,
      uploaded_by_user_id: domainMediaAsset.uploadedByUserId,
      created_at: domainMediaAsset.createdAt,
    };
  }
}
