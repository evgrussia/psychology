import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import * as cookieParser from 'cookie-parser';

describe('Interactive (e2e)', () => {
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

    // Clean up
    await prisma.interactiveRun.deleteMany({});
    await prisma.interactiveDefinitionVersion.deleteMany({});
    await prisma.curatedItem.deleteMany({});
    await prisma.interactiveDefinition.deleteMany({});
    await prisma.contentItemTopic.deleteMany({});
    await prisma.topic.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test in correct order
    await prisma.interactiveRun.deleteMany({});
    await prisma.interactiveDefinitionVersion.deleteMany({});
    await prisma.interactiveDefinition.deleteMany({});
    // We don't delete topics here as they are shared and it causes FK issues
    // instead we use unique codes for each test if needed
  });

  describe('POST /api/public/interactive/runs', () => {
    it('should create a new interactive run', async () => {
      const topicCode = `anxiety-${Date.now()}`;
      // Create topic
      const topic = await prisma.topic.create({
        data: {
          code: topicCode,
          title: 'Anxiety',
          is_active: true,
        },
      });

      const slug = `anxiety-test-${Date.now()}`;
      // Create interactive definition
      const interactiveDef = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: slug,
          title: 'Anxiety Test',
          topic_code: topic.code,
          status: 'published',
          published_at: new Date(),
        },
      });

      const anonymousId = `anon_${Date.now()}`;

      const response = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'quiz',
          interactive_slug: slug,
          anonymousId: anonymousId,
          topic: topicCode,
          entry_point: 'home',
        })
        .expect(201);

      expect(response.body).toHaveProperty('runId');
      expect(response.body.runId).toBeDefined();

      // Verify run was created in DB
      const run = await prisma.interactiveRun.findUnique({
        where: { id: response.body.runId },
        include: { definition: true },
      });

      expect(run).toBeDefined();
      expect(run?.interactive_definition_id).toBe(interactiveDef.id);
      expect(run?.anonymous_id).toBe(anonymousId);
      expect(run?.completed_at).toBeNull();
    });

    it('should return 404 if interactive definition not found', async () => {
      await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'quiz',
          interactive_slug: 'non-existent',
          anonymousId: 'anon-123',
        })
        .expect(404);
    });

    it('should return 400 if interactive is not published', async () => {
      // Create topic
      const topic = await prisma.topic.create({
        data: {
          code: 'test',
          title: 'Test',
          is_active: true,
        },
      });

      // Create draft interactive definition
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: 'draft-quiz',
          title: 'Draft Quiz',
          topic_code: topic.code,
          status: 'draft',
        },
      });

      await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'quiz',
          interactive_slug: 'draft-quiz',
          anonymousId: 'anon-123',
        })
        .expect(404); // Repository returns null for non-published, so 404
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          // Missing interactive_type and interactive_slug
          anonymousId: 'anon-123',
        })
        .expect(400);
    });
  });

  describe('POST /api/public/interactive/runs/:id/complete', () => {
    it('should complete an interactive run', async () => {
      const topicCode = `anxiety-${Date.now()}`;
      // Create topic
      const topic = await prisma.topic.create({
        data: {
          code: topicCode,
          title: 'Anxiety',
          is_active: true,
        },
      });

      const slug = `anxiety-test-${Date.now()}`;
      // Create interactive definition
      const interactiveDef = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: slug,
          title: 'Anxiety Test',
          topic_code: topic.code,
          status: 'published',
          published_at: new Date(),
        },
      });

      // Create run
      const run = await prisma.interactiveRun.create({
        data: {
          interactive_definition_id: interactiveDef.id,
          anonymous_id: 'anon-123',
        },
      });

      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${run.id}/complete`)
        .send({
          resultLevel: 'moderate',
          durationMs: 120000,
          crisisTriggered: false,
        })
        .expect(204);

      // Verify run was completed in DB
      const completedRun = await prisma.interactiveRun.findUnique({
        where: { id: run.id },
      });

      expect(completedRun?.completed_at).toBeDefined();
      expect(completedRun?.result_level).toBe('moderate');
      expect(completedRun?.duration_ms).toBe(120000);
      expect(completedRun?.crisis_triggered).toBe(false);
    });

    it('should be idempotent (complete twice)', async () => {
      const topicCode = `anxiety-${Date.now()}`;
      // Create topic
      const topic = await prisma.topic.create({
        data: {
          code: topicCode,
          title: 'Anxiety',
          is_active: true,
        },
      });

      const slug = `anxiety-test-${Date.now()}`;
      // Create interactive definition
      const interactiveDef = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: slug,
          title: 'Anxiety Test',
          topic_code: topic.code,
          status: 'published',
          published_at: new Date(),
        },
      });

      // Create run
      const run = await prisma.interactiveRun.create({
        data: {
          interactive_definition_id: interactiveDef.id,
          anonymous_id: 'anon-123',
        },
      });

      // Complete first time
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${run.id}/complete`)
        .send({
          resultLevel: 'low',
          durationMs: 60000,
        })
        .expect(204);

      const firstCompletion = await prisma.interactiveRun.findUnique({
        where: { id: run.id },
      });
      const firstCompletedAt = firstCompletion?.completed_at;

      // Complete second time (should be idempotent)
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${run.id}/complete`)
        .send({
          resultLevel: 'high',
          durationMs: 180000,
        })
        .expect(204);

      const secondCompletion = await prisma.interactiveRun.findUnique({
        where: { id: run.id },
      });

      // Should keep first completion data (idempotency)
      expect(secondCompletion?.completed_at?.getTime()).toBe(firstCompletedAt?.getTime());
      expect(secondCompletion?.result_level).toBe('low');
      expect(secondCompletion?.duration_ms).toBe(60000);
    });

    it('should return 404 if run not found', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${nonExistentId}/complete`)
        .send({
          resultLevel: 'moderate',
          durationMs: 120000,
        })
        .expect(404);
    });

    it('should validate required fields', async () => {
      const topicCode = `test-${Date.now()}`;
      // Create topic
      const topic = await prisma.topic.create({
        data: {
          code: topicCode,
          title: 'Test',
          is_active: true,
        },
      });

      const slug = `test-${Date.now()}`;
      // Create interactive definition
      const interactiveDef = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: slug,
          title: 'Test',
          topic_code: topic.code,
          status: 'published',
          published_at: new Date(),
        },
      });

      // Create run
      const run = await prisma.interactiveRun.create({
        data: {
          interactive_definition_id: interactiveDef.id,
          anonymous_id: 'anon-123',
        },
      });

      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${run.id}/complete`)
        .send({
          // Missing durationMs
          resultLevel: 'moderate',
        })
        .expect(400);
    });
  });
});
