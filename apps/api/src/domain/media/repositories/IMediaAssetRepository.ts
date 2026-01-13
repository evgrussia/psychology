import { MediaAsset } from '../entities/MediaAsset';

export interface IMediaAssetRepository {
  save(mediaAsset: MediaAsset): Promise<void>;
  findById(id: string): Promise<MediaAsset | null>;
  findByObjectKey(objectKey: string): Promise<MediaAsset | null>;
  delete(id: string): Promise<void>;
  isUsedInContent(id: string): Promise<boolean>;
}
