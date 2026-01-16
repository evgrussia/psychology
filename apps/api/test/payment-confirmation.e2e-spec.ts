import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { GoogleCalendarSyncScheduler } from '../src/infrastructure/integrations/google-calendar-sync.scheduler';
import { IGoogleCalendarService } from '../src/domain/integrations/services/IGoogleCalendarService';

describe('Payment confirmation flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let googleCalendarService: jest.Mocked<IGoogleCalendarService>;

  const encryptionService = {
    encrypt: (value: string) => `enc:${value}`,
    decrypt: (value: string) => value.replace(/^enc:/, ''),
  };

  beforeAll(async () => {
    googleCalendarService = {
      getPrimaryCalendar: jest.fn(),
      listBusyIntervals: jest.fn(),
      createEvent: jest.fn().mockResolvedValue({ id: 'gcal-event-1' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('IGoogleCalendarService')
      .useValue(googleCalendarService)
      .overrideProvider('IGoogleCalendarOAuthService')
      .useValue({
        buildAuthorizationUrl: jest.fn(),
        exchangeCodeForTokens: jest.fn(),
        refreshAccessToken: jest.fn(),
      })
      .overrideProvider('IEncryptionService')
      .useValue(encryptionService)
      .overrideProvider(GoogleCalendarSyncScheduler)
      .useValue({ onModuleInit: jest.fn(), onModuleDestroy: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.payment.deleteMany({});
      await prisma.appointment.deleteMany({});
      await prisma.service.deleteMany({});
      await prisma.googleCalendarIntegration.deleteMany({});
      await prisma.paymentWebhookEvent.deleteMany({});
    }
  });

  it('should confirm appointment after succeeded webhook and create calendar event', async () => {
    const service = await prisma.service.create({
      data: {
        slug: `pay-e2e-${Date.now()}`,
        title: 'Консультация',
        description_markdown: 'Описание',
        format: 'online',
        duration_minutes: 50,
        price_amount: 3500,
        status: 'published',
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        service_id: service.id,
        start_at_utc: new Date(Date.now() + 2 * 60 * 60 * 1000),
        end_at_utc: new Date(Date.now() + 3 * 60 * 60 * 1000),
        timezone: 'Europe/Moscow',
        format: 'online',
        status: 'pending_payment',
      },
    });

    await prisma.payment.create({
      data: {
        appointment_id: appointment.id,
        provider: 'yookassa',
        provider_payment_id: 'pay-e2e-1',
        amount: 3500,
        currency: 'RUB',
        status: 'pending',
      },
    });

    await prisma.googleCalendarIntegration.create({
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

    const eventId = `evt-pay-e2e-${Date.now()}`;
    const response = await request(app.getHttpServer())
      .post('/api/webhooks/yookassa')
      .send({
        event: 'payment.succeeded',
        id: eventId,
        object: {
          id: 'pay-e2e-1',
          status: 'succeeded',
          amount: { value: '3500.00', currency: 'RUB' },
        },
      })
      .expect(200);

    expect(response.body?.status).toBe('ok');

    const updatedPayment = await prisma.payment.findUnique({
      where: { provider_payment_id: 'pay-e2e-1' },
    });
    expect(updatedPayment?.status).toBe('succeeded');

    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    expect(updatedAppointment?.status).toBe('confirmed');
    expect(updatedAppointment?.external_calendar_event_id).toBe('gcal-event-1');
    expect(googleCalendarService.createEvent).toHaveBeenCalled();
  });
});
