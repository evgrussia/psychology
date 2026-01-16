import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { CreateCalendarEventForAppointmentUseCase } from './CreateCalendarEventForAppointmentUseCase';
import { GoogleCalendarTokenService } from '../services/GoogleCalendarTokenService';
import { PrismaGoogleCalendarIntegrationRepository } from '@infrastructure/persistence/prisma/integrations/prisma-google-calendar-integration.repository';
import { PrismaAppointmentRepository } from '@infrastructure/persistence/prisma/booking/prisma-appointment.repository';
import { PrismaServiceRepository } from '@infrastructure/persistence/prisma/booking/prisma-service.repository';
import { IGoogleCalendarService } from '@domain/integrations/services/IGoogleCalendarService';
import { IGoogleCalendarOAuthService } from '@domain/integrations/services/IGoogleCalendarOAuthService';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

jest.setTimeout(20000);

describe('CreateCalendarEventForAppointmentUseCase (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let useCase: CreateCalendarEventForAppointmentUseCase;
  let googleCalendarService: jest.Mocked<IGoogleCalendarService>;
  let serviceId: string;
  let appointmentId: string;
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
        CreateCalendarEventForAppointmentUseCase,
        GoogleCalendarTokenService,
        {
          provide: 'IGoogleCalendarIntegrationRepository',
          useClass: PrismaGoogleCalendarIntegrationRepository,
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
    useCase = module.get(CreateCalendarEventForAppointmentUseCase);
  });

  function configureTestSchema(): void {
    const baseUrl = process.env.DATABASE_URL!;
    const url = new URL(baseUrl);
    schemaName = `test_${process.pid}_${Math.random().toString(16).slice(2)}`;
    url.searchParams.set('schema', schemaName);
    process.env.DATABASE_URL = url.toString();
  }

  beforeEach(async () => {
    jest.clearAllMocks();
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

    const service = await prisma.service.create({
      data: {
        slug: `intro-${Date.now()}`,
        title: 'Ознакомительная сессия',
        description_markdown: 'Описание',
        format: 'online',
        duration_minutes: 50,
        price_amount: 3000,
        status: 'published',
      },
    });
    serviceId = service.id;

    const appointment = await prisma.appointment.create({
      data: {
        service_id: serviceId,
        start_at_utc: new Date(Date.now() + 2 * 60 * 60 * 1000),
        end_at_utc: new Date(Date.now() + 3 * 60 * 60 * 1000),
        timezone: 'Europe/Moscow',
        format: 'online',
        status: 'confirmed',
      },
    });
    appointmentId = appointment.id;
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.appointment.deleteMany({});
      await prisma.service.deleteMany({});
      await (prisma as any).googleCalendarIntegration.deleteMany({});
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

  it('should create calendar event and link appointment', async () => {
    googleCalendarService.createEvent.mockResolvedValue({
      id: 'event-123',
    });

    const result = await useCase.execute(appointmentId);

    expect(result.status).toBe('created');
    expect(result.eventId).toBe('event-123');

    const updated = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    expect(updated?.external_calendar_event_id).toBe('event-123');
  });

  it('should skip when appointment already has calendar event id', async () => {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { external_calendar_event_id: 'event-existing' },
    });

    const result = await useCase.execute(appointmentId);

    expect(result.status).toBe('skipped');
    expect(googleCalendarService.createEvent).not.toHaveBeenCalled();
  });
});
