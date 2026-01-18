import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import * as cookieParser from 'cookie-parser';

describe('Navigator (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.interactiveRun.deleteMany({});
    await prisma.interactiveDefinitionVersion.deleteMany({});
    await prisma.interactiveDefinition.deleteMany({});
    await prisma.topic.deleteMany({});
  });

  describe('GET /api/public/interactive/navigators/:slug', () => {
    it('should return navigator definition by slug', async () => {
      const config = {
        initial_step_id: 'step_1',
        steps: [
          {
            step_id: 'step_1',
            question_text: 'Q1',
            choices: [
              { choice_id: 'c1', text: 'To res', next_step_id: null, result_profile_id: 'res_1' },
            ],
          },
        ],
        result_profiles: [
          { id: 'res_1', title: 'R1', description: 'D1', recommendations: { now: [], week: [] } },
        ],
      };

      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'navigator',
          slug: 'test-nav',
          title: 'Test Navigator',
          status: 'published',
          published_at: new Date(),
          definition_json: config as any,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/public/interactive/navigators/test-nav')
        .expect(200);

      expect(response.body).toHaveProperty('definition');
      expect(response.body.definition.initial_step_id).toBe('step_1');
      expect(response.body.definition.steps).toHaveLength(1);
    });

    it('should return 404 if navigator not found', async () => {
      await request(app.getHttpServer())
        .get('/api/public/interactive/navigators/non-existent')
        .expect(404);
    });
  });

  describe('Navigator Flow', () => {
    it('should complete a navigator run', async () => {
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'navigator',
          slug: 'test-nav',
          title: 'Test Navigator',
          status: 'published',
          published_at: new Date(),
        },
      });

      // 1. Start run
      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'navigator',
          interactive_slug: 'test-nav',
          anonymousId: 'anon-123',
        })
        .expect(201);

      const runId = startResponse.body.runId;

      // 2. Complete run
      const completePayload = {
        resultProfile: 'res_1',
        durationMs: 50000,
        crisisTriggered: true,
        crisisTriggerType: 'navigator_trigger',
      };

      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${runId}/complete`)
        .send(completePayload)
        .expect(204);

      // 3. Verify in DB
      const run = await prisma.interactiveRun.findUnique({
        where: { id: runId },
      });

      expect(run?.result_profile).toBe('res_1');
      expect(run?.duration_ms).toBe(50000);
      expect(run?.crisis_triggered).toBe(true);
      expect(run?.crisis_trigger_type).toBe('navigator_trigger');
    });

    it('should save crisis trigger type when crisis is triggered', async () => {
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'navigator',
          slug: 'test-nav-crisis',
          title: 'Test Navigator Crisis',
          status: 'published',
          published_at: new Date(),
        },
      });

      // 1. Start run
      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'navigator',
          interactive_slug: 'test-nav-crisis',
          anonymousId: 'anon-456',
        })
        .expect(201);

      const runId = startResponse.body.runId;

      // 2. Complete run with crisis
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${runId}/complete`)
        .send({
          resultProfile: 'res_1',
          durationMs: 60000,
          crisisTriggered: true,
          crisisTriggerType: 'panic_like',
        })
        .expect(204);

      // 3. Verify crisis data in DB
      const run = await prisma.interactiveRun.findUnique({
        where: { id: runId },
      });

      expect(run?.crisis_triggered).toBe(true);
      expect(run?.crisis_trigger_type).toBe('panic_like');
    });

    it('should not save crisis trigger type when crisis is not triggered', async () => {
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'navigator',
          slug: 'test-nav-no-crisis',
          title: 'Test Navigator No Crisis',
          status: 'published',
          published_at: new Date(),
        },
      });

      // 1. Start run
      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'navigator',
          interactive_slug: 'test-nav-no-crisis',
          anonymousId: 'anon-789',
        })
        .expect(201);

      const runId = startResponse.body.runId;

      // 2. Complete run without crisis
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${runId}/complete`)
        .send({
          resultProfile: 'res_1',
          durationMs: 70000,
          crisisTriggered: false,
        })
        .expect(204);

      // 3. Verify no crisis data in DB
      const run = await prisma.interactiveRun.findUnique({
        where: { id: runId },
      });

      expect(run?.crisis_triggered).toBe(false);
      expect(run?.crisis_trigger_type).toBeNull();
    });

    it('should not accept choice texts in complete payload (security AC-2)', async () => {
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'navigator',
          slug: 'test-nav-security',
          title: 'Test Navigator Security',
          status: 'published',
          published_at: new Date(),
        },
      });

      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'navigator',
          interactive_slug: 'test-nav-security',
          anonymousId: 'anon-security',
        })
        .expect(201);

      const runId = startResponse.body.runId;

      // Attempt to send choice text (should be rejected or ignored)
      const maliciousPayload = {
        resultProfile: 'res_1',
        durationMs: 50000,
        crisisTriggered: false,
        choice_text: 'Malicious text attempt', // Should not be accepted
        question_text: 'Another text attempt', // Should not be accepted
      };

      // The API should accept the request but ignore/not store the text fields
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${runId}/complete`)
        .send(maliciousPayload)
        .expect(204);

      // Verify that texts were not stored in DB
      const run = await prisma.interactiveRun.findUnique({
        where: { id: runId },
      });

      expect(run?.result_profile).toBe('res_1');
      // Verify no text fields in the run object (they should not be in schema, but double-check)
      const runJson = JSON.stringify(run);
      expect(runJson).not.toContain('Malicious text attempt');
      expect(runJson).not.toContain('Another text attempt');
    });
  });
});
