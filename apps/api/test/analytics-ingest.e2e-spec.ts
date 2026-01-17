import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';

describe('Analytics Ingest (e2e)', () => {
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
    const hasher = new BcryptHasher();

    await prisma.analyticsEvent.deleteMany();
    await prisma.leadTimelineEvent.deleteMany();
    await prisma.leadIdentity.deleteMany();
    await prisma.lead.deleteMany();
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
        email: 'owner-ingest@example.com',
        password_hash: passwordHash,
        status: 'active',
        roles: {
          create: { role_code: 'owner' },
        },
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: 'owner-ingest@example.com', password })
      .expect(200);

    adminCookie = loginRes.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('ingests events and exposes them in booking funnel', async () => {
    const occurredAt = new Date().toISOString();

    const ingestRes = await request(app.getHttpServer())
      .post('/api/analytics/ingest')
      .send({
        schema_version: '1.0',
        event_name: 'booking_start',
        event_version: 1,
        event_id: 'evt-1',
        occurred_at: occurredAt,
        source: 'web',
        environment: 'dev',
        session_id: 'sess-1',
        anonymous_id: 'anon-1',
        properties: {
          service_slug: 'primary_consultation',
          entry_point: 'direct',
        },
      })
      .expect(201);

    const leadId = ingestRes.body.lead_id;
    expect(leadId).toBeTruthy();

    await request(app.getHttpServer())
      .post('/api/analytics/ingest')
      .send({
        schema_version: '1.0',
        event_name: 'booking_paid',
        event_version: 1,
        event_id: 'evt-2',
        occurred_at: occurredAt,
        source: 'backend',
        environment: 'dev',
        lead_id: leadId,
        properties: {
          service_slug: 'primary_consultation',
          payment_provider: 'yookassa',
          amount: 3000,
          currency: 'RUB',
        },
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/admin/analytics/funnels/booking?range=today&service_slug=primary_consultation')
      .set('Cookie', [adminCookie])
      .expect(200);

    expect(response.body.steps).toEqual([
      { event: 'booking_start', count: 1 },
      { event: 'booking_slot_selected', count: 0 },
      { event: 'booking_paid', count: 1 },
      { event: 'booking_confirmed', count: 0 },
    ]);
  });

  it('deduplicates events by event_id', async () => {
    const occurredAt = new Date().toISOString();

    await request(app.getHttpServer())
      .post('/api/analytics/ingest')
      .send({
        schema_version: '1.0',
        event_name: 'booking_start',
        event_version: 1,
        event_id: 'evt-dup',
        occurred_at: occurredAt,
        source: 'web',
        environment: 'dev',
        session_id: 'sess-dup',
        anonymous_id: 'anon-dup',
        properties: {
          service_slug: 'primary_consultation',
          entry_point: 'direct',
        },
      })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/api/analytics/ingest')
      .send({
        schema_version: '1.0',
        event_name: 'booking_start',
        event_version: 1,
        event_id: 'evt-dup',
        occurred_at: occurredAt,
        source: 'web',
        environment: 'dev',
        session_id: 'sess-dup',
        anonymous_id: 'anon-dup',
        properties: {
          service_slug: 'primary_consultation',
          entry_point: 'direct',
        },
      })
      .expect(201);

    expect(second.body.status).toBe('ignored');

    const count = await prisma.analyticsEvent.count({
      where: { event_id: 'evt-dup' },
    });
    expect(count).toBe(1);
  });
});
