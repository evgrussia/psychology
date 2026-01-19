import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';
import { BcryptHasher } from '../src/infrastructure/auth/bcrypt-hasher';

describe('Analytics Ingest (e2e)', () => {
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

    await prisma.analyticsEvent.deleteMany();
    await prisma.leadTimelineEvent.deleteMany();
    await prisma.leadNote.deleteMany();
    await prisma.leadIdentity.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.session.deleteMany();
    await prisma.userRole.deleteMany();
    
    // Clean up other potential dependencies of User
    await prisma.questionAnswer.deleteMany();
    await prisma.ugcModerationAction.deleteMany();
    await prisma.anonymousQuestion.deleteMany();
    await prisma.leadNote.deleteMany();
    await prisma.diaryEntry.deleteMany();
    await prisma.interactiveRun.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.contentRevision.deleteMany();
    await prisma.googleCalendarIntegration.deleteMany();
    
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

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
        email: 'owner-ingest@example.com',
        password_hash: passwordHash,
        status: 'active',
        roles: {
          create: { role_code: 'owner' },
        },
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ email: 'owner-ingest@example.com', password })
      .expect(200);

    adminCookie = loginRes.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('ingests events and exposes them in booking funnel', async () => {
    const occurredAt = new Date().toISOString();

    const ingestRes = await request(app.getHttpServer())
      .post('/api/analytics/ingest')
      .send({
        schema_version: '1.0',
        event_name: 'booking_start',
        event_version: 1,
        event_id: 'evt-1',
        occurred_at: occurredAt,
        source: 'web',
        environment: 'dev',
        session_id: 'sess-1',
        anonymous_id: 'anon-1',
        properties: {
          service_slug: 'primary_consultation',
          entry_point: 'direct',
        },
      })
      .expect(201);

    const leadId = ingestRes.body.lead_id;
    expect(leadId).toBeTruthy();

    await request(app.getHttpServer())
      .post('/api/analytics/ingest')
      .send({
        schema_version: '1.0',
        event_name: 'booking_paid',
        event_version: 1,
        event_id: 'evt-2',
        occurred_at: occurredAt,
        source: 'backend',
        environment: 'dev',
        lead_id: leadId,
        properties: {
          service_slug: 'primary_consultation',
          payment_provider: 'yookassa',
          amount: 3000,
          currency: 'RUB',
        },
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/admin/analytics/funnels/booking?range=today&service_slug=primary_consultation')
      .set('Cookie', [adminCookie])
      .expect(200);

    expect(response.body.steps).toEqual([
      { event: 'booking_start', count: 1 },
      { event: 'booking_slot_selected', count: 0 },
      { event: 'booking_paid', count: 1 },
      { event: 'booking_confirmed', count: 0 },
    ]);
  });

  it('deduplicates events by event_id', async () => {
    const occurredAt = new Date().toISOString();

    await request(app.getHttpServer())
      .post('/api/analytics/ingest')
      .send({
        schema_version: '1.0',
        event_name: 'booking_start',
        event_version: 1,
        event_id: 'evt-dup',
        occurred_at: occurredAt,
        source: 'web',
        environment: 'dev',
        session_id: 'sess-dup',
        anonymous_id: 'anon-dup',
        properties: {
          service_slug: 'primary_consultation',
          entry_point: 'direct',
        },
      })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/api/analytics/ingest')
      .send({
        schema_version: '1.0',
        event_name: 'booking_start',
        event_version: 1,
        event_id: 'evt-dup',
        occurred_at: occurredAt,
        source: 'web',
        environment: 'dev',
        session_id: 'sess-dup',
        anonymous_id: 'anon-dup',
        properties: {
          service_slug: 'primary_consultation',
          entry_point: 'direct',
        },
      })
      .expect(201);

    expect(second.body.status).toBe('ignored');

    const count = await prisma.analyticsEvent.count({
      where: { event_id: 'evt-dup' },
    });
    expect(count).toBe(1);
  });

  it('returns interactive details with question funnels and choices', async () => {
    const occurredAt = new Date().toISOString();

    const sendEvent = (payload: Record<string, unknown>) =>
      request(app.getHttpServer())
        .post('/api/analytics/ingest')
        .send(payload)
        .expect(201);

    const startRes = await sendEvent({
      schema_version: '1.0',
      event_name: 'start_quiz',
      event_version: 1,
      event_id: 'evt-int-1',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      session_id: 'sess-int-1',
      anonymous_id: 'anon-int-1',
      properties: {
        quiz_slug: 'anxiety',
        run_id: 'run-1',
      },
    });

    const leadId = startRes.body.lead_id;

    await sendEvent({
      schema_version: '1.0',
      event_name: 'quiz_question_completed',
      event_version: 1,
      event_id: 'evt-int-2',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      lead_id: leadId,
      properties: {
        quiz_slug: 'anxiety',
        question_index: 1,
        run_id: 'run-1',
      },
    });

    await sendEvent({
      schema_version: '1.0',
      event_name: 'quiz_question_completed',
      event_version: 1,
      event_id: 'evt-int-3',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      lead_id: leadId,
      properties: {
        quiz_slug: 'anxiety',
        question_index: 2,
        run_id: 'run-1',
      },
    });

    await sendEvent({
      schema_version: '1.0',
      event_name: 'complete_quiz',
      event_version: 1,
      event_id: 'evt-int-4',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      lead_id: leadId,
      properties: {
        quiz_slug: 'anxiety',
        result_level: 'moderate',
        duration_ms: 120000,
        run_id: 'run-1',
      },
    });

    await sendEvent({
      schema_version: '1.0',
      event_name: 'start_quiz',
      event_version: 1,
      event_id: 'evt-int-5',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      session_id: 'sess-int-2',
      anonymous_id: 'anon-int-2',
      lead_id: leadId,
      properties: {
        quiz_slug: 'anxiety',
        run_id: 'run-2',
      },
    });

    await sendEvent({
      schema_version: '1.0',
      event_name: 'quiz_question_completed',
      event_version: 1,
      event_id: 'evt-int-6',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      lead_id: leadId,
      properties: {
        quiz_slug: 'anxiety',
        question_index: 1,
        run_id: 'run-2',
      },
    });

    await sendEvent({
      schema_version: '1.0',
      event_name: 'quiz_abandoned',
      event_version: 1,
      event_id: 'evt-int-7',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      lead_id: leadId,
      properties: {
        quiz_slug: 'anxiety',
        abandoned_at_question: 2,
        run_id: 'run-2',
      },
    });

    await sendEvent({
      schema_version: '1.0',
      event_name: 'navigator_step_completed',
      event_version: 1,
      event_id: 'evt-int-8',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      lead_id: leadId,
      properties: {
        navigator_slug: 'stress',
        step_index: 1,
        choice_id: 'choice_a',
        run_id: 'nav-1',
      },
    });

    await sendEvent({
      schema_version: '1.0',
      event_name: 'navigator_step_completed',
      event_version: 1,
      event_id: 'evt-int-9',
      occurred_at: occurredAt,
      source: 'web',
      environment: 'dev',
      lead_id: leadId,
      properties: {
        navigator_slug: 'stress',
        step_index: 1,
        choice_id: 'choice_b',
        run_id: 'nav-2',
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/admin/analytics/interactive?range=today')
      .set('Cookie', [adminCookie])
      .expect(200);

    const quiz = response.body.quizzes.find((item: any) => item.quiz_slug === 'anxiety');
    expect(quiz).toBeTruthy();
    expect(quiz.starts).toBe(2);
    expect(quiz.completes).toBe(1);
    expect(quiz.completion_rate).toBeCloseTo(0.5);

    expect(quiz.questions).toEqual([
      { question_index: 1, count: 2 },
      { question_index: 2, count: 1 },
    ]);
    expect(quiz.abandonments).toEqual([{ abandoned_at_question: 2, count: 1 }]);

    const navigator = response.body.navigators.find((item: any) => item.navigator_slug === 'stress');
    expect(navigator).toBeTruthy();
    expect(navigator.steps[0].step_index).toBe(1);
    expect(navigator.steps[0].total).toBe(2);
  });
});
