import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { InteractiveType, InteractiveStatus } from '@prisma/client';

describe('Interactive Quiz Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public API', () => {
    it('should return published quiz by slug', async () => {
      // Create a published quiz
      const quiz = await prisma.interactiveDefinition.create({
        data: {
          id: 'test-quiz-published',
          interactive_type: InteractiveType.quiz,
          slug: 'test-anxiety',
          title: 'Test Anxiety Quiz',
          status: InteractiveStatus.published,
          definition_json: {
            questions: [
              { id: 'q1', text: 'Question 1', options: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }] },
            ],
            thresholds: [
              { level: 'low', minScore: 0, maxScore: 4 },
            ],
            results: [
              { level: 'low', title: 'Low', description: 'Desc', recommendations: { now: [], week: [] } },
            ],
          },
          published_at: new Date(),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/public/interactive/quizzes/test-anxiety')
        .expect(200);

      expect(response.body).toHaveProperty('id', quiz.id);
      expect(response.body).toHaveProperty('slug', 'test-anxiety');
      expect(response.body).toHaveProperty('status', 'published');

      // Cleanup
      await prisma.interactiveDefinition.delete({ where: { id: quiz.id } });
    });

    it('should return 404 for draft quiz', async () => {
      // Create a draft quiz
      const quiz = await prisma.interactiveDefinition.create({
        data: {
          id: 'test-quiz-draft',
          interactive_type: InteractiveType.quiz,
          slug: 'test-draft',
          title: 'Draft Quiz',
          status: InteractiveStatus.draft,
          definition_json: {
            questions: [
              { id: 'q1', text: 'Question 1', options: [{ value: 0, text: 'No' }] },
            ],
            thresholds: [
              { level: 'low', minScore: 0, maxScore: 4 },
            ],
            results: [
              { level: 'low', title: 'Low', description: 'Desc', recommendations: { now: [], week: [] } },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .get('/api/public/interactive/quizzes/test-draft')
        .expect(404);

      // Cleanup
      await prisma.interactiveDefinition.delete({ where: { id: quiz.id } });
    });

    it('should return 404 for non-existent quiz', async () => {
      await request(app.getHttpServer())
        .get('/api/public/interactive/quizzes/non-existent')
        .expect(404);
    });
  });

  describe('Admin API', () => {
    let quizId: string;
    let authToken: string; // In real app, get from login

    beforeEach(async () => {
      // Create a test quiz
      const quiz = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: InteractiveType.quiz,
          slug: 'admin-test-quiz',
          title: 'Admin Test Quiz',
          status: InteractiveStatus.draft,
          definition_json: {
            questions: [
              { id: 'q1', text: 'Question 1', options: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }] },
            ],
            thresholds: [
              { level: 'low', minScore: 0, maxScore: 4 },
            ],
            results: [
              { level: 'low', title: 'Low', description: 'Desc', recommendations: { now: [], week: [] } },
            ],
          },
        },
      });
      quizId = quiz.id;
      authToken = 'test-token'; // In real app, use proper auth
    });

    afterEach(async () => {
      await prisma.interactiveDefinition.deleteMany({
        where: { id: quizId },
      });
    });

    it('should get quiz by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/admin/interactive/definitions/${quizId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', quizId);
      expect(response.body).toHaveProperty('title', 'Admin Test Quiz');
    });

    it('should update quiz config', async () => {
      const newConfig = {
        questions: [
          { id: 'q1', text: 'Updated Question', options: [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }] },
        ],
        thresholds: [
          { level: 'low', minScore: 0, maxScore: 5 },
        ],
        results: [
          { level: 'low', title: 'Updated Low', description: 'Updated Desc', recommendations: { now: [], week: [] } },
        ],
      };

      await request(app.getHttpServer())
        .put(`/api/admin/interactive/definitions/${quizId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ config: newConfig })
        .expect(200);

      // Verify update
      const updated = await prisma.interactiveDefinition.findUnique({
        where: { id: quizId },
      });
      expect(updated?.definition_json).toMatchObject(newConfig);
    });

    it('should publish quiz', async () => {
      await request(app.getHttpServer())
        .post(`/api/admin/interactive/definitions/${quizId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify published
      const published = await prisma.interactiveDefinition.findUnique({
        where: { id: quizId },
      });
      expect(published?.status).toBe(InteractiveStatus.published);
      expect(published?.published_at).toBeTruthy();
    });

    it('should reject publishing quiz with invalid config', async () => {
      // Update quiz with invalid config (no questions)
      await prisma.interactiveDefinition.update({
        where: { id: quizId },
        data: {
          definition_json: {
            questions: [],
            thresholds: [{ level: 'low', minScore: 0, maxScore: 4 }],
            results: [{ level: 'low', title: 'Low', description: 'Desc', recommendations: { now: [], week: [] } }],
          },
        },
      });

      await request(app.getHttpServer())
        .post(`/api/admin/interactive/definitions/${quizId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
