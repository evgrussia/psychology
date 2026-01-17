import { Injectable, Logger } from '@nestjs/common';
import { MediaType } from '../../domain/media/value-objects/MediaType';
import { IngestAnalyticsEventUseCase } from '@application/analytics/use-cases/IngestAnalyticsEventUseCase';
import * as crypto from 'crypto';

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

  constructor(private readonly ingestAnalyticsEventUseCase: IngestAnalyticsEventUseCase) {}

  /**
   * Send admin_login event
   *
   * According to Tracking Plan:
   * - Props: role
   * - Prohibited: email, phone, identifiers
   */
  async trackAdminLogin(params: { role: string }): Promise<void> {
    await this.sendEvent('admin_login', 'admin', {
      role: params.role,
    });
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
    await this.sendEvent('ugc_moderated', 'admin', {
      ugc_type: params.ugcType,
      ugc_id: params.ugcId,
      moderation_status: params.moderationStatus,
      moderator_role: params.moderatorRole,
      duration_ms: params.durationMs,
      rejection_reason: params.rejectionReason ?? undefined,
      has_crisis_trigger: params.hasCrisisTrigger ?? undefined,
    });
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
    await this.sendEvent('moderation_escalated', 'admin', {
      ugc_type: params.ugcType,
      ugc_id: params.ugcId,
      escalation_reason: params.escalationReason,
    });
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
    await this.sendEvent('ugc_answered', 'admin', {
      ugc_id: params.ugcId,
      answer_length_bucket: params.answerLengthBucket,
      time_to_answer_hours: params.timeToAnswerHours,
    });
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

    await this.sendEvent(
      'admin_media_uploaded',
      'admin',
      {
        media_type: params.mediaType,
        size_bucket: sizeBucket,
      },
      { userId: params.userId },
    );
  }

  /**
   * Send booking_conflict event
   *
   * According to Tracking Plan:
   * - Props: service_id/service_slug
   * - Prohibited: PII
   */
  async trackBookingConflict(params: { serviceId: string; serviceSlug: string; leadId?: string | null }): Promise<void> {
    await this.sendEvent(
      'booking_conflict',
      'backend',
      {
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
      },
      { leadId: params.leadId ?? null },
    );
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
    leadId?: string | null;
  }): Promise<void> {
    await this.sendEvent(
      'payment_started',
      'backend',
      {
        payment_provider: params.paymentProvider,
        amount: params.amount,
        currency: params.currency,
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
      },
      { leadId: params.leadId ?? null },
    );
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
    leadId?: string | null;
    deepLinkId?: string | null;
  }): Promise<void> {
    await this.sendEvent(
      'booking_paid',
      'backend',
      {
        payment_provider: params.paymentProvider,
        amount: params.amount,
        currency: params.currency,
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
        deep_link_id: params.deepLinkId ?? undefined,
      },
      { leadId: params.leadId ?? null },
    );
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
    leadId?: string | null;
    deepLinkId?: string | null;
  }): Promise<void> {
    await this.sendEvent(
      'booking_confirmed',
      'backend',
      {
        appointment_start_at: params.appointmentStartAt.toISOString(),
        timezone: params.timezone,
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
        format: params.format,
        deep_link_id: params.deepLinkId ?? undefined,
      },
      { leadId: params.leadId ?? null },
    );
  }

  /**
   * Send appointment_outcome_recorded event (server-side source of truth)
   *
   * According to Tracking Plan:
   * - Props: appointment_id, scheduled_start_at, service_id/service_slug, outcome
   * - Optional: recorded_by_role, reason_category
   * - Prohibited: free text
   */
  async trackAppointmentOutcomeRecorded(params: {
    appointmentId: string;
    scheduledStartAt: Date;
    serviceId: string;
    serviceSlug: string;
    outcome: string;
    recordedByRole?: string | null;
    reasonCategory?: string | null;
    leadId?: string | null;
    deepLinkId?: string | null;
  }): Promise<void> {
    await this.sendEvent(
      'appointment_outcome_recorded',
      'admin',
      {
        appointment_id: params.appointmentId,
        scheduled_start_at: params.scheduledStartAt.toISOString(),
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
        outcome: params.outcome,
        recorded_by_role: params.recordedByRole ?? undefined,
        reason_category: params.reasonCategory ?? undefined,
        deep_link_id: params.deepLinkId ?? undefined,
      },
      { leadId: params.leadId ?? null },
    );
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
    leadId?: string | null;
  }): Promise<void> {
    await this.sendEvent(
      'payment_failed',
      'backend',
      {
        payment_provider: params.paymentProvider,
        failure_category: params.failureCategory,
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
      },
      { leadId: params.leadId ?? null },
    );
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
    leadId?: string | null;
  }): Promise<void> {
    await this.sendEvent(
      'waitlist_submitted',
      'backend',
      {
        service_id: params.serviceId,
        service_slug: params.serviceSlug,
        preferred_contact: params.preferredContact,
        preferred_time_window: params.preferredTimeWindow,
      },
      { leadId: params.leadId ?? null },
    );
  }

  /**
   * Send diary_entry_created event
   *
   * According to Tracking Plan:
   * - Props: diary_type, has_text
   * - Prohibited: payload contents
   */
  async trackDiaryEntryCreated(params: { diaryType: string; hasText: boolean; userId?: string | null }): Promise<void> {
    await this.sendEvent(
      'diary_entry_created',
      'backend',
      {
        diary_type: params.diaryType,
        has_text: params.hasText,
      },
      { userId: params.userId ?? null },
    );
  }

  /**
   * Send diary_entry_deleted event
   *
   * According to Tracking Plan:
   * - Props: diary_type
   * - Prohibited: payload contents
   */
  async trackDiaryEntryDeleted(params: { diaryType: string; userId?: string | null }): Promise<void> {
    await this.sendEvent(
      'diary_entry_deleted',
      'backend',
      {
        diary_type: params.diaryType,
      },
      { userId: params.userId ?? null },
    );
  }

  /**
   * Send pdf_exported event
   *
   * According to Tracking Plan:
   * - Props: export_type, period
   * - Prohibited: diary contents
   */
  async trackPdfExported(params: { exportType: string; period: string; userId?: string | null }): Promise<void> {
    await this.sendEvent(
      'pdf_exported',
      'backend',
      {
        export_type: params.exportType,
        period: params.period,
      },
      { userId: params.userId ?? null },
    );
  }

  /**
   * Send consent_updated event
   *
   * According to Tracking Plan:
   * - Props: consent_type, new_value
   * - Prohibited: PII, free text
   */
  async trackConsentUpdated(params: { consentType: string; newValue: boolean; userId?: string | null }): Promise<void> {
    await this.sendEvent(
      'consent_updated',
      'backend',
      {
        consent_type: params.consentType,
        new_value: params.newValue,
      },
      { userId: params.userId ?? null },
    );
  }

  /**
   * Send account_deleted event
   *
   * According to Tracking Plan:
   * - Props: method
   * - Prohibited: PII, free text
   */
  async trackAccountDeleted(params: { method: string; userId?: string | null }): Promise<void> {
    await this.sendEvent(
      'account_deleted',
      'backend',
      {
        method: params.method,
      },
      { userId: params.userId ?? null },
    );
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
    await this.sendEvent('tg_subscribe_confirmed', 'telegram', {
      tg_target: params.tgTarget,
      deep_link_id: params.deepLinkId ?? undefined,
      tg_flow: params.tgFlow ?? undefined,
      topic: params.topic ?? undefined,
    });
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
    await this.sendEvent('tg_onboarding_completed', 'telegram', {
      deep_link_id: params.deepLinkId ?? undefined,
      segment: params.segment,
      frequency: params.frequency,
    });
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
    await this.sendEvent('tg_interaction', 'telegram', {
      interaction_type: params.interactionType,
      tg_flow: params.tgFlow,
      deep_link_id: params.deepLinkId ?? undefined,
      button_id: params.buttonId ?? undefined,
      message_template_id: params.messageTemplateId ?? undefined,
      topic: params.topic ?? undefined,
      has_text: params.hasText ?? undefined,
      text_length_bucket: params.textLengthBucket ?? undefined,
    });
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
    await this.sendEvent('tg_series_stopped', 'telegram', {
      tg_flow: params.tgFlow,
      stop_method: params.stopMethod,
      deep_link_id: params.deepLinkId ?? undefined,
    });
  }

  private async sendEvent(
    eventName: string,
    source: 'web' | 'backend' | 'telegram' | 'admin',
    properties: Record<string, unknown>,
    context?: {
      userId?: string | null;
      leadId?: string | null;
    },
  ): Promise<void> {
    const payload = {
      schema_version: '1.0',
      event_name: eventName,
      event_version: 1,
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      source,
      environment: this.resolveEnvironment(),
      session_id: null,
      anonymous_id: null,
      user_id: context?.userId ?? null,
      lead_id: context?.leadId ?? null,
      page: null,
      acquisition: null,
      properties,
    };

    try {
      await this.ingestAnalyticsEventUseCase.execute(payload);
      this.logger.log(`[Tracking] ${eventName} ingested`);
    } catch (error: any) {
      this.logger.warn(`[Tracking] Failed to ingest ${eventName}: ${error?.message ?? error}`);
    }
  }

  private resolveEnvironment(): 'prod' | 'stage' | 'dev' {
    if (process.env.APP_ENV === 'prod' || process.env.NODE_ENV === 'production') {
      return 'prod';
    }
    if (process.env.APP_ENV === 'stage') {
      return 'stage';
    }
    return 'dev';
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
