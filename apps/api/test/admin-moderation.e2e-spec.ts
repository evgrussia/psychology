import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';
import { IEncryptionService } from '../src/domain/security/services/IEncryptionService';

describe('Admin Moderation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminCookie: string;
  let questionId: string;

  beforeAll(async () => {
    if (!process.env.ENCRYPTION_KEY_ID || !process.env.ENCRYPTION_KEY) {
      process.env.ENCRYPTION_KEY_ID = 'test-key';
      process.env.ENCRYPTION_KEY = Buffer.alloc(32, 1).toString('base64');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    const hasher = new BcryptHasher();
    const encryptionService = app.get<IEncryptionService>('IEncryptionService');

    await prisma.questionAnswer.deleteMany();
    await prisma.ugcModerationAction.deleteMany();
    await prisma.anonymousQuestion.deleteMany();
    await prisma.auditLogEntry.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    await prisma.role.createMany({
      data: [
        { code: 'owner', scope: 'admin' },
        { code: 'assistant', scope: 'admin' },
        { code: 'editor', scope: 'admin' },
        { code: 'client', scope: 'product' },
      ],
    });

    const password = 'password123';
    const passwordHash = await hasher.hash(password);
    await prisma.user.create({
      data: {
        email: 'owner-moderation@example.com',
        password_hash: passwordHash,
        status: 'active',
        roles: {
          create: { role_code: 'owner' },
        },
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: 'owner-moderation@example.com', password })
      .expect(200);

    adminCookie = loginRes.headers['set-cookie'][0];

    const question = await prisma.anonymousQuestion.create({
      data: {
        status: 'pending',
        trigger_flags: ['pii'],
        question_text_encrypted: encryptionService.encrypt('Нужен совет по тревоге.'),
        contact_value_encrypted: encryptionService.encrypt('test@example.com'),
        publish_allowed: false,
      },
    });
    questionId = question.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists moderation items and approves question', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/api/admin/moderation/items')
      .set('Cookie', [adminCookie])
      .expect(200);

    const ids = listRes.body.items.map((item: any) => item.id);
    expect(ids).toContain(questionId);

    await request(app.getHttpServer())
      .post(`/api/admin/moderation/items/${questionId}/approve`)
      .set('Cookie', [adminCookie])
      .expect(200);

    const updated = await prisma.anonymousQuestion.findUnique({ where: { id: questionId } });
    expect(updated?.status).toBe('approved');

    const auditEntry = await prisma.auditLogEntry.findFirst({
      where: {
        action: 'admin_moderation_approved',
        entity_id: questionId,
      },
    });
    expect(auditEntry).not.toBeNull();
  });

  it('answers question and writes audit log', async () => {
    await request(app.getHttpServer())
      .post(`/api/admin/moderation/items/${questionId}/answer`)
      .set('Cookie', [adminCookie])
      .send({ text: 'Спасибо за вопрос. Это не медицинская консультация.' })
      .expect(200);

    const updated = await prisma.anonymousQuestion.findUnique({ where: { id: questionId } });
    expect(updated?.status).toBe('answered');
    expect(updated?.answered_at).not.toBeNull();

    const answer = await prisma.questionAnswer.findFirst({
      where: { question_id: questionId },
    });
    expect(answer).not.toBeNull();

    const auditEntry = await prisma.auditLogEntry.findFirst({
      where: {
        action: 'admin_moderation_answered',
        entity_id: questionId,
      },
    });
    expect(auditEntry).not.toBeNull();
  });
});
