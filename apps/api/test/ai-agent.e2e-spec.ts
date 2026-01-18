import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('AI Agent (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns crisis response for crisis text', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/public/ai/next-step')
      .send({
        age_confirmed: true,
        consent_sensitive_text: true,
        free_text: 'Мне кажется, что я не хочу жить',
        answers: {
          intensity: 'acute',
          goal: 'relief',
          time_to_benefit: 'min_1_3',
          support_level: 'self_help',
          safety: 'safe',
        },
      })
      .expect(201);

    expect(response.body.status).toBe('crisis');
    expect(response.body.crisis?.trigger).toBeDefined();
  });

  it('refuses sensitive text without consent', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/public/ai/next-step')
      .send({
        age_confirmed: true,
        consent_sensitive_text: false,
        free_text: 'Мне очень плохо',
        answers: {
          intensity: 'background',
          goal: 'clarity',
          time_to_benefit: 'min_7_10',
          support_level: 'micro_support',
          safety: 'safe',
        },
      })
      .expect(201);

    expect(response.body.status).toBe('refused');
    expect(response.body.refusal_reason).toBe('sensitive_without_consent');
  });

  it('returns ok response for structured concierge request', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/public/ai/concierge')
      .send({
        age_confirmed: true,
        consent_sensitive_text: false,
        answers: {
          goal: 'first_meeting',
          format_preference: 'online',
          urgency: 'flexible',
        },
      })
      .expect(201);

    expect(response.body.status).toBe('ok');
    expect(response.body.message).toBeDefined();
  });
});
