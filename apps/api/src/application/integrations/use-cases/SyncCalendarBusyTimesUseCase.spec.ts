import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { SyncCalendarBusyTimesUseCase } from './SyncCalendarBusyTimesUseCase';
import { PrismaGoogleCalendarIntegrationRepository } from '@infrastructure/persistence/prisma/integrations/prisma-google-calendar-integration.repository';
import { PrismaAvailabilitySlotRepository } from '@infrastructure/persistence/prisma/booking/prisma-availability-slot.repository';
import { GoogleCalendarTokenService } from '../services/GoogleCalendarTokenService';
import { IGoogleCalendarService } from '@domain/integrations/services/IGoogleCalendarService';
import { IGoogleCalendarOAuthService } from '@domain/integrations/services/IGoogleCalendarOAuthService';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

jest.setTimeout(20000);

describe('SyncCalendarBusyTimesUseCase (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let useCase: SyncCalendarBusyTimesUseCase;
  let googleCalendarService: jest.Mocked<IGoogleCalendarService>;
  let schemaName: string;

  const encryptionService: IEncryptionService = {
    encrypt: (value: string) => `enc:${value}`,
    decrypt: (value: string) => value.replace(/^enc:/, ''),
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

    googleCalendarService = {
      getPrimaryCalendar: jest.fn(),
      listBusyIntervals: jest.fn(),
      createEvent: jest.fn(),
    };

    const oauthService: jest.Mocked<IGoogleCalendarOAuthService> = {
      buildAuthorizationUrl: jest.fn(),
      exchangeCodeForTokens: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        SyncCalendarBusyTimesUseCase,
        GoogleCalendarTokenService,
        {
          provide: 'IGoogleCalendarIntegrationRepository',
          useClass: PrismaGoogleCalendarIntegrationRepository,
        },
        {
          provide: 'IAvailabilitySlotRepository',
          useClass: PrismaAvailabilitySlotRepository,
        },
        {
          provide: 'IGoogleCalendarService',
          useValue: googleCalendarService,
        },
        {
          provide: 'IGoogleCalendarOAuthService',
          useValue: oauthService,
        },
        {
          provide: 'IEncryptionService',
          useValue: encryptionService,
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    useCase = module.get(SyncCalendarBusyTimesUseCase);
  });

  beforeEach(async () => {
    if (prisma) {
      await prisma.availabilitySlot.deleteMany({});
      await (prisma as any).googleCalendarIntegration.deleteMany({});
    }
  });

  function configureTestSchema(): void {
    const baseUrl = process.env.DATABASE_URL!;
    const url = new URL(baseUrl);
    schemaName = `test_${process.pid}_${Math.random().toString(16).slice(2)}`;
    url.searchParams.set('schema', schemaName);
    process.env.DATABASE_URL = url.toString();
  }

  afterAll(async () => {
    if (prisma) {
      await prisma.availabilitySlot.deleteMany({});
      await (prisma as any).googleCalendarIntegration.deleteMany({});
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    if (module) {
      await module.close();
    }
  });

  it('should sync busy intervals into availability slots', async () => {
    const now = new Date();
    const from = new Date(now.getTime() + 60 * 60 * 1000);
    const to = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    await (prisma as any).googleCalendarIntegration.create({
      data: {
        status: 'connected',
        calendar_id: 'primary',
        timezone: 'Europe/Moscow',
        encrypted_access_token: encryptionService.encrypt('access-token'),
        encrypted_refresh_token: encryptionService.encrypt('refresh-token'),
        token_expires_at: new Date(Date.now() + 60 * 60 * 1000),
        scopes: [],
      },
    });

    googleCalendarService.listBusyIntervals.mockResolvedValue([
      { start: new Date(from.getTime() + 15 * 60 * 1000), end: new Date(from.getTime() + 45 * 60 * 1000) },
      { start: new Date(from.getTime() + 60 * 60 * 1000), end: new Date(from.getTime() + 90 * 60 * 1000) },
    ]);

    const result = await useCase.execute({ from, to });

    expect(result.status).toBe('success');
    expect(result.busyCount).toBe(2);

    const slots = await prisma.availabilitySlot.findMany({
      where: { source: 'google_calendar', status: 'blocked' },
    });
    expect(slots).toHaveLength(2);
  });
});
