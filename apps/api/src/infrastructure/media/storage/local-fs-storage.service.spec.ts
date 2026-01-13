import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LocalFsStorageService } from './local-fs-storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');
jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomUUID: jest.fn(() => 'test-uuid-123'),
  };
});

describe('LocalFsStorageService', () => {
  let service: LocalFsStorageService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'MEDIA_STORAGE_PATH') return '/tmp/media';
        if (key === 'MEDIA_PUBLIC_URL_BASE') return 'http://localhost/media';
        throw new Error(`Unknown config key: ${key}`);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalFsStorageService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LocalFsStorageService>(LocalFsStorageService);
    configService = module.get(ConfigService);

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should generate object_key with date directory and UUID', async () => {
      const file = Buffer.from('test content');
      const filename = 'test.png';
      const mimeType = 'image/png';

      const mockMkdir = jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const mockWriteFile = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const result = await service.upload(file, filename, mimeType);

      // Check object_key format: YYYY-MM-DD/{uuid}.{ext}
      expect(result.objectKey).toMatch(/^\d{4}-\d{2}-\d{2}\/test-uuid-123\.png$/);
      expect(result.publicUrl).toBe(`http://localhost/media/${result.objectKey}`);

      // Verify directory was created
      const expectedDir = path.dirname(path.join('/tmp/media', result.objectKey));
      expect(mockMkdir).toHaveBeenCalledWith(expectedDir, { recursive: true });

      // Verify file was written
      const expectedPath = path.join('/tmp/media', result.objectKey);
      expect(mockWriteFile).toHaveBeenCalledWith(expectedPath, file);

      mockMkdir.mockRestore();
      mockWriteFile.mockRestore();
    });

    it('should handle different file extensions', async () => {
      const file = Buffer.from('test');
      const mockMkdir = jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      const mockWriteFile = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const result1 = await service.upload(file, 'audio.mp3', 'audio/mpeg');
      expect(result1.objectKey).toMatch(/\.mp3$/);

      const result2 = await service.upload(file, 'document.pdf', 'application/pdf');
      expect(result2.objectKey).toMatch(/\.pdf$/);

      mockMkdir.mockRestore();
      mockWriteFile.mockRestore();
    });
  });

  describe('delete', () => {
    it('should delete file successfully', async () => {
      const objectKey = '2026-01-13/test-uuid.png';
      const mockUnlink = jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

      await service.delete(objectKey);

      const expectedPath = path.join('/tmp/media', objectKey);
      expect(mockUnlink).toHaveBeenCalledWith(expectedPath);

      mockUnlink.mockRestore();
    });

    it('should ignore ENOENT errors (file not found)', async () => {
      const objectKey = '2026-01-13/nonexistent.png';
      const error = new Error('File not found') as any;
      error.code = 'ENOENT';
      const mockUnlink = jest.spyOn(fs, 'unlink').mockRejectedValue(error);

      await expect(service.delete(objectKey)).resolves.not.toThrow();

      mockUnlink.mockRestore();
    });

    it('should throw other errors', async () => {
      const objectKey = '2026-01-13/test.png';
      const error = new Error('Permission denied') as any;
      error.code = 'EACCES';
      const mockUnlink = jest.spyOn(fs, 'unlink').mockRejectedValue(error);

      await expect(service.delete(objectKey)).rejects.toThrow('Permission denied');

      mockUnlink.mockRestore();
    });
  });
});
