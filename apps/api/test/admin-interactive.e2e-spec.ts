import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';
import * as cookieParser from 'cookie-parser';

describe('Admin Interactive (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let hasher: BcryptHasher;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    hasher = new BcryptHasher();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.ugcModerationAction.deleteMany({});
    await prisma.questionAnswer.deleteMany({});
    await prisma.anonymousQuestion.deleteMany({});
    await prisma.auditLogEntry.deleteMany({});
    await prisma.interactiveRun.deleteMany({});
    await prisma.interactiveDefinition.deleteMany({});
    await prisma.messageTemplateVersion.deleteMany({});
    await prisma.messageTemplate.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});

    await prisma.role.createMany({
      data: [
        { code: 'owner', scope: 'admin' },
        { code: 'assistant', scope: 'admin' },
        { code: 'editor', scope: 'admin' },
      ],
    });
  });

  const loginAsOwner = async () => {
    const password = 'password123';
    const passwordHash = await hasher.hash(password);

    await prisma.user.create({
      data: {
        email: 'owner@example.com',
        password_hash: passwordHash,
        status: 'active',
        roles: {
          create: { role_code: 'owner' },
        },
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: 'owner@example.com', password })
      .expect(200);

    return loginRes.headers['set-cookie'][0];
  };

  it('updates quiz thresholds, publishes, and exposes published config', async () => {
    const cookie = await loginAsOwner();

    const quizDefinition = await prisma.interactiveDefinition.create({
      data: {
        interactive_type: 'quiz',
        slug: 'qz-01-test',
        title: 'QZ-01',
        status: 'draft',
        definition_json: {
          questions: [
            {
              id: 'q1',
              text: 'Test question',
              options: [
                { value: 0, text: 'No' },
                { value: 1, text: 'Yes' },
              ],
            },
          ],
          thresholds: [
            { level: 'low', minScore: 0, maxScore: 4 },
            { level: 'moderate', minScore: 5, maxScore: 9 },
            { level: 'high', minScore: 10, maxScore: 14 },
          ],
          results: [
            { level: 'low', title: 'Low', description: 'Low', recommendations: { now: [], week: [] } },
            { level: 'moderate', title: 'Moderate', description: 'Moderate', recommendations: { now: [], week: [] } },
            { level: 'high', title: 'High', description: 'High', recommendations: { now: [], week: [] } },
          ],
        },
      },
    });

    const updatePayload = {
      config: {
        questions: [
          {
            id: 'q1',
            text: 'Test question',
            options: [
              { value: 0, text: 'No' },
              { value: 1, text: 'Yes' },
            ],
          },
        ],
        thresholds: [
          { level: 'low', minScore: 0, maxScore: 3 },
          { level: 'moderate', minScore: 4, maxScore: 8 },
          { level: 'high', minScore: 9, maxScore: 14 },
        ],
        results: [
          { level: 'low', title: 'Low', description: 'Low', recommendations: { now: [], week: [] } },
          { level: 'moderate', title: 'Moderate', description: 'Moderate', recommendations: { now: [], week: [] } },
          { level: 'high', title: 'High', description: 'High', recommendations: { now: [], week: [] } },
        ],
      },
    };

    await request(app.getHttpServer())
      .put(`/api/admin/interactive/definitions/${quizDefinition.id}`)
      .set('Cookie', [cookie])
      .send(updatePayload)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/admin/interactive/definitions/${quizDefinition.id}/publish`)
      .set('Cookie', [cookie])
      .expect(200);

    const publicResponse = await request(app.getHttpServer())
      .get('/api/public/interactive/quizzes/qz-01-test')
      .expect(200);

    expect(publicResponse.body.config.thresholds).toEqual(updatePayload.config.thresholds);

    const auditEntries = await prisma.auditLogEntry.findMany({
      where: { entity_id: quizDefinition.id },
    });
    const auditActions = auditEntries.map((entry) => entry.action);
    expect(auditActions).toContain('admin_interactive_updated');
    expect(auditActions).toContain('admin_interactive_published');
  });
});
