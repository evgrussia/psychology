import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { CreatePaymentUseCase } from '@application/booking/use-cases/CreatePaymentUseCase';
import { HandlePaymentWebhookUseCase } from '@application/payment/use-cases/HandlePaymentWebhookUseCase';
import { PrismaAppointmentRepository } from '@infrastructure/persistence/prisma/booking/prisma-appointment.repository';
import { PrismaPaymentRepository } from '@infrastructure/persistence/prisma/payment/prisma-payment.repository';
import { PrismaServiceRepository } from '@infrastructure/persistence/prisma/booking/prisma-service.repository';
import { PrismaPaymentWebhookEventRepository } from '@infrastructure/persistence/prisma/payment/prisma-payment-webhook-event.repository';
import { ConfirmAppointmentAfterPaymentUseCase } from '@application/booking/use-cases/ConfirmAppointmentAfterPaymentUseCase';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { PaymentStatus } from '@domain/payment/value-objects/PaymentEnums';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as crypto from 'crypto';

describe('Payment Integration', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let createPaymentUseCase: CreatePaymentUseCase;
  let handleWebhookUseCase: HandlePaymentWebhookUseCase;
  let schemaName: string;

  const eventBusMock = {
    publish: jest.fn(),
    subscribe: jest.fn(),
  };

  const emailServiceMock = {
    sendEmail: jest.fn(),
  };

  const userRepositoryMock = {
    findById: jest.fn(),
  };

  const trackingServiceMock = {
    trackBookingPaid: jest.fn(),
    trackPaymentFailed: jest.fn(),
    trackBookingConfirmed: jest.fn(),
    trackPaymentStarted: jest.fn(),
  };

  const leadRepositoryMock = {
    findLatestDeepLinkId: jest.fn().mockResolvedValue(null),
  };

  beforeAll(async () => {
    dotenv.config({ path: path.join(__dirname, '../../../../test.env') });
    configureTestSchema();
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });

    const paymentServiceMock = {
      createPayment: jest.fn().mockImplementation((params) => ({
        providerPaymentId: `mock-pay-${Date.now()}`,
        confirmationUrl: 'http://mock-confirmation',
        status: 'pending',
      })),
    };

    module = await Test.createTestingModule({
      providers: [
        PrismaService,
        CreatePaymentUseCase,
        HandlePaymentWebhookUseCase,
        ConfirmAppointmentAfterPaymentUseCase,
        { provide: 'IAppointmentRepository', useClass: PrismaAppointmentRepository },
        { provide: 'IPaymentRepository', useClass: PrismaPaymentRepository },
        { provide: 'IServiceRepository', useClass: PrismaServiceRepository },
        { provide: 'IPaymentWebhookEventRepository', useClass: PrismaPaymentWebhookEventRepository },
        { provide: 'IPaymentService', useValue: paymentServiceMock },
        { provide: 'IEventBus', useValue: eventBusMock },
        { provide: 'IEmailService', useValue: emailServiceMock },
        { provide: 'IUserRepository', useValue: userRepositoryMock },
        { provide: 'ILeadRepository', useValue: leadRepositoryMock },
        { provide: TrackingService, useValue: trackingServiceMock },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    createPaymentUseCase = module.get(CreatePaymentUseCase);
    handleWebhookUseCase = module.get(HandlePaymentWebhookUseCase);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function configureTestSchema(): void {
    const baseUrl = process.env.DATABASE_URL!;
    const url = new URL(baseUrl);
    schemaName = `test_payment_${process.pid}_${Math.random().toString(16).slice(2)}`;
    url.searchParams.set('schema', schemaName);
    process.env.DATABASE_URL = url.toString();
  }

  afterAll(async () => {
    if (prisma) {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    if (module) {
      await module.close();
    }
  });

  it('should create payment and update status via webhook', async () => {
    // 1. Setup data
    const service = await prisma.service.create({
      data: {
        slug: `test-service-${crypto.randomUUID()}`,
        title: 'Test Service',
        description_markdown: 'desc',
        format: 'online',
        duration_minutes: 50,
        price_amount: 5000,
        status: 'published',
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        service_id: service.id,
        start_at_utc: new Date(),
        end_at_utc: new Date(),
        timezone: 'UTC',
        format: 'online',
        status: 'pending_payment',
      },
    });

    // 2. Create Payment
    const clientRequestId = crypto.randomUUID();
    const createRes = await createPaymentUseCase.execute({
      appointment_id: appointment.id,
      client_request_id: clientRequestId,
    });

    expect(createRes.payment_id).toBeDefined();
    expect(createRes.status).toBe('pending');

    const paymentInDb = await prisma.payment.findUnique({
      where: { provider_payment_id: createRes.payment_id },
    });
    expect(paymentInDb).toBeDefined();
    expect(paymentInDb?.idempotency_key).toBe(clientRequestId);

    // 3. Simulate Webhook
    const webhookPayload = {
      event: 'payment.succeeded',
      id: `evt-${crypto.randomUUID()}`,
      object: {
        id: createRes.payment_id,
        status: 'succeeded',
        amount: { value: '5000.00', currency: 'RUB' },
      },
    };

    await handleWebhookUseCase.execute(webhookPayload);

    // 4. Verify results
    const updatedPayment = await prisma.payment.findUnique({
      where: { provider_payment_id: createRes.payment_id },
    });
    expect(updatedPayment?.status).toBe('succeeded');
    expect(updatedPayment?.confirmed_at).toBeDefined();

    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    expect(updatedAppointment?.status).toBe('confirmed');
    expect(eventBusMock.publish).toHaveBeenCalled();
  });

  it('should ignore duplicate webhook events', async () => {
    const service = await prisma.service.create({
      data: {
        slug: `test-service-dup-${crypto.randomUUID()}`,
        title: 'Test Service',
        description_markdown: 'desc',
        format: 'online',
        duration_minutes: 50,
        price_amount: 5000,
        status: 'published',
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        service_id: service.id,
        start_at_utc: new Date(),
        end_at_utc: new Date(),
        timezone: 'UTC',
        format: 'online',
        status: 'pending_payment',
      },
    });

    const clientRequestId = crypto.randomUUID();
    const createRes = await createPaymentUseCase.execute({
      appointment_id: appointment.id,
      client_request_id: clientRequestId,
    });

    const eventId = `evt-dup-${crypto.randomUUID()}`;
    const webhookPayload = {
      event: 'payment.succeeded',
      id: eventId,
      object: {
        id: createRes.payment_id,
        status: 'succeeded',
        amount: { value: '5000.00', currency: 'RUB' },
      },
    };

    const first = await handleWebhookUseCase.execute(webhookPayload);
    const second = await handleWebhookUseCase.execute(webhookPayload);

    expect(first.status).toBe('ok');
    expect(second.status).toBe('duplicate');
    expect(eventBusMock.publish).toHaveBeenCalledTimes(1);
  });

  it('should not downgrade succeeded payment on out-of-order failure', async () => {
    const service = await prisma.service.create({
      data: {
        slug: `test-service-ooo-${crypto.randomUUID()}`,
        title: 'Test Service',
        description_markdown: 'desc',
        format: 'online',
        duration_minutes: 50,
        price_amount: 5000,
        status: 'published',
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        service_id: service.id,
        start_at_utc: new Date(),
        end_at_utc: new Date(),
        timezone: 'UTC',
        format: 'online',
        status: 'pending_payment',
      },
    });

    const clientRequestId = crypto.randomUUID();
    const createRes = await createPaymentUseCase.execute({
      appointment_id: appointment.id,
      client_request_id: clientRequestId,
    });

    await handleWebhookUseCase.execute({
      event: 'payment.succeeded',
      id: `evt-succ-${crypto.randomUUID()}`,
      object: {
        id: createRes.payment_id,
        status: 'succeeded',
        amount: { value: '5000.00', currency: 'RUB' },
      },
    });

    const outOfOrder = await handleWebhookUseCase.execute({
      event: 'payment.canceled',
      id: `evt-cancel-${crypto.randomUUID()}`,
      object: {
        id: createRes.payment_id,
        status: 'canceled',
        cancellation_details: { reason: 'canceled_by_user' },
      },
    });

    expect(outOfOrder.status).toBe('ignored');

    const updatedPayment = await prisma.payment.findUnique({
      where: { provider_payment_id: createRes.payment_id },
    });
    expect(updatedPayment?.status).toBe('succeeded');

    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    expect(updatedAppointment?.status).toBe('confirmed');
  });

  it('should handle idempotent payment creation', async () => {
    const service = await prisma.service.create({
      data: {
        slug: `test-service-idemp-${crypto.randomUUID()}`,
        title: 'Test Service',
        description_markdown: 'desc',
        format: 'online',
        duration_minutes: 50,
        price_amount: 5000,
        status: 'published',
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        service_id: service.id,
        start_at_utc: new Date(),
        end_at_utc: new Date(),
        timezone: 'UTC',
        format: 'online',
        status: 'pending_payment',
      },
    });

    const clientRequestId = 'idemp-key-123';
    const first = await createPaymentUseCase.execute({
      appointment_id: appointment.id,
      client_request_id: clientRequestId,
    });

    const second = await createPaymentUseCase.execute({
      appointment_id: appointment.id,
      client_request_id: clientRequestId,
    });

    expect(second.payment_id).toBe(first.payment_id);
    const count = await prisma.payment.count({
      where: { idempotency_key: clientRequestId },
    });
    expect(count).toBe(1);
  });
});
