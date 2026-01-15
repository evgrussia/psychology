import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreateContentItemUseCase } from './CreateContentItemUseCase';
import { PublishContentItemUseCase } from './PublishContentItemUseCase';
import { GetContentBySlugUseCase } from '../../public/use-cases/GetContentBySlugUseCase';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';
import { ContentModule } from '../../../infrastructure/content/content.module';
import { DatabaseModule } from '../../../infrastructure/database/database.module';
import { EventsModule } from '../../../infrastructure/events/events.module';

describe('Content Management Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createUseCase: CreateContentItemUseCase;
  let publishUseCase: PublishContentItemUseCase;
  let getBySlugUseCase: GetContentBySlugUseCase;
  let testUserId: string;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, ContentModule, EventsModule],
      providers: [
        CreateContentItemUseCase,
        PublishContentItemUseCase,
        GetContentBySlugUseCase,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    createUseCase = moduleFixture.get<CreateContentItemUseCase>(CreateContentItemUseCase);
    publishUseCase = moduleFixture.get<PublishContentItemUseCase>(PublishContentItemUseCase);
    getBySlugUseCase = moduleFixture.get<GetContentBySlugUseCase>(GetContentBySlugUseCase);

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-content-${Date.now()}@example.com`,
        display_name: 'Test User',
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testUserId) {
      await prisma.contentRevision.deleteMany({
        where: { changed_by_user_id: testUserId },
      });
      await prisma.contentItem.deleteMany({
        where: { author_user_id: testUserId },
      });
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
    await app.close();
  });

  it('should create draft → publish → be accessible via public API', async () => {
    const slug = `test-article-${Date.now()}`;

    // Step 1: Create draft
    const created = await createUseCase.execute(
      {
        contentType: ContentType.article,
        slug,
        title: 'Test Article',
        bodyMarkdown: '# Test Article\n\nДисклеймер: это не диагноз.',
        excerpt: 'Test excerpt',
      },
      testUserId,
    );

    expect(created.status).toBe(ContentStatus.draft);
    expect(created.slug).toBe(slug);

    // Step 2: Try to get via public API (should fail - not published)
    await expect(
      getBySlugUseCase.execute({
        type: ContentType.article,
        slug,
      }),
    ).rejects.toThrow();

    // Step 3: Publish with complete QA checklist
    const published = await publishUseCase.execute(created.id, {
      qaChecklist: {
        hasDisclaimer: true,
        isToneGentle: true,
        hasTryNowBlock: true,
        hasCTA: true,
        hasInternalLinks: true,
        hasAltTexts: true,
        spellCheckDone: true,
      },
    });

    expect(published.status).toBe(ContentStatus.published);
    expect(published.publishedAt).toBeDefined();

    // Step 4: Get via public API (should succeed)
    const publicContent = await getBySlugUseCase.execute({
      type: ContentType.article,
      slug,
    });

    expect(publicContent.id).toBe(created.id);
    expect(publicContent.title).toBe('Test Article');
    expect(publicContent.body_markdown).toContain('Дисклеймер');
  });

  it('should not publish without complete QA checklist', async () => {
    const slug = `test-article-incomplete-${Date.now()}`;

    const created = await createUseCase.execute(
      {
        contentType: ContentType.article,
        slug,
        title: 'Incomplete Article',
        bodyMarkdown: '# Incomplete',
      },
      testUserId,
    );

    await expect(
      publishUseCase.execute(created.id, {
        qaChecklist: {
          hasDisclaimer: false, // Missing
          isToneGentle: true,
          hasTryNowBlock: true,
          hasCTA: true,
          hasInternalLinks: true,
          hasAltTexts: true,
          spellCheckDone: true,
        },
      }),
    ).rejects.toThrow();

    // Verify it's still draft
    const item = await prisma.contentItem.findUnique({
      where: { id: created.id },
    });
    expect(item?.status).toBe(ContentStatus.draft);
  });
});
