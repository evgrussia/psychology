import { Injectable, OnModuleInit } from '@nestjs/common';
import { IEventBus } from '../../domain/events/event-bus.interface';
import { MediaAssetUploadedEvent } from '../../domain/media/events/MediaAssetUploadedEvent';
import { TrackingService } from './tracking.service';

/**
 * Event handler for MediaAssetUploadedEvent
 * Sends tracking event to analytics according to Tracking Plan
 */
@Injectable()
export class MediaTrackingHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: IEventBus,
    private readonly trackingService: TrackingService,
  ) {}

  onModuleInit() {
    // Subscribe to MediaAssetUploadedEvent
    // eventType is the class name: "MediaAssetUploadedEvent"
    this.eventBus.subscribe('MediaAssetUploadedEvent', async (event) => {
      await this.handleMediaAssetUploaded(event);
    });
  }

  private async handleMediaAssetUploaded(event: any): Promise<void> {
    try {
      // Validate event structure
      if (!event.payload || !event.payload.userId || !event.payload.mediaType || !event.payload.sizeBytes) {
        console.warn('Invalid MediaAssetUploadedEvent structure:', event);
        return;
      }

      await this.trackingService.trackAdminMediaUploaded({
        userId: event.payload.userId,
        mediaType: event.payload.mediaType,
        sizeBytes: event.payload.sizeBytes,
      });
    } catch (error) {
      // Log error but don't fail the upload process
      console.error('Failed to track admin_media_uploaded event:', error);
    }
  }
}
