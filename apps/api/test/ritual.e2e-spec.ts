import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import * as cookieParser from 'cookie-parser';

describe('Rituals (e2e)', () => {
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
    await prisma.interactiveDefinition.deleteMany({});
    await prisma.mediaAsset.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.user.deleteMany({});
    // Don't delete topics here to avoid parallel test conflicts
  });

  describe('GET /api/public/interactive/rituals', () => {
    it('should return list of published rituals', async () => {
      const ritualConfig = {
        why: 'Test ritual description',
        steps: [
          { id: 's1', title: 'Step 1', content: 'Content 1', durationSeconds: 10 },
          { id: 's2', title: 'Step 2', content: 'Content 2' },
        ],
        totalDurationSeconds: 120,
      };

      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'ritual',
          slug: 'test-ritual',
          title: 'Test Ritual',
          status: 'published',
          published_at: new Date(),
          definition_json: ritualConfig as any,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/public/interactive/rituals')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].slug).toBe('test-ritual');
      expect(response.body.items[0].config).toHaveProperty('why');
      expect(response.body.items[0].config.steps).toHaveLength(2);
    });

    it('should filter rituals by topic', async () => {
      // Use upsert for topics to avoid conflicts
      await prisma.topic.upsert({
        where: { code: 'anxiety' },
        update: {},
        create: { code: 'anxiety', title: 'Anxiety' },
      });
      await prisma.topic.upsert({
        where: { code: 'stress' },
        update: {},
        create: { code: 'stress', title: 'Stress' },
      });

      await prisma.interactiveDefinition.createMany({
        data: [
          {
            interactive_type: 'ritual',
            slug: 'ritual-anxiety',
            title: 'Anxiety Ritual',
            topic_code: 'anxiety',
            status: 'published',
            published_at: new Date(),
            definition_json: { why: 'For anxiety', steps: [] } as any,
          },
          {
            interactive_type: 'ritual',
            slug: 'ritual-stress',
            title: 'Stress Ritual',
            topic_code: 'stress',
            status: 'published',
            published_at: new Date(),
            definition_json: { why: 'For stress', steps: [] } as any,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/public/interactive/rituals?topic=anxiety')
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].topicCode).toBe('anxiety');
    });

    it('should not return draft rituals', async () => {
      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'ritual',
          slug: 'draft-ritual',
          title: 'Draft Ritual',
          status: 'draft',
          definition_json: { why: 'Draft', steps: [] } as any,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/public/interactive/rituals')
        .expect(200);

      expect(response.body.items).toHaveLength(0);
    });
  });

  describe('GET /api/public/interactive/rituals/:slug', () => {
    it('should return ritual by slug with audio URL if available', async () => {
      // Create a test user first
      const user = await prisma.user.create({
        data: {
          email: 'uploader@example.com',
          display_name: 'Uploader',
        },
      });

      // Create a media asset for audio
      const mediaAsset = await prisma.mediaAsset.create({
        data: {
          storage_provider: 'local_fs',
          object_key: 'audio/test.mp3',
          public_url: 'http://127.0.0.1:3001/media/audio/test.mp3',
          media_type: 'audio',
          mime_type: 'audio/mpeg',
          size_bytes: BigInt(1024),
          uploaded_by_user_id: user.id,
        },
      });

      const ritualConfig = {
        why: 'Test ritual with audio',
        steps: [
          { id: 's1', title: 'Step 1', content: 'Content 1', durationSeconds: 10 },
        ],
        totalDurationSeconds: 60,
        audioMediaAssetId: mediaAsset.id,
      };

      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'ritual',
          slug: 'ritual-with-audio',
          title: 'Ritual With Audio',
          status: 'published',
          published_at: new Date(),
          definition_json: ritualConfig as any,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/public/interactive/rituals/ritual-with-audio')
        .expect(200);

      expect(response.body.slug).toBe('ritual-with-audio');
      expect(response.body.config).toHaveProperty('audioUrl');
      expect(response.body.config.audioUrl).toBe('http://127.0.0.1:3001/media/audio/test.mp3');
    });

    it('should return ritual without audio URL if media asset not found', async () => {
      const ritualConfig = {
        why: 'Test ritual without audio',
        steps: [{ id: 's1', title: 'Step 1', content: 'Content 1' }],
        audioMediaAssetId: '00000000-0000-0000-0000-000000000999', // Non-existent ID
      };

      await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'ritual',
          slug: 'ritual-no-audio',
          title: 'Ritual No Audio',
          status: 'published',
          published_at: new Date(),
          definition_json: ritualConfig as any,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/public/interactive/rituals/ritual-no-audio')
        .expect(200);

      expect(response.body.slug).toBe('ritual-no-audio');
      expect(response.body.config.audioUrl).toBeUndefined();
    });

    it('should return 404 if ritual not found', async () => {
      await request(app.getHttpServer())
        .get('/api/public/interactive/rituals/non-existent')
        .expect(404);
    });
  });

  describe('Ritual Flow (InteractiveRun)', () => {
    it('should create InteractiveRun when ritual is started', async () => {
      const ritualConfig = {
        why: 'Test ritual',
        steps: [{ id: 's1', title: 'Step 1', content: 'Content 1' }],
        totalDurationSeconds: 60,
      };

      const ritual = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'ritual',
          slug: 'test-ritual-flow',
          title: 'Test Ritual Flow',
          status: 'published',
          published_at: new Date(),
          definition_json: ritualConfig as any,
        },
      });

      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'ritual',
          interactive_slug: ritual.slug,
        })
        .expect(201);

      expect(startResponse.body).toHaveProperty('runId');

      const run = await prisma.interactiveRun.findUnique({
        where: { id: startResponse.body.runId },
      });

      expect(run).toBeTruthy();
      expect(run?.interactive_definition_id).toBe(ritual.id);
      expect(run?.completed_at).toBeNull();
    });

    it('should complete InteractiveRun when ritual is finished', async () => {
      const ritualConfig = {
        why: 'Test ritual',
        steps: [{ id: 's1', title: 'Step 1', content: 'Content 1' }],
        totalDurationSeconds: 60,
      };

      const ritual = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'ritual',
          slug: 'test-ritual-complete',
          title: 'Test Ritual Complete',
          status: 'published',
          published_at: new Date(),
          definition_json: ritualConfig as any,
        },
      });

      const startResponse = await request(app.getHttpServer())
        .post('/api/public/interactive/runs')
        .send({
          interactive_type: 'ritual',
          interactive_slug: ritual.slug,
        })
        .expect(201);

      const runId = startResponse.body.runId;
      const durationMs = 120000; // 2 minutes

      await request(app.getHttpServer())
        .post(`/api/public/interactive/runs/${runId}/complete`)
        .send({
          durationMs,
        })
        .expect(204);

      const run = await prisma.interactiveRun.findUnique({
        where: { id: runId },
      });

      expect(run?.completed_at).toBeTruthy();
      expect(run?.duration_ms).toBe(durationMs);
    });
  });
});
