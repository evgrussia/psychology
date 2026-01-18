import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { PrismaAppointmentRepository } from '@infrastructure/persistence/prisma/booking/prisma-appointment.repository';
import { PrismaIntakeFormRepository } from '@infrastructure/persistence/prisma/booking/prisma-intake-form.repository';
import { PrismaUserRepository } from '@infrastructure/persistence/prisma/identity/prisma-user.repository';
import { SubmitIntakeUseCase } from './SubmitIntakeUseCase';
import { AesGcmEncryptionService } from '@infrastructure/security/encryption.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import * as path from 'path';

jest.setTimeout(20000);

describe('SubmitIntakeUseCase (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let submitUseCase: SubmitIntakeUseCase;
  let encryptionService: AesGcmEncryptionService;
  let schemaName: string;

  const userIdWithConsent = '11111111-1111-1111-1111-111111111111';
  const userIdWithoutConsent = '22222222-2222-2222-2222-222222222222';
  const serviceId = '33333333-3333-3333-3333-333333333333';
  const appointmentIdWithConsent = '44444444-4444-4444-4444-444444444444';
  const appointmentIdWithoutConsent = '55555555-5555-5555-5555-555555555555';

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
        SubmitIntakeUseCase,
        {
          provide: 'IAppointmentRepository',
          useClass: PrismaAppointmentRepository,
        },
        {
          provide: 'IIntakeFormRepository',
          useClass: PrismaIntakeFormRepository,
        },
        {
          provide: 'IUserRepository',
          useClass: PrismaUserRepository,
        },
        {
          provide: 'IEncryptionService',
          useFactory: () => new AesGcmEncryptionService(new ConfigService()),
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    submitUseCase = module.get(SubmitIntakeUseCase);
    encryptionService = module.get('IEncryptionService');
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
        id: userIdWithConsent,
        email: 'consented@example.com',
      },
    });
    await prisma.user.create({
      data: {
        id: userIdWithoutConsent,
        email: 'no-consent@example.com',
      },
    });

    await prisma.consent.create({
      data: {
        user_id: userIdWithConsent,
        consent_type: 'personal_data',
        granted: true,
        version: '2026-01-07',
        source: 'web',
        granted_at: new Date(),
      },
    });

    await prisma.service.create({
      data: {
        id: serviceId,
        slug: `primary-${Date.now()}`,
        title: 'Primary consultation',
        description_markdown: 'Test service',
        format: 'online',
        duration_minutes: 60,
        price_amount: 5000,
        status: 'published',
      },
    });

    await prisma.appointment.create({
      data: {
        id: appointmentIdWithConsent,
        service_id: serviceId,
        client_user_id: userIdWithConsent,
        start_at_utc: new Date('2026-01-16T10:00:00.000Z'),
        end_at_utc: new Date('2026-01-16T11:00:00.000Z'),
        timezone: 'Europe/Moscow',
        format: 'online',
        status: 'pending_payment',
      },
    });

    await prisma.appointment.create({
      data: {
        id: appointmentIdWithoutConsent,
        service_id: serviceId,
        client_user_id: userIdWithoutConsent,
        start_at_utc: new Date('2026-01-17T10:00:00.000Z'),
        end_at_utc: new Date('2026-01-17T11:00:00.000Z'),
        timezone: 'Europe/Moscow',
        format: 'online',
        status: 'pending_payment',
      },
    });
  });

  afterEach(async () => {
    if (!prisma) {
      return;
    }
    await prisma.intakeForm.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.consent.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    if (module) {
      await module.close();
    }
  });

  it('stores encrypted intake payload and supports decrypt roundtrip', async () => {
    const payload = {
      symptoms: 'Anxiety',
      notes: 'Need coping strategies',
    };

    await submitUseCase.execute(appointmentIdWithConsent, { payload });

    const record = await prisma.intakeForm.findUnique({
      where: { appointment_id: appointmentIdWithConsent },
    });

    expect(record).toBeTruthy();
    expect(record?.payload_encrypted).not.toEqual(JSON.stringify(payload));
    expect(record?.payload_encrypted).toContain('test-key:');

    const decrypted = encryptionService.decrypt(record!.payload_encrypted);
    expect(JSON.parse(decrypted)).toEqual(payload);
  });

  it('rejects intake submission without personal data consent', async () => {
    await expect(
      submitUseCase.execute(appointmentIdWithoutConsent, {
        payload: { notes: 'No consent' },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
