import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IMediaAssetRepository } from '@domain/media/repositories/IMediaAssetRepository';
import { IStorageService } from '../interfaces/IStorageService';
import { MediaAsset } from '@domain/media/entities/MediaAsset';
import { MediaStorageProvider, MediaType } from '@domain/media/value-objects/MediaType';
import { MediaAssetResponseDto, UploadMediaDto } from '../dto/media-asset.dto';
import { MediaAssetUploadedEvent } from '@domain/media/events/MediaAssetUploadedEvent';
import { IEventBus } from '@domain/events/event-bus.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadMediaAssetUseCase {
  constructor(
    @Inject('IMediaAssetRepository')
    private readonly mediaRepository: IMediaAssetRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async execute(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    dto: UploadMediaDto,
  ): Promise<MediaAssetResponseDto> {
    const mediaType = this.mapMimeToMediaType(file.mimetype);
    if (!mediaType) {
      throw new BadRequestException(`Unsupported mime type: ${file.mimetype}`);
    }

    this.validateSize(mediaType, file.size);

    // Validate alt_text for images (A11y requirement)
    if (mediaType === MediaType.IMAGE && !dto.altText) {
      throw new BadRequestException(
        'altText is required for images. Please provide alt text or mark the image as decorative.',
      );
    }

    let uploadResult: { objectKey: string; publicUrl: string } | null = null;

    try {
      // 1. Upload to storage
      uploadResult = await this.storageService.upload(
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      // 2. Save metadata to DB
      const mediaAssetId = randomUUID();
      const mediaAsset = MediaAsset.create({
        id: mediaAssetId,
        storageProvider: MediaStorageProvider.LOCAL_FS,
        objectKey: uploadResult.objectKey,
        publicUrl: uploadResult.publicUrl,
        mediaType,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        title: dto.title,
        altText: dto.altText,
        uploadedByUserId: userId,
        createdAt: new Date(),
      });

      await this.mediaRepository.save(mediaAsset);

      // 3. Publish event
      await this.eventBus.publish(
        new MediaAssetUploadedEvent(mediaAssetId, {
          userId,
          mediaType: mediaAsset.mediaType,
          mimeType: mediaAsset.mimeType,
          sizeBytes: mediaAsset.sizeBytes.toString(),
        }),
      );

      return {
        id: mediaAsset.id,
        publicUrl: mediaAsset.publicUrl,
        mediaType: mediaAsset.mediaType,
        mimeType: mediaAsset.mimeType,
        sizeBytes: mediaAsset.sizeBytes.toString(),
        title: mediaAsset.title,
        altText: mediaAsset.altText,
        createdAt: mediaAsset.createdAt.toISOString(),
      };
    } catch (error) {
      // Cleanup: if file was uploaded but DB save failed, delete the file
      if (uploadResult) {
        try {
          await this.storageService.delete(uploadResult.objectKey);
        } catch (cleanupError) {
          // Log cleanup error but don't throw - original error is more important
          console.error(`Failed to cleanup uploaded file ${uploadResult.objectKey}:`, cleanupError);
        }
      }
      throw error;
    }
  }

  private mapMimeToMediaType(mimeType: string): MediaType | null {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    if (mimeType === 'application/pdf') return MediaType.PDF;
    return null;
  }

  private validateSize(type: MediaType, size: number): void {
    const limits = {
      [MediaType.IMAGE]: 10 * 1024 * 1024, // 10MB
      [MediaType.AUDIO]: 50 * 1024 * 1024, // 50MB
      [MediaType.PDF]: 20 * 1024 * 1024, // 20MB
    };

    if (size > limits[type]) {
      const mb = limits[type] / (1024 * 1024);
      throw new BadRequestException(
        `File size too large for ${type}. Maximum allowed is ${mb}MB`,
      );
    }
  }
}
