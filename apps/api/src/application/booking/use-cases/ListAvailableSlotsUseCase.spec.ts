import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { ListAvailableSlotsUseCase } from './ListAvailableSlotsUseCase';
import { PrismaAvailabilitySlotRepository } from '@infrastructure/persistence/prisma/booking/prisma-availability-slot.repository';
import { PrismaServiceRepository } from '@infrastructure/persistence/prisma/booking/prisma-service.repository';
import { PrismaAppointmentRepository } from '@infrastructure/persistence/prisma/booking/prisma-appointment.repository';
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
  let rangeFrom: Date;
  let rangeTo: Date;

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
          provide: 'IAppointmentRepository',
          useClass: PrismaAppointmentRepository,
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
    rangeFrom = new Date(now.getTime() + 60 * 60 * 1000);
    rangeTo = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.availabilitySlot.deleteMany({});
      await prisma.appointment.deleteMany({});
      await prisma.service.deleteMany({});
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

  it('should exclude slots that overlap busy intervals', async () => {
    const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
    if (!service) throw new Error('Service not found');

    await prisma.availabilitySlot.create({
      data: {
        service_id: service.id,
        start_at_utc: new Date(rangeFrom.getTime() + 15 * 60 * 1000),
        end_at_utc: new Date(rangeFrom.getTime() + 75 * 60 * 1000),
        status: 'available',
        source: 'product',
      },
    });

    await prisma.availabilitySlot.create({
      data: {
        service_id: null,
        start_at_utc: new Date(rangeFrom.getTime() + 30 * 60 * 1000),
        end_at_utc: new Date(rangeFrom.getTime() + 90 * 60 * 1000),
        status: 'reserved',
        source: 'product',
      },
    });

    const result = await useCase.execute({
      serviceSlug,
      from: rangeFrom.toISOString(),
      to: rangeTo.toISOString(),
      timezone: 'Europe/Moscow',
    });

    expect(result.slots).toHaveLength(0);
  });

  it('should exclude slots that overlap admin exceptions', async () => {
    const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
    if (!service) throw new Error('Service not found');

    const slotStart = new Date(rangeFrom.getTime() + 10 * 60 * 1000);
    const slotEnd = new Date(rangeFrom.getTime() + 70 * 60 * 1000);

    await prisma.availabilitySlot.create({
      data: {
        service_id: service.id,
        start_at_utc: slotStart,
        end_at_utc: slotEnd,
        status: 'available',
        source: 'product',
      },
    });

    await prisma.availabilitySlot.create({
      data: {
        service_id: null,
        start_at_utc: new Date(rangeFrom.getTime() + 30 * 60 * 1000),
        end_at_utc: new Date(rangeFrom.getTime() + 90 * 60 * 1000),
        status: 'blocked',
        source: 'product',
        block_type: 'exception',
      },
    });

    const result = await useCase.execute({
      serviceSlug,
      from: rangeFrom.toISOString(),
      to: rangeTo.toISOString(),
      timezone: 'Europe/Moscow',
    });

    expect(result.slots).toHaveLength(0);
  });
});
