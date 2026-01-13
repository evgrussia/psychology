import { PublishContentItemUseCase } from './PublishContentItemUseCase';
import { IContentItemRepository } from '../../../domain/content/repositories/IContentItemRepository';
import { IEventBus } from '../../../domain/events/event-bus.interface';
import { ContentItem } from '../../../domain/content/entities/ContentItem';
import { ContentType, ContentStatus } from '../../../domain/content/value-objects/ContentEnums';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ContentPublishedEvent } from '../../../domain/content/events/ContentPublishedEvent';

describe('PublishContentItemUseCase', () => {
  let useCase: PublishContentItemUseCase;
  let repository: jest.Mocked<IContentItemRepository>;
  let eventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    repository = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    eventBus = {
      publish: jest.fn(),
      publishAll: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    useCase = new PublishContentItemUseCase(repository, eventBus);
  });

  it('should publish content item with complete QA checklist', async () => {
    const contentItem = ContentItem.create({
      id: 'content-1',
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: '# Hello\n\nДисклеймер: это не диагноз.',
      status: ContentStatus.draft,
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findById.mockResolvedValue(contentItem);

    const result = await useCase.execute('content-1', {
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

    expect(result.status).toBe(ContentStatus.published);
    expect(result.publishedAt).toBeDefined();
    expect(repository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(ContentPublishedEvent),
    );
  });

  it('should throw NotFoundException if content item not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', {
        qaChecklist: {
          hasDisclaimer: true,
          isToneGentle: true,
          hasTryNowBlock: true,
          hasCTA: true,
          hasInternalLinks: true,
          hasAltTexts: true,
          spellCheckDone: true,
        },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if QA checklist incomplete', async () => {
    const contentItem = ContentItem.create({
      id: 'content-1',
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: '# Hello',
      status: ContentStatus.draft,
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findById.mockResolvedValue(contentItem);

    await expect(
      useCase.execute('content-1', {
        qaChecklist: {
          hasDisclaimer: false,
          isToneGentle: true,
          hasTryNowBlock: true,
          hasCTA: true,
          hasInternalLinks: true,
          hasAltTexts: true,
          spellCheckDone: true,
        },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should publish ContentPublishedEvent with correct payload', async () => {
    const contentItem = ContentItem.create({
      id: 'content-1',
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: '# Hello\n\nДисклеймер: это не диагноз.',
      status: ContentStatus.draft,
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findById.mockResolvedValue(contentItem);

    await useCase.execute('content-1', {
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

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregateId: 'content-1',
        eventType: 'ContentPublishedEvent',
        payload: expect.objectContaining({
          contentType: ContentType.article,
          slug: 'test-article',
          title: 'Test Article',
          authorUserId: 'user-1',
        }),
      }),
    );
  });
});
