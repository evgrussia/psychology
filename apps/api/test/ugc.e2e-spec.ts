import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { createTestUser, loginTestUser } from './test-utils';

describe('Public UGC (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.role.upsert({
      where: { code: 'owner' },
      update: {},
      create: { code: 'owner', scope: 'admin' },
    });

    const { user, password } = await createTestUser(prisma, `owner_${Date.now()}@example.com`, 'owner');
    const login = await loginTestUser(app, user.email!, password, 'admin');
    adminCookie = login.cookie;
  });

  afterAll(async () => {
    await app.close();
  });

  it('submits anonymous question, stores encrypted, appears in queue', async () => {
    const questionText = `Мне тревожно последние недели. Что можно сделать? ${Date.now()}`;
    const contactValue = 'user@example.com';

    const response = await request(app.getHttpServer())
      .post('/api/public/ugc/questions')
      .send({ text: questionText, contactValue, publishAllowed: true })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    const questionId = response.body.id as string;

    const record = await prisma.anonymousQuestion.findUnique({ where: { id: questionId } });
    expect(record).toBeTruthy();
    expect(record?.question_text_encrypted).not.toEqual(questionText);
    expect(record?.question_text_encrypted).not.toContain(questionText);
    expect(record?.contact_value_encrypted).not.toEqual(contactValue);

    const listResponse = await request(app.getHttpServer())
      .get('/api/admin/moderation/items?type=anonymous_question')
      .set('Cookie', adminCookie)
      .expect(200);

    const items = listResponse.body.items as Array<{ id: string }>;
    expect(items.some((item) => item.id === questionId)).toBe(true);
  });
});
