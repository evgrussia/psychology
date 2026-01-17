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
   * Send admin_login event
   *
   * According to Tracking Plan:
   * - Props: role
   * - Prohibited: email, phone, identifiers
   */
  async trackAdminLogin(params: { role: string }): Promise<void> {
    const event = {
      event_name: 'admin_login',
      source: 'admin/backend',
      occurred_at: new Date().toISOString(),
      properties: {
        role: params.role,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send ugc_moderated event
   *
   * According to Tracking Plan:
   * - Props: ugc_type, ugc_id, moderation_status, moderator_role, duration_ms
   * - Optional: rejection_reason, has_crisis_trigger
   * - Prohibited: free text content
   */
  async trackUgcModerated(params: {
    ugcType: string;
    ugcId: string;
    moderationStatus: string;
    moderatorRole: string;
    durationMs: number;
    rejectionReason?: string | null;
    hasCrisisTrigger?: boolean;
  }): Promise<void> {
    const event = {
      event_name: 'ugc_moderated',
      source: 'admin/backend',
      occurred_at: new Date().toISOString(),
      properties: {
        ugc_type: params.ugcType,
        ugc_id: params.ugcId,
        moderation_status: params.moderationStatus,
        moderator_role: params.moderatorRole,
        duration_ms: params.durationMs,
        rejection_reason: params.rejectionReason ?? undefined,
        has_crisis_trigger: params.hasCrisisTrigger ?? undefined,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send moderation_escalated event
   *
   * According to Tracking Plan:
   * - Props: ugc_type, ugc_id, escalation_reason
   * - Prohibited: free text content
   */
  async trackModerationEscalated(params: {
    ugcType: string;
    ugcId: string;
    escalationReason: string;
  }): Promise<void> {
    const event = {
      event_name: 'moderation_escalated',
      source: 'admin/backend',
      occurred_at: new Date().toISOString(),
      properties: {
        ugc_type: params.ugcType,
        ugc_id: params.ugcId,
        escalation_reason: params.escalationReason,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send ugc_answered event
   *
   * According to Tracking Plan:
   * - Props: ugc_id, answer_length_bucket, time_to_answer_hours
   * - Prohibited: answer text
   */
  async trackUgcAnswered(params: {
    ugcId: string;
    answerLengthBucket: 'short' | 'medium' | 'long';
    timeToAnswerHours: number;
  }): Promise<void> {
    const event = {
      event_name: 'ugc_answered',
      source: 'admin/backend',
      occurred_at: new Date().toISOString(),
      properties: {
        ugc_id: params.ugcId,
        answer_length_bucket: params.answerLengthBucket,
        time_to_answer_hours: params.timeToAnswerHours,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

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
   * Send diary_entry_created event
   *
   * According to Tracking Plan:
   * - Props: diary_type, has_text
   * - Prohibited: payload contents
   */
  async trackDiaryEntryCreated(params: { diaryType: string; hasText: boolean }): Promise<void> {
    const event = {
      event_name: 'diary_entry_created',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        diary_type: params.diaryType,
        has_text: params.hasText,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send diary_entry_deleted event
   *
   * According to Tracking Plan:
   * - Props: diary_type
   * - Prohibited: payload contents
   */
  async trackDiaryEntryDeleted(params: { diaryType: string }): Promise<void> {
    const event = {
      event_name: 'diary_entry_deleted',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        diary_type: params.diaryType,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send pdf_exported event
   *
   * According to Tracking Plan:
   * - Props: export_type, period
   * - Prohibited: diary contents
   */
  async trackPdfExported(params: { exportType: string; period: string }): Promise<void> {
    const event = {
      event_name: 'pdf_exported',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        export_type: params.exportType,
        period: params.period,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send consent_updated event
   *
   * According to Tracking Plan:
   * - Props: consent_type, new_value
   * - Prohibited: PII, free text
   */
  async trackConsentUpdated(params: { consentType: string; newValue: boolean }): Promise<void> {
    const event = {
      event_name: 'consent_updated',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        consent_type: params.consentType,
        new_value: params.newValue,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send account_deleted event
   *
   * According to Tracking Plan:
   * - Props: method
   * - Prohibited: PII, free text
   */
  async trackAccountDeleted(params: { method: string }): Promise<void> {
    const event = {
      event_name: 'account_deleted',
      source: 'backend',
      occurred_at: new Date().toISOString(),
      properties: {
        method: params.method,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send tg_subscribe_confirmed event
   *
   * According to Tracking Plan:
   * - Props: tg_target, deep_link_id, tg_flow (optional), topic (optional)
   * - Prohibited: tg_id, free text
   */
  async trackTelegramSubscribeConfirmed(params: {
    deepLinkId?: string | null;
    tgTarget: string;
    tgFlow?: string | null;
    topic?: string | null;
  }): Promise<void> {
    const event = {
      event_name: 'tg_subscribe_confirmed',
      source: 'telegram',
      occurred_at: new Date().toISOString(),
      properties: {
        tg_target: params.tgTarget,
        deep_link_id: params.deepLinkId ?? undefined,
        tg_flow: params.tgFlow ?? undefined,
        topic: params.topic ?? undefined,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send tg_onboarding_completed event
   *
   * According to Tracking Plan:
   * - Props: segment, frequency, deep_link_id (optional)
   * - Prohibited: PII, free text
   */
  async trackTelegramOnboardingCompleted(params: {
    deepLinkId?: string | null;
    segment: string;
    frequency: string;
  }): Promise<void> {
    const event = {
      event_name: 'tg_onboarding_completed',
      source: 'telegram',
      occurred_at: new Date().toISOString(),
      properties: {
        deep_link_id: params.deepLinkId ?? undefined,
        segment: params.segment,
        frequency: params.frequency,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send tg_interaction event
   *
   * According to Tracking Plan:
   * - Props: interaction_type, tg_flow, deep_link_id (optional), button_id (optional)
   * - Prohibited: text content
   */
  async trackTelegramInteraction(params: {
    interactionType: string;
    tgFlow: string;
    deepLinkId?: string | null;
    buttonId?: string | null;
    messageTemplateId?: string | null;
    topic?: string | null;
    hasText?: boolean;
    textLengthBucket?: string | null;
  }): Promise<void> {
    const event = {
      event_name: 'tg_interaction',
      source: 'telegram',
      occurred_at: new Date().toISOString(),
      properties: {
        interaction_type: params.interactionType,
        tg_flow: params.tgFlow,
        deep_link_id: params.deepLinkId ?? undefined,
        button_id: params.buttonId ?? undefined,
        message_template_id: params.messageTemplateId ?? undefined,
        topic: params.topic ?? undefined,
        has_text: params.hasText ?? undefined,
        text_length_bucket: params.textLengthBucket ?? undefined,
      },
    };

    this.logger.log(`[Tracking] ${JSON.stringify(event)}`);
  }

  /**
   * Send tg_series_stopped event
   *
   * According to Tracking Plan:
   * - Props: tg_flow, stop_method, deep_link_id (optional)
   * - Prohibited: PII, free text
   */
  async trackTelegramSeriesStopped(params: {
    tgFlow: string;
    stopMethod: string;
    deepLinkId?: string | null;
  }): Promise<void> {
    const event = {
      event_name: 'tg_series_stopped',
      source: 'telegram',
      occurred_at: new Date().toISOString(),
      properties: {
        tg_flow: params.tgFlow,
        stop_method: params.stopMethod,
        deep_link_id: params.deepLinkId ?? undefined,
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
