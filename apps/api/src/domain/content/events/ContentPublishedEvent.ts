import { DomainEvent } from '../../events/event-bus.interface';

export class ContentPublishedEvent extends DomainEvent {
  constructor(
    contentItemId: string,
    payload: {
      contentType: string;
      slug: string;
      title: string;
      authorUserId: string;
      publishedAt: Date;
    },
  ) {
    super(contentItemId, payload);
  }
}
