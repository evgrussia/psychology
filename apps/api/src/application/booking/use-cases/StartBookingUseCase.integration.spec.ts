import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { StartBookingUseCase } from './StartBookingUseCase';
import { PrismaAvailabilitySlotRepository } from '@infrastructure/persistence/prisma/booking/prisma-availability-slot.repository';
import { PrismaAppointmentRepository } from '@infrastructure/persistence/prisma/booking/prisma-appointment.repository';
import { PrismaServiceRepository } from '@infrastructure/persistence/prisma/booking/prisma-service.repository';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { ConflictException } from '@nestjs/common';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

jest.setTimeout(20000);

describe('StartBookingUseCase (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let useCase: StartBookingUseCase;
  let serviceSlug: string;
  let slotId: string;
  let schemaName: string;

  const trackingStub = {
    trackBookingConflict: jest.fn(),
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
        StartBookingUseCase,
        {
          provide: 'IAvailabilitySlotRepository',
          useClass: PrismaAvailabilitySlotRepository,
        },
        {
          provide: 'IAppointmentRepository',
          useClass: PrismaAppointmentRepository,
        },
        {
          provide: 'IServiceRepository',
          useClass: PrismaServiceRepository,
        },
        {
          provide: TrackingService,
          useValue: trackingStub,
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    useCase = module.get(StartBookingUseCase);
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

    const startAt = new Date(Date.now() + 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 50 * 60 * 1000);
    const slot = await prisma.availabilitySlot.create({
      data: {
        service_id: service.id,
        start_at_utc: startAt,
        end_at_utc: endAt,
        status: 'available',
        source: 'product',
      },
    });
    slotId = slot.id;
  });

  afterEach(async () => {
    await prisma.appointment.deleteMany({});
    await prisma.availabilitySlot.deleteMany({});
    await prisma.service.deleteMany({});
    trackingStub.trackBookingConflict.mockClear();
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    await module.close();
  });

  it('should allow only one concurrent booking per slot', async () => {
    const payload = {
      service_slug: serviceSlug,
      slot_id: slotId,
      timezone: 'Europe/Moscow',
    };

    const results = await Promise.allSettled([
      useCase.execute(payload),
      useCase.execute(payload),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictException);

    const appointments = await prisma.appointment.findMany({ where: { slot_id: slotId } });
    expect(appointments).toHaveLength(1);
  });

  it('should return same appointment for idempotent retry', async () => {
    const payload = {
      service_slug: serviceSlug,
      slot_id: slotId,
      timezone: 'Europe/Moscow',
      client_request_id: `req-${Date.now()}`,
    };

    const first = await useCase.execute(payload);
    const second = await useCase.execute(payload);

    expect(second.appointment_id).toBe(first.appointment_id);

    const appointments = await prisma.appointment.findMany({
      where: { client_request_id: payload.client_request_id },
    });
    expect(appointments).toHaveLength(1);
  });
});
