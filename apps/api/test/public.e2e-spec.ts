import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('PublicController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/public/homepage', () => {
    it('should return homepage data', async () => {
      // Ensure we have some data in the DB
      await prisma.topic.upsert({
        where: { code: 'anxiety' },
        update: { is_active: true },
        create: { code: 'anxiety', title: 'Тревога', is_active: true },
      });

      const response = await request(app.getHttpServer())
        .get('/api/public/homepage')
        .expect(200);

      expect(response.body).toHaveProperty('topics');
      expect(response.body).toHaveProperty('featured_interactives');
      expect(response.body).toHaveProperty('trust_blocks');
      expect(Array.isArray(response.body.topics)).toBe(true);
      expect(response.body.topics.some((t: any) => t.code === 'anxiety')).toBe(true);
    });
  });
});
