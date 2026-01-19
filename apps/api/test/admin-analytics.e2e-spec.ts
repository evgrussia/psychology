import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';

import { clearDatabase } from './test-utils';

describe('Admin Analytics (e2e)', () => {
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

    await clearDatabase(prisma);

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
        email: 'owner-analytics@example.com',
        password_hash: passwordHash,
        status: 'active',
        roles: {
          create: { role_code: 'owner' },
        },
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: 'owner-analytics@example.com', password })
      .expect(200);

    adminCookie = loginRes.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns booking funnel counts and conversion rates', async () => {
    await prisma.topic.upsert({
      where: { code: 'anxiety' },
      update: {},
      create: { code: 'anxiety', title: 'Anxiety' },
    });

    const leadA = await prisma.lead.create({
      data: {
        status: 'new',
        source: 'booking',
        topic_code: 'anxiety',
      },
    });
    const leadB = await prisma.lead.create({
      data: {
        status: 'new',
        source: 'booking',
        topic_code: 'anxiety',
      },
    });

    const now = new Date();

    await prisma.leadTimelineEvent.createMany({
      data: [
        {
          lead_id: leadA.id,
          event_name: 'booking_start',
          source: 'web',
          occurred_at: now,
          properties: { service_slug: 'primary_consultation' },
        },
        {
          lead_id: leadA.id,
          event_name: 'booking_slot_selected',
          source: 'web',
          occurred_at: now,
          properties: { service_slug: 'primary_consultation' },
        },
        {
          lead_id: leadA.id,
          event_name: 'booking_paid',
          source: 'backend',
          occurred_at: now,
          properties: { service_slug: 'primary_consultation' },
        },
        {
          lead_id: leadB.id,
          event_name: 'booking_start',
          source: 'web',
          occurred_at: now,
          properties: { service_slug: 'primary_consultation' },
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/api/admin/analytics/funnels/booking?range=today&service_slug=primary_consultation')
      .set('Cookie', [adminCookie])
      .expect(200);

    expect(response.body.steps).toEqual([
      { event: 'booking_start', count: 2 },
      { event: 'booking_slot_selected', count: 1 },
      { event: 'booking_paid', count: 1 },
      { event: 'booking_confirmed', count: 0 },
    ]);
    expect(response.body.conversion).toEqual([
      { from: 'booking_start', to: 'booking_slot_selected', rate: 0.5 },
      { from: 'booking_slot_selected', to: 'booking_paid', rate: 1 },
      { from: 'booking_paid', to: 'booking_confirmed', rate: 0 },
    ]);
  });
});
