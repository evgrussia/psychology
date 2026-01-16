import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { PrismaDiaryEntryRepository } from '@infrastructure/persistence/prisma/cabinet/prisma-diary-entry.repository';
import { CreateDiaryEntryUseCase } from './CreateDiaryEntryUseCase';
import { ListDiaryEntriesUseCase } from './ListDiaryEntriesUseCase';
import { DeleteDiaryEntryUseCase } from './DeleteDiaryEntryUseCase';
import { ExportDiaryPdfUseCase } from './ExportDiaryPdfUseCase';
import { AesGcmEncryptionService } from '@infrastructure/security/encryption.service';
import { ConfigService } from '@nestjs/config';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { DiaryType } from '@domain/cabinet/value-objects/DiaryEnums';
import { ForbiddenException } from '@nestjs/common';
import { PdfMakeDiaryExportRenderer } from '@infrastructure/cabinet/diary-pdf.renderer';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import * as path from 'path';

jest.setTimeout(20000);

describe('DiaryEntries (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let createUseCase: CreateDiaryEntryUseCase;
  let listUseCase: ListDiaryEntriesUseCase;
  let deleteUseCase: DeleteDiaryEntryUseCase;
  let exportUseCase: ExportDiaryPdfUseCase;
  let schemaName: string;
  const userId1 = '11111111-1111-1111-1111-111111111111';
  const userId2 = '22222222-2222-2222-2222-222222222222';

  const trackingStub = {
    trackDiaryEntryCreated: jest.fn(),
    trackDiaryEntryDeleted: jest.fn(),
    trackPdfExported: jest.fn(),
  };

  beforeAll(async () => {
    dotenv.config({ path: path.join(__dirname, '../../../../test.env') });
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in test.env');
    }
    configureTestSchema();
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });

    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        CreateDiaryEntryUseCase,
        ListDiaryEntriesUseCase,
        DeleteDiaryEntryUseCase,
        ExportDiaryPdfUseCase,
        {
          provide: 'IDiaryEntryRepository',
          useClass: PrismaDiaryEntryRepository,
        },
        {
          provide: 'IEncryptionService',
          useFactory: () => new AesGcmEncryptionService(new ConfigService()),
        },
        {
          provide: 'IDiaryExportRenderer',
          useClass: PdfMakeDiaryExportRenderer,
        },
        {
          provide: TrackingService,
          useValue: trackingStub,
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    createUseCase = module.get(CreateDiaryEntryUseCase);
    listUseCase = module.get(ListDiaryEntriesUseCase);
    deleteUseCase = module.get(DeleteDiaryEntryUseCase);
    exportUseCase = module.get(ExportDiaryPdfUseCase);
  });

  function configureTestSchema(): void {
    const baseUrl = process.env.DATABASE_URL!;
    const url = new URL(baseUrl);
    schemaName = `test_${process.pid}_${Math.random().toString(16).slice(2)}`;
    url.searchParams.set('schema', schemaName);
    process.env.DATABASE_URL = url.toString();
  }

  beforeEach(async () => {
    await prisma.user.create({
      data: {
        id: userId1,
        email: 'user1@example.com',
      },
    });
    await prisma.user.create({
      data: {
        id: userId2,
        email: 'user2@example.com',
      },
    });
  });

  afterEach(async () => {
    await prisma.diaryEntry.deleteMany({});
    await prisma.user.deleteMany({});
    trackingStub.trackDiaryEntryCreated.mockClear();
    trackingStub.trackDiaryEntryDeleted.mockClear();
    trackingStub.trackPdfExported.mockClear();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    if (module) {
      await module.close();
    }
  });

  it('should create, list, and delete diary entries with ownership checks', async () => {
    const payload = {
      emotion: 'Тревога',
      intensity: 'moderate',
      notes: 'Нужно выдохнуть',
    };

    const created = await createUseCase.execute(userId1, {
      diary_type: DiaryType.emotions,
      entry_date: '2026-01-16',
      payload,
    });

    expect(created.diary_type).toBe(DiaryType.emotions);
    expect(trackingStub.trackDiaryEntryCreated).toHaveBeenCalledWith({
      diaryType: DiaryType.emotions,
      hasText: true,
    });

    const record = await prisma.diaryEntry.findUnique({ where: { id: created.id } });
    expect(record).toBeTruthy();
    expect(record?.payload_encrypted).not.toEqual(JSON.stringify(payload));
    const recordHasText = (record as { has_text?: boolean } | null)?.has_text;
    expect(recordHasText).toBe(true);

    const listOwner = await listUseCase.execute(userId1, { diaryType: 'emotions' });
    expect(listOwner.items).toHaveLength(1);
    expect(listOwner.items[0].payload.emotion).toBe('Тревога');

    const listOther = await listUseCase.execute(userId2, { diaryType: 'emotions' });
    expect(listOther.items).toHaveLength(0);

    await expect(deleteUseCase.execute(userId2, created.id)).rejects.toBeInstanceOf(ForbiddenException);

    const deleted = await deleteUseCase.execute(userId1, created.id);
    expect(deleted.diary_type).toBe(DiaryType.emotions);
    expect(trackingStub.trackDiaryEntryDeleted).toHaveBeenCalledWith({
      diaryType: DiaryType.emotions,
    });

    const deletedRecord = await prisma.diaryEntry.findUnique({ where: { id: created.id } });
    expect(deletedRecord?.deleted_at).toBeTruthy();
  });

  it('should mark entries without text', async () => {
    const created = await createUseCase.execute(userId1, {
      diary_type: DiaryType.abc,
      entry_date: '2026-01-16',
      payload: {
        activating_event: null,
        beliefs: null,
        consequences: null,
      },
    });

    expect(created.has_text).toBe(false);
    expect(trackingStub.trackDiaryEntryCreated).toHaveBeenCalledWith({
      diaryType: DiaryType.abc,
      hasText: false,
    });
  });

  it('should export diary PDF and deny access for other users', async () => {
    const created = await createUseCase.execute(userId1, {
      diary_type: DiaryType.emotions,
      entry_date: '2026-01-16',
      payload: {
        emotion: 'Спокойствие',
        intensity: 'low',
        context: 'После прогулки',
        notes: 'Сон улучшился',
      },
    });

    const exportResult = await exportUseCase.execute(userId1, {
      period: 'custom',
      from: '2026-01-01',
      to: '2026-01-31',
    });

    expect(exportResult.buffer.slice(0, 4).toString()).toBe('%PDF');
    expect(trackingStub.trackPdfExported).toHaveBeenCalledWith({
      exportType: 'diary_pdf',
      period: 'custom',
    });

    await expect(
      exportUseCase.execute(userId2, {
        period: 'custom',
        from: '2026-01-01',
        to: '2026-01-31',
        entry_ids: [created.id],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
