import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService, UploadResult } from '../../../application/media/interfaces/IStorageService';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class LocalFsStorageService implements IStorageService {
  private readonly storagePath: string;
  private readonly publicUrlBase: string;

  constructor(private readonly configService: ConfigService) {
    this.storagePath = this.configService.getOrThrow<string>('MEDIA_STORAGE_PATH');
    this.publicUrlBase = this.configService.getOrThrow<string>('MEDIA_PUBLIC_URL_BASE');
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const ext = path.extname(filename);
    const dateDir = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const uniqueId = randomUUID();
    const objectKey = `${dateDir}/${uniqueId}${ext}`;
    const fullPath = path.join(this.storagePath, objectKey);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file);

    const publicUrl = `${this.publicUrlBase}/${objectKey}`;

    return {
      objectKey,
      publicUrl,
    };
  }

  async delete(objectKey: string): Promise<void> {
    const fullPath = path.join(this.storagePath, objectKey);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // If file doesn't exist, we don't care much, it's already "deleted"
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
