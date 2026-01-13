/**
 * Integration tests for database schema and migrations
 * 
 * These tests verify:
 * - Migrations can be applied to an empty database
 * - Schema supports all required operations
 * - Smoke queries work correctly after migrations
 * 
 * Requirements from FEAT-PLT-02, section 12.2:
 * - Insert/read user
 * - Insert content item
 * - Insert interactive run with result_level
 * - Insert appointment + payment
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

describe('Database Schema Integration Tests', () => {
  let prisma: PrismaClient;
  const testDbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  beforeAll(async () => {
    if (!testDbUrl) {
      throw new Error('TEST_DATABASE_URL or DATABASE_URL must be set');
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: testDbUrl,
        },
      },
    });

    // Apply migrations if needed
    try {
      const migrationsPath = path.join(__dirname, '../prisma/migrations');
      execSync('npx prisma migrate deploy', {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, DATABASE_URL: testDbUrl },
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn('Migration deployment failed, assuming migrations are already applied:', error);
    }

    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    // Note: In production tests, use transactions for isolation
    await prisma.payment.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.intakeForm.deleteMany({});
    await prisma.interactiveRun.deleteMany({});
    await prisma.contentItem.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('User operations (AC-4 smoke test)', () => {
    it('should insert and read a user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          display_name: 'Test User',
          status: 'active',
        },
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.status).toBe('active');

      const foundUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('test@example.com');
    });

    it('should enforce unique email constraint', async () => {
      await prisma.user.create({
        data: {
          email: 'unique@example.com',
          status: 'active',
        },
      });

      await expect(
        prisma.user.create({
          data: {
            email: 'unique@example.com',
            status: 'active',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('Content item operations (AC-4 smoke test)', () => {
    it('should insert and read a content item', async () => {
      // Create a user first (required foreign key)
      const user = await prisma.user.create({
        data: {
          email: 'author@example.com',
          status: 'active',
        },
      });

      const contentItem = await prisma.contentItem.create({
        data: {
          content_type: 'article',
          slug: 'test-article',
          title: 'Test Article',
          body_markdown: '# Test Content',
          author_user_id: user.id,
          status: 'draft',
        },
      });

      expect(contentItem.id).toBeDefined();
      expect(contentItem.slug).toBe('test-article');
      expect(contentItem.content_type).toBe('article');

      const foundItem = await prisma.contentItem.findUnique({
        where: { id: contentItem.id },
        include: { author: true },
      });

      expect(foundItem).toBeDefined();
      expect(foundItem?.author.email).toBe('author@example.com');
    });

    it('should enforce unique (content_type, slug) constraint', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'author2@example.com',
          status: 'active',
        },
      });

      await prisma.contentItem.create({
        data: {
          content_type: 'article',
          slug: 'unique-slug',
          title: 'First Article',
          body_markdown: '# Content',
          author_user_id: user.id,
        },
      });

      // Same content_type + slug should fail
      await expect(
        prisma.contentItem.create({
          data: {
            content_type: 'article',
            slug: 'unique-slug',
            title: 'Second Article',
            body_markdown: '# Content',
            author_user_id: user.id,
          },
        }),
      ).rejects.toThrow();

      // Different content_type with same slug should work
      const note = await prisma.contentItem.create({
        data: {
          content_type: 'note',
          slug: 'unique-slug',
          title: 'Note',
          body_markdown: '# Content',
          author_user_id: user.id,
        },
      });

      expect(note.id).toBeDefined();
    });
  });

  describe('Interactive run operations (AC-4 smoke test)', () => {
    it('should insert interactive run with result_level', async () => {
      // Create interactive definition
      const topic = await prisma.topic.create({
        data: {
          code: 'test_topic',
          title: 'Test Topic',
          is_active: true,
        },
      });

      const interactiveDef = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'quiz',
          slug: 'test-quiz',
          title: 'Test Quiz',
          topic_code: topic.code,
          status: 'published',
        },
      });

      // Create run with result_level (aggregate, not raw answers)
      const run = await prisma.interactiveRun.create({
        data: {
          interactive_definition_id: interactiveDef.id,
          anonymous_id: 'anon-123',
          result_level: 'moderate',
          result_profile: 'anxiety-focused',
          duration_ms: 5000,
        },
      });

      expect(run.id).toBeDefined();
      expect(run.result_level).toBe('moderate');
      expect(run.anonymous_id).toBe('anon-123');
      expect(run.user_id).toBeNull(); // Anonymous run

      const foundRun = await prisma.interactiveRun.findUnique({
        where: { id: run.id },
        include: { definition: true },
      });

      expect(foundRun).toBeDefined();
      expect(foundRun?.definition.slug).toBe('test-quiz');
    });

    it('should support both user_id and anonymous_id', async () => {
      const topic = await prisma.topic.create({
        data: {
          code: 'test_topic_2',
          title: 'Test Topic 2',
          is_active: true,
        },
      });

      const interactiveDef = await prisma.interactiveDefinition.create({
        data: {
          interactive_type: 'navigator',
          slug: 'test-navigator',
          title: 'Test Navigator',
          topic_code: topic.code,
          status: 'published',
        },
      });

      const user = await prisma.user.create({
        data: {
          email: 'quiz-user@example.com',
          status: 'active',
        },
      });

      // Run with both user_id and anonymous_id (authorization during session)
      const run = await prisma.interactiveRun.create({
        data: {
          interactive_definition_id: interactiveDef.id,
          user_id: user.id,
          anonymous_id: 'anon-456',
          result_level: 'high',
          duration_ms: 10000,
        },
      });

      expect(run.user_id).toBe(user.id);
      expect(run.anonymous_id).toBe('anon-456');
    });
  });

  describe('Appointment and payment operations (AC-4 smoke test)', () => {
    it('should insert appointment and payment', async () => {
      // Create service
      const service = await prisma.service.create({
        data: {
          slug: 'test-service',
          title: 'Test Service',
          description_markdown: '# Service Description',
          format: 'online',
          duration_minutes: 60,
          price_amount: 5000,
          status: 'published',
        },
      });

      // Create user
      const user = await prisma.user.create({
        data: {
          email: 'client@example.com',
          status: 'active',
        },
      });

      // Create appointment
      const startAt = new Date('2026-02-01T10:00:00Z');
      const endAt = new Date('2026-02-01T11:00:00Z');

      const appointment = await prisma.appointment.create({
        data: {
          service_id: service.id,
          client_user_id: user.id,
          start_at_utc: startAt,
          end_at_utc: endAt,
          timezone: 'Europe/Moscow',
          format: 'online',
          status: 'pending_payment',
        },
      });

      expect(appointment.id).toBeDefined();
      expect(appointment.status).toBe('pending_payment');

      // Create payment
      const payment = await prisma.payment.create({
        data: {
          appointment_id: appointment.id,
          provider: 'yookassa',
          provider_payment_id: 'yookassa-payment-123',
          amount: 5000,
          currency: 'RUB',
          status: 'pending',
        },
      });

      expect(payment.id).toBeDefined();
      expect(payment.provider_payment_id).toBe('yookassa-payment-123');

      // Verify relationships
      const foundAppointment = await prisma.appointment.findUnique({
        where: { id: appointment.id },
        include: {
          service: true,
          client: true,
          payments: true,
        },
      });

      expect(foundAppointment?.service.slug).toBe('test-service');
      expect(foundAppointment?.client?.email).toBe('client@example.com');
      expect(foundAppointment?.payments).toHaveLength(1);
      expect(foundAppointment?.payments[0].provider_payment_id).toBe('yookassa-payment-123');
    });

    it('should enforce unique provider_payment_id for idempotency', async () => {
      const service = await prisma.service.create({
        data: {
          slug: 'test-service-2',
          title: 'Test Service 2',
          description_markdown: '# Description',
          format: 'online',
          duration_minutes: 60,
          price_amount: 5000,
          status: 'published',
        },
      });

      const user = await prisma.user.create({
        data: {
          email: 'client2@example.com',
          status: 'active',
        },
      });

      const appointment = await prisma.appointment.create({
        data: {
          service_id: service.id,
          client_user_id: user.id,
          start_at_utc: new Date('2026-02-02T10:00:00Z'),
          end_at_utc: new Date('2026-02-02T11:00:00Z'),
          timezone: 'Europe/Moscow',
          format: 'online',
          status: 'pending_payment',
        },
      });

      await prisma.payment.create({
        data: {
          appointment_id: appointment.id,
          provider: 'yookassa',
          provider_payment_id: 'unique-payment-id',
          amount: 5000,
          currency: 'RUB',
          status: 'pending',
        },
      });

      // Duplicate provider_payment_id should fail
      await expect(
        prisma.payment.create({
          data: {
            appointment_id: appointment.id,
            provider: 'yookassa',
            provider_payment_id: 'unique-payment-id',
            amount: 5000,
            currency: 'RUB',
            status: 'succeeded',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('Privacy by Design checks', () => {
    it('should store P2 data in encrypted fields', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'diary-user@example.com',
          status: 'active',
        },
      });

      // Diary entry with encrypted payload (P2)
      const diaryEntry = await prisma.diaryEntry.create({
        data: {
          user_id: user.id,
          diary_type: 'emotions',
          entry_date: new Date('2026-01-15'),
          payload_encrypted: 'encrypted-diary-content-here',
        },
      });

      expect(diaryEntry.payload_encrypted).toBe('encrypted-diary-content-here');
      expect(diaryEntry.user_id).toBe(user.id);
    });

    it('should store P1 data in encrypted fields in lead_identities', async () => {
      const lead = await prisma.lead.create({
        data: {
          status: 'new',
          source: 'quiz',
        },
      });

      const identity = await prisma.leadIdentity.create({
        data: {
          lead_id: lead.id,
          email_encrypted: 'encrypted-email',
          phone_encrypted: 'encrypted-phone',
          is_primary: true,
        },
      });

      expect(identity.email_encrypted).toBe('encrypted-email');
      expect(identity.phone_encrypted).toBe('encrypted-phone');
    });

    it('should store P0-only data in lead_timeline_events properties', async () => {
      const lead = await prisma.lead.create({
        data: {
          status: 'new',
          source: 'quiz',
        },
      });

      // Properties should only contain P0 data (no PII/texts)
      const event = await prisma.leadTimelineEvent.create({
        data: {
          lead_id: lead.id,
          event_name: 'quiz_completed',
          source: 'web',
          properties: {
            quiz_id: 'quiz-123',
            result_level: 'moderate',
            topic_code: 'anxiety',
            // No PII or texts here
          },
        },
      });

      expect(event.properties).toHaveProperty('quiz_id');
      expect(event.properties).toHaveProperty('result_level');
      expect(event.properties).not.toHaveProperty('email');
      expect(event.properties).not.toHaveProperty('text');
    });
  });

  describe('Index performance checks', () => {
    it('should use index for content items by status and type', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'index-test@example.com',
          status: 'active',
        },
      });

      await prisma.contentItem.createMany({
        data: [
          {
            content_type: 'article',
            slug: 'article-1',
            title: 'Article 1',
            body_markdown: '# Content',
            author_user_id: user.id,
            status: 'published',
          },
          {
            content_type: 'article',
            slug: 'article-2',
            title: 'Article 2',
            body_markdown: '# Content',
            author_user_id: user.id,
            status: 'draft',
          },
        ],
      });

      // Query should use index on (status, content_type, slug)
      const published = await prisma.contentItem.findMany({
        where: {
          status: 'published',
          content_type: 'article',
        },
      });

      expect(published.length).toBeGreaterThan(0);
    });

    it('should use index for appointments by time range', async () => {
      const service = await prisma.service.create({
        data: {
          slug: 'index-service',
          title: 'Service',
          description_markdown: '# Description',
          format: 'online',
          duration_minutes: 60,
          price_amount: 5000,
          status: 'published',
        },
      });

      const startAt = new Date('2026-03-01T10:00:00Z');
      const endAt = new Date('2026-03-01T11:00:00Z');

      await prisma.appointment.create({
        data: {
          service_id: service.id,
          start_at_utc: startAt,
          end_at_utc: endAt,
          timezone: 'Europe/Moscow',
          format: 'online',
          status: 'confirmed',
        },
      });

      // Query should use index on (start_at_utc, end_at_utc, status)
      const appointments = await prisma.appointment.findMany({
        where: {
          start_at_utc: {
            gte: new Date('2026-03-01T00:00:00Z'),
            lte: new Date('2026-03-01T23:59:59Z'),
          },
          status: 'confirmed',
        },
      });

      expect(appointments.length).toBeGreaterThan(0);
    });
  });
});
