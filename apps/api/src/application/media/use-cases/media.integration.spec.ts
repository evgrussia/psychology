import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UploadMediaAssetUseCase } from './UploadMediaAssetUseCase';
import { DeleteMediaAssetUseCase } from './DeleteMediaAssetUseCase';
import { ListMediaAssetsUseCase } from './ListMediaAssetsUseCase';
import { LocalFsStorageService } from '../../../infrastructure/media/storage/local-fs-storage.service';
import { PrismaMediaAssetRepository } from '../../../infrastructure/media/persistence/prisma/media/prisma-media-asset.repository';
import { EventBusService } from '../../../infrastructure/events/event-bus.service';
import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { MediaType } from '@domain/media/value-objects/MediaType';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

describe('Media Integration Tests', () => {
  let module: TestingModule;
  let uploadUseCase: UploadMediaAssetUseCase;
  let deleteUseCase: DeleteMediaAssetUseCase;
  let listUseCase: ListMediaAssetsUseCase;
  let prisma: PrismaService;
  let storageService: LocalFsStorageService;
  let testStoragePath: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create temporary storage directory
    testStoragePath = path.join(__dirname, '../../../../test-media-storage');
    await fs.mkdir(testStoragePath, { recursive: true });

    const mockAuditLogHelper = {
      logAction: jest.fn().mockResolvedValue(undefined),
    };

    // Create test user
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        PrismaService,
        UploadMediaAssetUseCase,
        DeleteMediaAssetUseCase,
        ListMediaAssetsUseCase,
        {
          provide: 'IMediaAssetRepository',
          useClass: PrismaMediaAssetRepository,
        },
        {
          provide: 'IStorageService',
          useFactory: () => {
            return new LocalFsStorageService({
              getOrThrow: (key: string) => {
                if (key === 'MEDIA_STORAGE_PATH') return testStoragePath;
                if (key === 'MEDIA_PUBLIC_URL_BASE') return 'http://localhost:3000/media';
                throw new Error(`Unknown config key: ${key}`);
              },
            } as any);
          },
        },
        {
          provide: 'IEventBus',
          useClass: EventBusService,
        },
        {
          provide: 'AuditLogHelper',
          useValue: mockAuditLogHelper,
        },
        {
          provide: AuditLogHelper,
          useValue: mockAuditLogHelper,
        }
      ],
    }).compile();

    uploadUseCase = module.get<UploadMediaAssetUseCase>(UploadMediaAssetUseCase);
    deleteUseCase = module.get<DeleteMediaAssetUseCase>(DeleteMediaAssetUseCase);
    listUseCase = module.get<ListMediaAssetsUseCase>(ListMediaAssetsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    storageService = module.get<LocalFsStorageService>('IStorageService') as LocalFsStorageService;

    // Seed roles
    await prisma.role.upsert({
      where: { code: 'owner' },
      update: {},
      create: { code: 'owner', scope: 'admin' },
    });

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-${randomUUID()}@example.com`,
        password_hash: 'test-hash',
        status: 'active',
        roles: {
          create: {
            role_code: 'owner',
          },
        },
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }

    // Cleanup test media assets
    await prisma.mediaAsset.deleteMany({
      where: { uploaded_by_user_id: testUserId },
    });

    // Cleanup storage directory
    try {
      await fs.rm(testStoragePath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }

    await module.close();
  });

  describe('Upload → List → Delete flow', () => {
    let uploadedMediaId: string;
    let uploadedObjectKey: string;

    it('should upload image successfully', async () => {
      const file = {
        buffer: Buffer.from('fake image content'),
        originalname: 'test-image.png',
        mimetype: 'image/png',
        size: 1024,
      };
      const dto = {
        title: 'Test Image',
        altText: 'Test alt text for image',
      };

      const result = await uploadUseCase.execute(testUserId, file, dto);

      expect(result.id).toBeDefined();
      expect(result.mediaType).toBe(MediaType.IMAGE);
      expect(result.publicUrl).toContain('http://localhost:3000/media');
      expect(result.altText).toBe(dto.altText);

      uploadedMediaId = result.id;
      uploadedObjectKey = result.publicUrl.replace('http://localhost:3000/media/', '');

      // Verify file exists in storage
      const filePath = path.join(testStoragePath, uploadedObjectKey);
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Verify record exists in DB
      const dbRecord = await prisma.mediaAsset.findUnique({
        where: { id: uploadedMediaId },
      });
      expect(dbRecord).toBeDefined();
      expect(dbRecord?.object_key).toBe(uploadedObjectKey);
    });

    it('should list uploaded media', async () => {
      const list = await listUseCase.execute();

      const uploadedItem = list.find((item) => item.id === uploadedMediaId);
      expect(uploadedItem).toBeDefined();
      expect(uploadedItem?.mediaType).toBe(MediaType.IMAGE);
      expect(uploadedItem?.altText).toBe('Test alt text for image');
    });

    it('should delete media successfully', async () => {
      await deleteUseCase.execute(uploadedMediaId, testUserId);

      // Verify record deleted from DB
      const dbRecord = await prisma.mediaAsset.findUnique({
        where: { id: uploadedMediaId },
      });
      expect(dbRecord).toBeNull();

      // Verify file deleted from storage
      const filePath = path.join(testStoragePath, uploadedObjectKey);
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(false);
    });
  });

  describe('Public URL access simulation', () => {
    it('should generate public URL that matches storage path', async () => {
      const file = {
        buffer: Buffer.from('test content'),
        originalname: 'public-test.png',
        mimetype: 'image/png',
        size: 512,
      };
      const dto = {
        title: 'Public Test',
        altText: 'Public test image',
      };

      const result = await uploadUseCase.execute(testUserId, file, dto);

      // Public URL should be accessible via /media/{object_key}
      expect(result.publicUrl).toMatch(/^http:\/\/localhost:3000\/media\/\d{4}-\d{2}-\d{2}\/.*\.png$/);

      // Verify object_key matches file structure
      const objectKey = result.publicUrl.replace('http://localhost:3000/media/', '');
      const filePath = path.join(testStoragePath, objectKey);
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);

      // Cleanup
      await deleteUseCase.execute(result.id, testUserId);
    });
  });
});
