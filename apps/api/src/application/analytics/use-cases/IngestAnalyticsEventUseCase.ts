import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateOrUpdateLeadUseCase } from '@application/crm/use-cases/CreateOrUpdateLeadUseCase';
import { LeadSource } from '@domain/crm/value-objects/LeadEnums';
import { IAnalyticsEventRepository } from '@domain/analytics/repositories/IAnalyticsEventRepository';
import {
  ANALYTICS_SCHEMA_VERSION,
  LEAD_CONTACT_EVENTS,
} from '../analytics-dictionary';
import { validateAnalyticsPayload } from '../analytics-validator';
import { AnalyticsIngestDto, AnalyticsIngestResultDto } from '../dto/analytics.dto';

@Injectable()
export class IngestAnalyticsEventUseCase {
  constructor(
    @Inject('IAnalyticsEventRepository')
    private readonly analyticsEventRepository: IAnalyticsEventRepository,
    private readonly createOrUpdateLeadUseCase: CreateOrUpdateLeadUseCase,
  ) {}

  async execute(payload: AnalyticsIngestDto): Promise<AnalyticsIngestResultDto> {
    if (payload.schema_version !== ANALYTICS_SCHEMA_VERSION) {
      throw new BadRequestException('Unsupported schema_version');
    }

    const normalizedEventId = payload.event_id?.trim();
    if (!normalizedEventId) {
      throw new BadRequestException('Missing event_id');
    }

    const alreadyExists = await this.analyticsEventRepository.existsByEventId(normalizedEventId);
    if (alreadyExists) {
      return { status: 'ignored', lead_id: null };
    }

    const validation = validateAnalyticsPayload(payload.event_name, payload.source, payload.properties);
    if (!validation.valid) {
      throw new BadRequestException({
        code: 'analytics_payload_invalid',
        violations: validation.errors,
      });
    }

    const occurredAt = new Date(payload.occurred_at);
    if (Number.isNaN(occurredAt.getTime())) {
      throw new BadRequestException('Invalid occurred_at');
    }

    const leadResult = await this.maybeAttachLead(payload, occurredAt);

    await this.analyticsEventRepository.create({
      schemaVersion: payload.schema_version,
      eventName: payload.event_name,
      eventVersion: payload.event_version,
      eventId: normalizedEventId,
      occurredAt,
      source: payload.source,
      environment: payload.environment,
      sessionId: payload.session_id ?? null,
      anonymousId: payload.anonymous_id ?? null,
      userId: payload.user_id ?? null,
      leadId: leadResult.leadId ?? null,
      page: payload.page ?? null,
      acquisition: payload.acquisition ?? null,
      properties: payload.properties ?? null,
    });

    return {
      status: leadResult.status,
      lead_id: leadResult.leadId ?? null,
    };
  }

  private async maybeAttachLead(
    payload: AnalyticsIngestDto,
    occurredAt: Date,
  ): Promise<{ status: 'ok' | 'ignored'; leadId?: string }> {
    const leadIdFromPayload = payload.lead_id?.trim();
    const shouldCreateLead = LEAD_CONTACT_EVENTS.has(payload.event_name);

    if (!leadIdFromPayload && !shouldCreateLead) {
      return { status: 'ignored' };
    }

    const leadSource = resolveLeadSource(payload.event_name, payload.source);
    const topicCode = normalizeTopicCode(payload.properties);
    const deepLinkId = normalizeDeepLinkId(payload.properties);
    const utm = normalizeUtm(payload.acquisition);

    const result = await this.createOrUpdateLeadUseCase.execute({
      leadId: leadIdFromPayload ?? null,
      anonymousId: payload.anonymous_id ?? null,
      source: leadSource,
      topicCode,
      utm,
      contact: null,
      timelineEvent: {
        eventName: payload.event_name,
        source: payload.source as 'web' | 'backend' | 'telegram' | 'admin',
        properties: payload.properties ?? {},
        deepLinkId,
        occurredAt,
      },
    });

    return { status: 'ok', leadId: result.leadId };
  }
}

function normalizeTopicCode(properties?: Record<string, unknown> | null): string | null {
  if (!properties) return null;
  const topic = properties.topic ?? properties.topic_code ?? null;
  if (typeof topic !== 'string') return null;
  const trimmed = topic.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeDeepLinkId(properties?: Record<string, unknown> | null): string | null {
  if (!properties) return null;
  const deepLinkId = properties.deep_link_id ?? null;
  if (typeof deepLinkId !== 'string') return null;
  const trimmed = deepLinkId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeUtm(acquisition?: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!acquisition) return null;
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const entries = keys
    .map((key) => [key, acquisition[key]] as const)
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0);
  if (entries.length === 0) return null;
  return Object.fromEntries(entries);
}

function resolveLeadSource(eventName: string, source: string): LeadSource {
  if (eventName.startsWith('tg_') || eventName === 'cta_tg_click' || source === 'telegram') {
    return LeadSource.telegram;
  }
  if (eventName.includes('quiz') || eventName.includes('navigator') || eventName.includes('thermometer')) {
    return LeadSource.quiz;
  }
  if (eventName.startsWith('waitlist')) {
    return LeadSource.waitlist;
  }
  if (eventName === 'question_submitted') {
    return LeadSource.question;
  }
  if (eventName.startsWith('booking') || eventName.startsWith('payment') || eventName === 'service_selected') {
    return LeadSource.booking;
  }
  return LeadSource.booking;
}
