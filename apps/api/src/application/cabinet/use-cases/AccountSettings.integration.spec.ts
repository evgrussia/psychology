import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { PrismaUserRepository } from '@infrastructure/persistence/prisma/identity/prisma-user.repository';
import { PrismaSessionRepository } from '@infrastructure/persistence/prisma/identity/prisma-session.repository';
import { UpdateCabinetConsentsUseCase } from './UpdateCabinetConsentsUseCase';
import { DeleteAccountUseCase } from './DeleteAccountUseCase';
import { GetCurrentUserUseCase } from '@application/identity/use-cases/GetCurrentUserUseCase';
import { WriteAuditLogUseCase } from '@application/audit/use-cases/WriteAuditLogUseCase';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import * as path from 'path';

jest.setTimeout(20000);

describe('Cabinet Settings (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let updateConsentsUseCase: UpdateCabinetConsentsUseCase;
  let deleteAccountUseCase: DeleteAccountUseCase;
  let getCurrentUserUseCase: GetCurrentUserUseCase;
  let schemaName: string;
  const userId = '33333333-3333-3333-3333-333333333333';
  const sessionId = '44444444-4444-4444-4444-444444444444';

  const trackingStub = {
    trackConsentUpdated: jest.fn(),
    trackAccountDeleted: jest.fn(),
  };

  const telegramSessionStub = {
    deactivateSessions: jest.fn(),
  };

  const cleanupStub = {
    cleanupUserData: jest.fn().mockResolvedValue({
      diaryEntries: 0,
      intakeForms: 0,
      anonymousQuestions: 0,
      questionAnswers: 0,
      reviews: 0,
      leadIdentities: 0,
      waitlistRequests: 0,
    }),
  };

  const auditStub = {
    execute: jest.fn(),
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
        UpdateCabinetConsentsUseCase,
        DeleteAccountUseCase,
        GetCurrentUserUseCase,
        {
          provide: 'IUserRepository',
          useClass: PrismaUserRepository,
        },
        {
          provide: 'ISessionRepository',
          useClass: PrismaSessionRepository,
        },
        {
          provide: 'ITelegramSessionRepository',
          useValue: telegramSessionStub,
        },
        {
          provide: 'IAccountCleanupService',
          useValue: cleanupStub,
        },
        {
          provide: WriteAuditLogUseCase,
          useValue: auditStub,
        },
        {
          provide: TrackingService,
          useValue: trackingStub,
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
    updateConsentsUseCase = module.get(UpdateCabinetConsentsUseCase);
    deleteAccountUseCase = module.get(DeleteAccountUseCase);
    getCurrentUserUseCase = module.get(GetCurrentUserUseCase);
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
        id: userId,
        email: 'user3@example.com',
      },
    });
    await prisma.consent.create({
      data: {
        id: '55555555-5555-5555-5555-555555555555',
        user_id: userId,
        consent_type: 'communications',
        granted: true,
        version: 'v1',
        source: 'booking',
        granted_at: new Date(),
      },
    });
    await prisma.session.create({
      data: {
        id: sessionId,
        user_id: userId,
        expires_at: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
  });

  afterEach(async () => {
    await prisma.session.deleteMany({});
    await prisma.consent.deleteMany({});
    await prisma.user.deleteMany({});
    trackingStub.trackConsentUpdated.mockClear();
    trackingStub.trackAccountDeleted.mockClear();
    telegramSessionStub.deactivateSessions.mockClear();
    cleanupStub.cleanupUserData.mockClear();
    auditStub.execute.mockClear();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    }
    if (module) {
      await module.close();
    }
  });

  it('should revoke communications consent and track update', async () => {
    const response = await updateConsentsUseCase.execute(userId, {
      communications: false,
    });

    expect(response.consents.communications).toBe(false);
    expect(trackingStub.trackConsentUpdated).toHaveBeenCalledWith({
      consentType: 'communications',
      newValue: false,
    });

    const consent = await prisma.consent.findFirst({
      where: { user_id: userId, consent_type: 'communications' },
    });
    expect(consent?.granted).toBe(false);
    expect(consent?.revoked_at).toBeTruthy();
  });

  it('should delete account and invalidate session', async () => {
    await deleteAccountUseCase.execute(userId, {
      actorUserId: userId,
      actorRole: 'client',
    });

    await expect(getCurrentUserUseCase.execute(sessionId)).rejects.toThrow('Invalid or expired session');

    expect(trackingStub.trackAccountDeleted).toHaveBeenCalledWith({
      method: 'self_service',
    });
  });
});
