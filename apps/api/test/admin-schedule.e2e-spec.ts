import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';

import { clearDatabase } from './test-utils';

describe('Admin Schedule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminCookie: string;
  let serviceSlug: string;
  let serviceId: string;

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
        email: 'owner-schedule@example.com',
        password_hash: passwordHash,
        status: 'active',
        roles: {
          create: { role_code: 'owner' },
        },
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: 'owner-schedule@example.com', password })
      .expect(200);

    adminCookie = loginRes.headers['set-cookie'][0];

    const service = await prisma.service.create({
      data: {
        slug: `service-${Date.now()}`,
        title: 'Консультация',
        description_markdown: 'Описание',
        format: 'online',
        duration_minutes: 50,
        price_amount: 3000,
        status: 'published',
      },
    });
    serviceSlug = service.slug;
    serviceId = service.id;

  });

  afterAll(async () => {
    await app.close();
  });

  it('creates slot and exposes it in public booking API', async () => {
    const startAtUtc = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const endAtUtc = new Date(startAtUtc.getTime() + 50 * 60 * 1000);

    await request(app.getHttpServer())
      .post('/api/admin/schedule/slots')
      .set('Cookie', [adminCookie])
      .send({
        slots: [
          {
            start_at_utc: startAtUtc.toISOString(),
            end_at_utc: endAtUtc.toISOString(),
            service_id: serviceId,
          },
        ],
      })
      .expect(201);

    const from = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const to = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

    const response = await request(app.getHttpServer())
      .get(`/api/public/booking/slots?service_slug=${serviceSlug}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&tz=Europe/Moscow`)
      .expect(200);

    expect(response.body.status).toBe('available');
    expect(response.body.slots.length).toBeGreaterThan(0);
  });
});
