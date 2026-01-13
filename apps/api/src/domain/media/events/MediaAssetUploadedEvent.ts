import { DomainEvent } from '../../events/event-bus.interface';
import { MediaType } from '../value-objects/MediaType';

export class MediaAssetUploadedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    payload: {
      userId: string;
      mediaType: MediaType;
      mimeType: string;
      sizeBytes: string;
    },
  ) {
    super(aggregateId, payload);
  }
}
