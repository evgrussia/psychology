import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('Experiments Assignment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    await prisma.experimentAssignment.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('assigns and keeps variant sticky by anonymous_id', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/public/experiments/assign')
      .send({ experiment_id: 'EXP-HP-CTA-01', anonymous_id: 'anon-test-1' })
      .expect(200);

    expect(response.body.variant).toBeTruthy();
    const firstVariant = response.body.variant;

    const repeat = await request(app.getHttpServer())
      .post('/api/public/experiments/assign')
      .send({ experiment_id: 'EXP-HP-CTA-01', anonymous_id: 'anon-test-1' })
      .expect(200);

    expect(repeat.body.variant).toBe(firstVariant);
  });

  it('keeps variant when user_id appears', async () => {
    const initial = await request(app.getHttpServer())
      .post('/api/public/experiments/assign')
      .send({ experiment_id: 'EXP-HP-CTA-01', anonymous_id: 'anon-test-2' })
      .expect(200);

    const stitched = await request(app.getHttpServer())
      .post('/api/public/experiments/assign')
      .send({ experiment_id: 'EXP-HP-CTA-01', anonymous_id: 'anon-test-2', user_id: 'user-test-1' })
      .expect(200);

    expect(stitched.body.variant).toBe(initial.body.variant);
  });
});
