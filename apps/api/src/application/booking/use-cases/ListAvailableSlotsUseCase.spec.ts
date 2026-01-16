import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { ListAvailableSlotsUseCase } from './ListAvailableSlotsUseCase';
import { PrismaAvailabilitySlotRepository } from '@infrastructure/persistence/prisma/booking/prisma-availability-slot.repository';
import { PrismaServiceRepository } from '@infrastructure/persistence/prisma/booking/prisma-service.repository';
import { PrismaGoogleCalendarIntegrationRepository } from '@infrastructure/persistence/prisma/integrations/prisma-google-calendar-integration.repository';
import { SyncCalendarBusyTimesUseCase } from '@application/integrations/use-cases/SyncCalendarBusyTimesUseCase';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

jest.setTimeout(20000);

describe('ListAvailableSlotsUseCase (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let useCase: ListAvailableSlotsUseCase;
  let serviceSlug: string;
  let schemaName: string;
  let syncRangeFrom: Date;
  let syncRangeTo: Date;

  const syncUseCase = {
    execute: jest.fn().mockResolvedValue({
      status: 'success',
      syncedFrom: new Date(),
      syncedTo: new Date(),
      busyCount: 0,
      lastSyncAt: new Date(),
    }),
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
        ListAvailableSlotsUseCase,
        {
          provide: 'IAvailabilitySlotRepository',
          useClass: PrismaAvailabilitySlotRepository,
        },
        {
          provide: 'IServiceRepository',
          useClass: PrismaServiceRepository,
        },
        {
          provide: 'IGoogleCalendarIntegrationRepository',
          useClass: PrismaGoogleCalendarIntegrationRepository,
        },
        {
          provide: SyncCalendarBusyTimesUseCase,
          useValue: syncUseCase,
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    useCase = module.get(ListAvailableSlotsUseCase);
  });

  function configureTestSchema(): void {
    const baseUrl = process.env.DATABASE_URL!;
    const url = new URL(baseUrl);
    schemaName = `test_${process.pid}_${Math.random().toString(16).slice(2)}`;
    url.searchParams.set('schema', schemaName);
    process.env.DATABASE_URL = url.toString();
  }

  beforeEach(async () => {
    const service = await prisma.service.create({
      data: {
        slug: `service-${Date.now()}`,
        title: 'Консультация',
        description_markdown: 'Описание',
        format: 'online',
        duration_minutes: 50,
        price_amount: 3000,
        status: 'published',
      },
    });
    serviceSlug = service.slug;

    const now = new Date();
    syncRangeFrom = new Date(now.getTime() + 60 * 60 * 1000);
    syncRangeTo = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    await (prisma as any).googleCalendarIntegration.create({
      data: {
        status: 'connected',
        calendar_id: 'primary',
        timezone: 'Europe/Moscow',
        encrypted_access_token: 'enc:token',
        encrypted_refresh_token: 'enc:refresh',
        token_expires_at: new Date(Date.now() + 60 * 60 * 1000),
        scopes: [],
        last_sync_at: new Date(),
        last_sync_range_start_at: syncRangeFrom,
        last_sync_range_end_at: syncRangeTo,
      },
    });
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.availabilitySlot.deleteMany({});
      await prisma.service.deleteMany({});
      await (prisma as any).googleCalendarIntegration.deleteMany({});
    }
    syncUseCase.execute.mockClear();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    if (module) {
      await module.close();
    }
  });

  it('should exclude slots that overlap busy intervals', async () => {
    const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
    if (!service) throw new Error('Service not found');

    await prisma.availabilitySlot.create({
      data: {
        service_id: service.id,
        start_at_utc: new Date(syncRangeFrom.getTime() + 15 * 60 * 1000),
        end_at_utc: new Date(syncRangeFrom.getTime() + 75 * 60 * 1000),
        status: 'available',
        source: 'product',
      },
    });

    await prisma.availabilitySlot.create({
      data: {
        service_id: null,
        start_at_utc: new Date(syncRangeFrom.getTime() + 30 * 60 * 1000),
        end_at_utc: new Date(syncRangeFrom.getTime() + 90 * 60 * 1000),
        status: 'blocked',
        source: 'google_calendar',
      },
    });

    const result = await useCase.execute({
      serviceSlug,
      from: syncRangeFrom.toISOString(),
      to: syncRangeTo.toISOString(),
      timezone: 'Europe/Moscow',
    });

    expect(result.slots).toHaveLength(0);
    expect(syncUseCase.execute).not.toHaveBeenCalled();
  });
});
