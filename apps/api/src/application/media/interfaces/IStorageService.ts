export interface UploadResult {
  objectKey: string;
  publicUrl: string;
}

export interface IStorageService {
  upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult>;
  delete(objectKey: string): Promise<void>;
}
