import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('Payment confirmation flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
    
    // Initial cleanup
    await prisma.payment.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.paymentWebhookEvent.deleteMany({});
    await prisma.analyticsEvent.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.payment.deleteMany({});
      await prisma.appointment.deleteMany({});
      await prisma.service.deleteMany({});
      await prisma.paymentWebhookEvent.deleteMany({});
      await prisma.analyticsEvent.deleteMany({});
    }
  });

  it('should confirm appointment after succeeded webhook', async () => {
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

    const analyticsEvents = await prisma.analyticsEvent.findMany({
      where: { event_name: { in: ['booking_paid', 'booking_confirmed'] } },
    });
    expect(analyticsEvents).toHaveLength(2);
    const eventNames = analyticsEvents.map((event) => event.event_name).sort();
    expect(eventNames).toEqual(['booking_confirmed', 'booking_paid']);
  });
});
