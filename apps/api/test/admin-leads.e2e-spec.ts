import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';

describe('Admin Leads (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminCookie: string;
  let leadId: string;

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

    await prisma.ugcModerationAction.deleteMany();
    await prisma.questionAnswer.deleteMany();
    await prisma.anonymousQuestion.deleteMany();
    await prisma.leadTimelineEvent.deleteMany();
    await prisma.leadIdentity.deleteMany();
    await prisma.leadNote.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.auditLogEntry.deleteMany();
    await prisma.messageTemplateVersion.deleteMany();
    await prisma.messageTemplate.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.leadNote.deleteMany();
    await prisma.leadIdentity.deleteMany();
    await prisma.leadTimelineEvent.deleteMany();
    await prisma.lead.deleteMany();
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
        email: 'owner-leads@example.com',
        password_hash: passwordHash,
        status: 'active',
        roles: {
          create: { role_code: 'owner' },
        },
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: 'owner-leads@example.com', password })
      .expect(200);

    adminCookie = loginRes.headers['set-cookie'][0];

    await prisma.topic.upsert({
      where: { code: 'anxiety' },
      update: {},
      create: { code: 'anxiety', title: 'Anxiety' },
    });

    const lead = await prisma.lead.create({
      data: {
        status: 'new',
        source: 'quiz',
        topic_code: 'anxiety',
      },
    });
    leadId = lead.id;

    await prisma.leadTimelineEvent.create({
      data: {
        lead_id: lead.id,
        event_name: 'complete_quiz',
        source: 'web',
        properties: {
          quiz_slug: 'gad7',
          result_level: 'moderate',
        },
        occurred_at: new Date(),
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists leads and shows timeline', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/api/admin/leads')
      .set('Cookie', [adminCookie])
      .expect(200);

    expect(listRes.body.items.length).toBeGreaterThan(0);
    expect(listRes.body.items[0].id).toBe(leadId);

    const detailRes = await request(app.getHttpServer())
      .get(`/api/admin/leads/${leadId}`)
      .set('Cookie', [adminCookie])
      .expect(200);

    expect(detailRes.body.timelineEvents.length).toBeGreaterThan(0);
    expect(detailRes.body.timelineEvents[0].eventName).toBe('complete_quiz');
  });

  it('updates lead status and writes audit log', async () => {
    await request(app.getHttpServer())
      .post(`/api/admin/leads/${leadId}/status`)
      .set('Cookie', [adminCookie])
      .send({ status: 'engaged' })
      .expect(200);

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    expect(lead?.status).toBe('engaged');

    const auditEntry = await prisma.auditLogEntry.findFirst({
      where: {
        action: 'admin_lead_status_changed',
        entity_id: leadId,
      },
    });
    expect(auditEntry).not.toBeNull();
  });
});
