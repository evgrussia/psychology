import { MediaType, MediaStorageProvider } from '../value-objects/MediaType';

export interface MediaAssetProps {
  id: string;
  storageProvider: MediaStorageProvider;
  objectKey: string;
  publicUrl: string;
  mediaType: MediaType;
  mimeType: string;
  sizeBytes: bigint;
  title?: string;
  altText?: string;
  uploadedByUserId: string;
  createdAt: Date;
}

export class MediaAsset {
  private constructor(private props: MediaAssetProps) {}

  static create(props: MediaAssetProps): MediaAsset {
    return new MediaAsset(props);
  }

  get id(): string {
    return this.props.id;
  }

  get storageProvider(): MediaStorageProvider {
    return this.props.storageProvider;
  }

  get objectKey(): string {
    return this.props.objectKey;
  }

  get publicUrl(): string {
    return this.props.publicUrl;
  }

  get mediaType(): MediaType {
    return this.props.mediaType;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get sizeBytes(): bigint {
    return this.props.sizeBytes;
  }

  get title(): string | undefined {
    return this.props.title;
  }

  get altText(): string | undefined {
    return this.props.altText;
  }

  get uploadedByUserId(): string {
    return this.props.uploadedByUserId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toObject(): MediaAssetProps {
    return { ...this.props };
  }
}
