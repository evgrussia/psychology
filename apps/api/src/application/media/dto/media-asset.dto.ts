import { MediaType } from '../../../domain/media/value-objects/MediaType';

export interface UploadMediaDto {
  title?: string;
  altText?: string;
}

export interface MediaAssetResponseDto {
  id: string;
  publicUrl: string;
  mediaType: MediaType;
  mimeType: string;
  sizeBytes: string; // BigInt as string for JSON
  title?: string;
  altText?: string;
  createdAt: string;
}
