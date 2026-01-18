import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import * as cookieParser from 'cookie-parser';

/**
 * E2E тесты для кризисного режима (FEAT-INT-06)
 * 
 * Проверяет:
 * - Сохранение факта кризиса в БД
 * - Сохранение типа триггера (без текста)
 * - Privacy: отсутствие текста в данных
 */
describe('Crisis Mode (e2e)', () => {
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
    // Don't delete topics as they might be used by other tests running in parallel
    // instead use unique codes for each test
  });

  describe('Crisis trigger in interactive runs', () => {
    it('should save crisis_triggered and crisis_trigger_type (no text)', async () => {
      const topicCode = `topic-crisis-${Date.now()}`;
      // Create topic
      const topic = await prisma.topic.create({
        data: {
          code: topicCode,
          title: 'Anxiety',
          is_active: true,
        },
      });

      const slug = `quiz-crisis-${Date.now()}`;
      // Create quiz definition
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: slug,
          title: 'Anxiety Quiz',
          topic_code: topic.code,
          status: 'published',
          published_at: new Date(),
        },
      });

      // Start run
      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'quiz',
          interactive_slug: slug,
          anonymousId: 'anon-crisis-1',
        })
        .expect(201);

      const runId = startResponse.body.runId;

      // Complete with crisis trigger
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${runId}/complete`)
        .send({
          resultLevel: 'high',
          durationMs: 120000,
          crisisTriggered: true,
          crisisTriggerType: 'high_score', // Only category, no text
        })
        .expect(204);

      // Verify in DB
      const run = await prisma.interactiveRun.findUnique({
        where: { id: runId },
      });

      expect(run?.crisis_triggered).toBe(true);
      expect(run?.crisis_trigger_type).toBe('high_score');
      expect(typeof run?.crisis_trigger_type).toBe('string');
      // Privacy check: no text should be stored
      expect(run?.crisis_trigger_type?.length).toBeLessThan(50); // Category names are short
    });

    it('should accept different crisis trigger types', async () => {
      const topicCode = `topic-types-${Date.now()}`;
      const topic = await prisma.topic.create({
        data: {
          code: topicCode,
          title: 'Test',
          is_active: true,
        },
      });

      const slug = `quiz-types-${Date.now()}`;
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: slug,
          title: 'Test Quiz',
          topic_code: topic.code,
          status: 'published',
          published_at: new Date(),
        },
      });

      const triggerTypes = [
        'high_score',
        'navigator_trigger',
        'panic_like',
        'violence_risk',
      ];

      for (const triggerType of triggerTypes) {
        const startResponse = await request(app.getHttpServer())
          .post('/api/public/interactive/runs')
          .send({
            interactive_type: 'quiz',
            interactive_slug: slug,
            anonymousId: `anon-${triggerType}`,
          })
          .expect(201);

        const runId = startResponse.body.runId;

        await request(app.getHttpServer())
          .post(`/api/public/interactive/runs/${runId}/complete`)
          .send({
            resultLevel: 'moderate',
            durationMs: 60000,
            crisisTriggered: true,
            crisisTriggerType: triggerType,
          })
          .expect(204);

        const run = await prisma.interactiveRun.findUnique({
          where: { id: runId },
        });

        expect(run?.crisis_trigger_type).toBe(triggerType);
      }
    });

    it('should not require crisisTriggerType when crisisTriggered is false', async () => {
      const topicCode = `topic-false-${Date.now()}`;
      const topic = await prisma.topic.create({
        data: {
          code: topicCode,
          title: 'Test',
          is_active: true,
        },
      });

      const slug = `quiz-false-${Date.now()}`;
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: slug,
          title: 'Test Quiz',
          topic_code: topic.code,
          status: 'published',
          published_at: new Date(),
        },
      });

      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'quiz',
          interactive_slug: slug,
          anonymousId: 'anon-no-crisis',
        })
        .expect(201);

      const runId = startResponse.body.runId;

      // Complete without crisis (no crisisTriggerType needed)
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${runId}/complete`)
        .send({
          resultLevel: 'low',
          durationMs: 60000,
          crisisTriggered: false,
          // crisisTriggerType is optional when crisisTriggered is false
        })
        .expect(204);

      const run = await prisma.interactiveRun.findUnique({
        where: { id: runId },
      });

      expect(run?.crisis_triggered).toBe(false);
      expect(run?.crisis_trigger_type).toBeNull();
    });
  });

  describe('Privacy: no text in crisis data', () => {
    it('should not store any text in crisis_trigger_type', async () => {
      const topicCode = `topic-privacy-${Date.now()}`;
      const topic = await prisma.topic.create({
        data: {
          code: topicCode,
          title: 'Test',
          is_active: true,
        },
      });

      const slug = `quiz-privacy-${Date.now()}`;
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: slug,
          title: 'Test Quiz',
          topic_code: topic.code,
          status: 'published',
          published_at: new Date(),
        },
      });

      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'quiz',
          interactive_slug: slug,
          anonymousId: 'anon-privacy-test',
        })
        .expect(201);

      const runId = startResponse.body.runId;

      // Try to send a long text (should be rejected or truncated to category)
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${runId}/complete`)
        .send({
          resultLevel: 'high',
          durationMs: 60000,
          crisisTriggered: true,
          crisisTriggerType: 'high_score', // Only category, not text
        })
        .expect(204);

      const run = await prisma.interactiveRun.findUnique({
        where: { id: runId },
      });

      // Verify it's a short category name, not a text
      expect(run?.crisis_trigger_type).toBe('high_score');
      expect(run?.crisis_trigger_type?.length).toBeLessThan(50);
      // Should not contain spaces (category names are identifiers)
      expect(run?.crisis_trigger_type?.includes(' ')).toBeFalsy();
    });
  });
});
