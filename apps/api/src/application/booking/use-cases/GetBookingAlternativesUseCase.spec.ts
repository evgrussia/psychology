import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { GetBookingAlternativesUseCase } from './GetBookingAlternativesUseCase';
import { PrismaAvailabilitySlotRepository } from '@infrastructure/persistence/prisma/booking/prisma-availability-slot.repository';
import { PrismaServiceRepository } from '@infrastructure/persistence/prisma/booking/prisma-service.repository';
import { PrismaAppointmentRepository } from '@infrastructure/persistence/prisma/booking/prisma-appointment.repository';
import { ServiceFormat } from '@domain/booking/value-objects/ServiceEnums';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

jest.setTimeout(20000);

describe('GetBookingAlternativesUseCase (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let useCase: GetBookingAlternativesUseCase;
  let schemaName: string;

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
        GetBookingAlternativesUseCase,
        {
          provide: 'IAvailabilitySlotRepository',
          useClass: PrismaAvailabilitySlotRepository,
        },
        {
          provide: 'IServiceRepository',
          useClass: PrismaServiceRepository,
        },
        {
          provide: 'IAppointmentRepository',
          useClass: PrismaAppointmentRepository,
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    useCase = module.get(GetBookingAlternativesUseCase);
  });

  function configureTestSchema(): void {
    const baseUrl = process.env.DATABASE_URL!;
    const url = new URL(baseUrl);
    schemaName = `test_${process.pid}_${Math.random().toString(16).slice(2)}`;
    url.searchParams.set('schema', schemaName);
    process.env.DATABASE_URL = url.toString();
  }

  afterEach(async () => {
    if (prisma) {
      await prisma.availabilitySlot.deleteMany({});
      await prisma.appointment.deleteMany({});
      await prisma.service.deleteMany({});
      await prisma.topic.deleteMany({});
    }
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    if (module) {
      await module.close();
    }
  });

  it('returns next available slots outside base range', async () => {
    await prisma.topic.create({
      data: {
        code: 'anxiety',
        title: 'Тема',
        is_active: true,
      },
    });
    const service = await prisma.service.create({
      data: {
        slug: 'service-online',
        title: 'Онлайн консультация',
        description_markdown: 'Описание',
        format: 'online',
        duration_minutes: 50,
        price_amount: 3000,
        status: 'published',
        topic_code: 'anxiety',
      },
    });

    const baseFrom = new Date();
    const alternativeSlotStart = new Date(baseFrom.getTime() + 20 * 24 * 60 * 60 * 1000);
    const alternativeSlotEnd = new Date(alternativeSlotStart.getTime() + 50 * 60 * 1000);

    await prisma.availabilitySlot.create({
      data: {
        service_id: service.id,
        start_at_utc: alternativeSlotStart,
        end_at_utc: alternativeSlotEnd,
        status: 'available',
        source: 'product',
      },
    });

    const result = await useCase.execute({
      serviceSlug: service.slug,
      timezone: 'Europe/Moscow',
    });

    expect(result.status).toBe('available');
    expect(result.has_slots_in_range).toBe(false);
    expect(result.next_slots).toHaveLength(1);
    expect(result.next_days).toHaveLength(1);
    expect(result.time_windows.length).toBeGreaterThan(0);
  });

  it('returns format alternatives for other services in same topic', async () => {
    await prisma.topic.create({
      data: {
        code: 'anxiety',
        title: 'Тема',
        is_active: true,
      },
    });
    const onlineService = await prisma.service.create({
      data: {
        slug: 'service-online',
        title: 'Онлайн консультация',
        description_markdown: 'Описание',
        format: 'online',
        duration_minutes: 50,
        price_amount: 3000,
        status: 'published',
        topic_code: 'anxiety',
      },
    });

    const offlineService = await prisma.service.create({
      data: {
        slug: 'service-offline',
        title: 'Офлайн консультация',
        description_markdown: 'Описание',
        format: 'offline',
        duration_minutes: 50,
        price_amount: 3500,
        status: 'published',
        topic_code: 'anxiety',
        offline_address: 'Тестовый адрес',
      },
    });

    const slotStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const slotEnd = new Date(slotStart.getTime() + 50 * 60 * 1000);
    await prisma.availabilitySlot.create({
      data: {
        service_id: offlineService.id,
        start_at_utc: slotStart,
        end_at_utc: slotEnd,
        status: 'available',
        source: 'product',
      },
    });

    const result = await useCase.execute({
      serviceSlug: onlineService.slug,
      timezone: 'Europe/Moscow',
      selectedFormat: ServiceFormat.online,
    });

    expect(result.format_alternatives).toHaveLength(1);
    expect(result.format_alternatives[0].service.slug).toBe(offlineService.slug);
    expect(result.format_alternatives[0].earliest_slot).not.toBeNull();
  });

});
