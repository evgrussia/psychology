import { Injectable, Logger } from '@nestjs/common';
import { MediaType } from '../../domain/media/value-objects/MediaType';

/**
 * Tracking Service
 * 
 * Sends analytics events according to Tracking Plan.
 * In production, this should integrate with an analytics provider
 * (self-hosted or external like PostHog, Mixpanel, etc.)
 */
@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  /**
   * Send admin_media_uploaded event
   * 
   * According to Tracking Plan:
   * - Props: media_type, size_bucket
   * - Prohibited: filename, URL (if sensitive)
   */
  async trackAdminMediaUploaded(params: {
    userId: string;
    mediaType: MediaType;
    sizeBytes: string;
  }): Promise<void> {
    const sizeBytesNum = parseInt(params.sizeBytes, 10);
    const sizeBucket = this.getSizeBucket(sizeBytesNum);

    const event = {
      event_name: 'admin_media_uploaded',
      source: 'admin/backend',
      occurred_at: new Date().toISOString(),
      user_id: params.userId,
      properties: {
        media_type: params.mediaType,
        size_bucket: sizeBucket,
      },
    };

    // In production, send to analytics provider
    // For now, log it
    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Calculate size bucket for analytics
   * Buckets: <1MB, 1-5MB, 5-10MB, 10-50MB, >50MB
   */
  private getSizeBucket(sizeBytes: number): string {
    const mb = sizeBytes / (1024 * 1024);
    if (mb < 1) return '<1MB';
    if (mb < 5) return '1-5MB';
    if (mb < 10) return '5-10MB';
    if (mb < 50) return '10-50MB';
    return '>50MB';
  }
}
