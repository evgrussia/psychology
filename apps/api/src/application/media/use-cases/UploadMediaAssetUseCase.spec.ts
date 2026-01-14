import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadMediaAssetUseCase } from './UploadMediaAssetUseCase';
import { IMediaAssetRepository } from '@domain/media/repositories/IMediaAssetRepository';
import { IStorageService } from '../interfaces/IStorageService';
import { IEventBus } from '@domain/events/event-bus.interface';
import { MediaAsset } from '@domain/media/entities/MediaAsset';
import { MediaStorageProvider, MediaType } from '@domain/media/value-objects/MediaType';
import { MediaAssetUploadedEvent } from '@domain/media/events/MediaAssetUploadedEvent';

describe('UploadMediaAssetUseCase', () => {
  let useCase: UploadMediaAssetUseCase;
  let mediaRepository: jest.Mocked<IMediaAssetRepository>;
  let storageService: jest.Mocked<IStorageService>;
  let eventBus: jest.Mocked<IEventBus>;

  beforeEach(async () => {
    const mockMediaRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByObjectKey: jest.fn(),
      delete: jest.fn(),
      isUsedInContent: jest.fn(),
    };

    const mockStorageService = {
      upload: jest.fn(),
      delete: jest.fn(),
    };

    const mockEventBus = {
      publish: jest.fn(),
      publishAll: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadMediaAssetUseCase,
        {
          provide: 'IMediaAssetRepository',
          useValue: mockMediaRepository,
        },
        {
          provide: 'IStorageService',
          useValue: mockStorageService,
        },
        {
          provide: 'IEventBus',
          useValue: mockEventBus,
        },
      ],
    }).compile();

    useCase = module.get<UploadMediaAssetUseCase>(UploadMediaAssetUseCase);
    mediaRepository = module.get('IMediaAssetRepository');
    storageService = module.get('IStorageService');
    eventBus = module.get('IEventBus');
  });

  describe('mapMimeToMediaType', () => {
    it('should map image/* to IMAGE', () => {
      const result = (useCase as any).mapMimeToMediaType('image/png');
      expect(result).toBe(MediaType.IMAGE);
    });

    it('should map audio/* to AUDIO', () => {
      const result = (useCase as any).mapMimeToMediaType('audio/mpeg');
      expect(result).toBe(MediaType.AUDIO);
    });

    it('should map application/pdf to PDF', () => {
      const result = (useCase as any).mapMimeToMediaType('application/pdf');
      expect(result).toBe(MediaType.PDF);
    });

    it('should return null for unsupported types', () => {
      const result = (useCase as any).mapMimeToMediaType('video/mp4');
      expect(result).toBeNull();
    });
  });

  describe('validateSize', () => {
    it('should accept image within 10MB limit', () => {
      expect(() => {
        (useCase as any).validateSize(MediaType.IMAGE, 5 * 1024 * 1024);
      }).not.toThrow();
    });

    it('should reject image over 10MB', () => {
      expect(() => {
        (useCase as any).validateSize(MediaType.IMAGE, 11 * 1024 * 1024);
      }).toThrow(BadRequestException);
    });

    it('should accept audio within 50MB limit', () => {
      expect(() => {
        (useCase as any).validateSize(MediaType.AUDIO, 30 * 1024 * 1024);
      }).not.toThrow();
    });

    it('should reject audio over 50MB', () => {
      expect(() => {
        (useCase as any).validateSize(MediaType.AUDIO, 51 * 1024 * 1024);
      }).toThrow(BadRequestException);
    });

    it('should accept PDF within 20MB limit', () => {
      expect(() => {
        (useCase as any).validateSize(MediaType.PDF, 15 * 1024 * 1024);
      }).not.toThrow();
    });

    it('should reject PDF over 20MB', () => {
      expect(() => {
        (useCase as any).validateSize(MediaType.PDF, 21 * 1024 * 1024);
      }).toThrow(BadRequestException);
    });
  });

  describe('execute', () => {
    const userId = 'user-123';
    const file = {
      buffer: Buffer.from('test'),
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
    };
    const dto = {
      title: 'Test Image',
      altText: 'Test alt text',
    };

    it('should upload image successfully', async () => {
      const uploadResult = {
        objectKey: '2026-01-13/test-uuid.png',
        publicUrl: 'http://localhost/media/2026-01-13/test-uuid.png',
      };

      storageService.upload.mockResolvedValue(uploadResult);
      mediaRepository.save.mockResolvedValue(undefined);
      eventBus.publish.mockResolvedValue(undefined);

      const result = await useCase.execute(userId, file, dto);

      expect(storageService.upload).toHaveBeenCalledWith(
        file.buffer,
        file.originalname,
        file.mimetype,
      );
      expect(mediaRepository.save).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(MediaAssetUploadedEvent),
      );
      expect(result.publicUrl).toBe(uploadResult.publicUrl);
      expect(result.mediaType).toBe(MediaType.IMAGE);
    });

    it('should reject unsupported mime type', async () => {
      const invalidFile = { ...file, mimetype: 'video/mp4' };

      await expect(useCase.execute(userId, invalidFile, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(storageService.upload).not.toHaveBeenCalled();
    });

    it('should reject file over size limit', async () => {
      const largeFile = { ...file, size: 11 * 1024 * 1024 };

      await expect(useCase.execute(userId, largeFile, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(storageService.upload).not.toHaveBeenCalled();
    });

    it('should require altText for images', async () => {
      const dtoWithoutAlt = { ...dto, altText: undefined };

      await expect(useCase.execute(userId, file, dtoWithoutAlt)).rejects.toThrow(
        BadRequestException,
      );
      expect(storageService.upload).not.toHaveBeenCalled();
    });

    it('should cleanup file if DB save fails', async () => {
      const uploadResult = {
        objectKey: '2026-01-13/test-uuid.png',
        publicUrl: 'http://localhost/media/2026-01-13/test-uuid.png',
      };

      storageService.upload.mockResolvedValue(uploadResult);
      mediaRepository.save.mockRejectedValue(new Error('DB error'));
      storageService.delete.mockResolvedValue(undefined);

      await expect(useCase.execute(userId, file, dto)).rejects.toThrow('DB error');

      expect(storageService.delete).toHaveBeenCalledWith(uploadResult.objectKey);
    });

    it('should not require altText for audio', async () => {
      const audioFile = {
        ...file,
        mimetype: 'audio/mpeg',
      };
      const dtoWithoutAlt = { title: 'Test Audio', altText: undefined };

      const uploadResult = {
        objectKey: '2026-01-13/test-uuid.mp3',
        publicUrl: 'http://localhost/media/2026-01-13/test-uuid.mp3',
      };

      storageService.upload.mockResolvedValue(uploadResult);
      mediaRepository.save.mockResolvedValue(undefined);
      eventBus.publish.mockResolvedValue(undefined);

      const result = await useCase.execute(userId, audioFile, dtoWithoutAlt);

      expect(result.mediaType).toBe(MediaType.AUDIO);
    });
  });
});
