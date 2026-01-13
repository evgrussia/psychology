import { DomainEvent } from '../../events/event-bus.interface';

export class MediaAssetDeletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: {
      userId: string;
    },
  ) {
    super(aggregateId, payload);
  }
}
