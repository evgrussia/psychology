import { PublishContentItemUseCase } from './PublishContentItemUseCase';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { IEventBus } from '@domain/events/event-bus.interface';
import { ContentItem } from '@domain/content/entities/ContentItem';
import { ContentType, ContentStatus } from '@domain/content/value-objects/ContentEnums';
import { ContentPublishedEvent } from '@domain/content/events/ContentPublishedEvent';

describe('PublishContentItemUseCase Privacy', () => {
  let useCase: PublishContentItemUseCase;
  let repository: jest.Mocked<IContentItemRepository>;
  let eventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    repository = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByTopic: jest.fn(),
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

  it('should NOT include body_markdown in ContentPublishedEvent', async () => {
    const sensitiveContent = 'This is sensitive content with P2 data';
    const contentItem = ContentItem.create({
      id: 'content-1',
      contentType: ContentType.article,
      slug: 'test-article',
      title: 'Test Article',
      bodyMarkdown: sensitiveContent,
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

    // Verify event was published
    expect(eventBus.publish).toHaveBeenCalled();
    const publishedEvent = eventBus.publish.mock.calls[0][0] as ContentPublishedEvent;

    // Verify event does NOT contain body_markdown
    expect(publishedEvent.payload).not.toHaveProperty('bodyMarkdown');
    expect(publishedEvent.payload).not.toHaveProperty('body_markdown');
    expect(JSON.stringify(publishedEvent.payload)).not.toContain(sensitiveContent);

    // Verify event only contains safe metadata
    expect(publishedEvent.payload).toHaveProperty('contentType');
    expect(publishedEvent.payload).toHaveProperty('slug');
    expect(publishedEvent.payload).toHaveProperty('title');
    expect(publishedEvent.payload).toHaveProperty('authorUserId');
    expect(publishedEvent.payload).toHaveProperty('publishedAt');
  });

  it('should NOT include body_markdown in event payload even if content has sensitive data', async () => {
    const sensitiveData = 'User diary entry: I feel anxious today...';
    const contentItem = ContentItem.create({
      id: 'content-2',
      contentType: ContentType.article,
      slug: 'sensitive-article',
      title: 'Sensitive Article',
      bodyMarkdown: sensitiveData,
      status: ContentStatus.draft,
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    repository.findById.mockResolvedValue(contentItem);

    await useCase.execute('content-2', {
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

    const publishedEvent = eventBus.publish.mock.calls[0][0] as ContentPublishedEvent;
    const eventPayloadString = JSON.stringify(publishedEvent.payload);

    // Verify sensitive data is NOT in event
    expect(eventPayloadString).not.toContain('diary');
    expect(eventPayloadString).not.toContain('anxious');
    expect(eventPayloadString).not.toContain(sensitiveData);
  });
});
