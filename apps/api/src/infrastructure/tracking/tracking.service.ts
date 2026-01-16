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
   * Send booking_conflict event
   *
   * According to Tracking Plan:
   * - Props: service_id/service_slug
   * - Prohibited: PII
   */
  async trackBookingConflict(params: { serviceId: string; serviceSlug: string }): Promise<void> {
    const event = {
      event_name: 'booking_conflict',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send payment_started event
   *
   * According to Tracking Plan:
   * - Props: payment_provider, amount, currency, service_id/service_slug
   * - Prohibited: PII, free text
   */
  async trackPaymentStarted(params: {
    paymentProvider: string;
    amount: number;
    currency: string;
    serviceId: string;
    serviceSlug: string;
  }): Promise<void> {
    const event = {
      event_name: 'payment_started',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        payment_provider: params.paymentProvider,
        amount: params.amount,
        currency: params.currency,
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send booking_paid event (server-side source of truth)
   *
   * According to Tracking Plan:
   * - Props: payment_provider, amount, currency, service_id/service_slug
   * - Prohibited: PII, free text
   */
  async trackBookingPaid(params: {
    paymentProvider: string;
    amount: number;
    currency: string;
    serviceId: string;
    serviceSlug: string;
  }): Promise<void> {
    const event = {
      event_name: 'booking_paid',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        payment_provider: params.paymentProvider,
        amount: params.amount,
        currency: params.currency,
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send booking_confirmed event (server-side source of truth)
   *
   * According to Tracking Plan:
   * - Props: appointment_start_at, timezone, service_id/service_slug, format
   * - Prohibited: PII, free text
   */
  async trackBookingConfirmed(params: {
    appointmentStartAt: Date;
    timezone: string;
    serviceId: string;
    serviceSlug: string;
    format: string;
  }): Promise<void> {
    const event = {
      event_name: 'booking_confirmed',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        appointment_start_at: params.appointmentStartAt.toISOString(),
        timezone: params.timezone,
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
        format: params.format,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send payment_failed event
   *
   * According to Tracking Plan:
   * - Props: payment_provider, failure_category, service_id/service_slug
   * - Prohibited: PII, free text
   */
  async trackPaymentFailed(params: {
    paymentProvider: string;
    failureCategory: string;
    serviceId: string;
    serviceSlug: string;
  }): Promise<void> {
    const event = {
      event_name: 'payment_failed',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        payment_provider: params.paymentProvider,
        failure_category: params.failureCategory,
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send waitlist_submitted event
   *
   * According to Tracking Plan:
   * - Props: preferred_contact, service_id/service_slug, preferred_time_window (optional)
   * - Prohibited: PII
   */
  async trackWaitlistSubmitted(params: {
    serviceId: string;
    serviceSlug: string;
    preferredContact: string;
    preferredTimeWindow: string;
  }): Promise<void> {
    const event = {
      event_name: 'waitlist_submitted',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
        preferred_contact: params.preferredContact,
        preferred_time_window: params.preferredTimeWindow,
      },
    };

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
