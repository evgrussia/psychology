import { Inject, Injectable } from '@nestjs/common';
import { ILeadRepository } from '@domain/crm/repositories/ILeadRepository';
import { Lead } from '@domain/crm/entities/Lead';
import { LeadSource, LeadStatus } from '@domain/crm/value-objects/LeadEnums';
import * as crypto from 'crypto';

export interface CreateOrUpdateLeadRequest {
  leadId?: string | null;
  source: LeadSource;
  topicCode?: string | null;
  utm?: Record<string, any> | null;
  contact?: {
    method: 'email' | 'phone' | 'telegram';
    encryptedValue?: string | null;
  } | null;
  timelineEvent: {
    eventName: string;
    source: 'web' | 'backend' | 'telegram' | 'admin';
    properties: Record<string, any>;
    deepLinkId?: string | null;
    occurredAt?: Date;
  };
}

export interface CreateOrUpdateLeadResult {
  leadId: string;
}

@Injectable()
export class CreateOrUpdateLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(request: CreateOrUpdateLeadRequest): Promise<CreateOrUpdateLeadResult> {
    const leadId = request.leadId?.trim() || crypto.randomUUID();
    let lead = await this.leadRepository.findById(leadId);

    if (!lead) {
      const now = new Date();
      lead = Lead.create({
        id: leadId,
        status: LeadStatus.new,
        source: request.source,
        topicCode: request.topicCode ?? null,
        utm: request.utm ?? null,
        createdAt: now,
        updatedAt: now,
      });
      await this.leadRepository.create(lead);
    }

    if (request.contact?.encryptedValue) {
      await this.leadRepository.addIdentity({
        leadId: lead.id,
        emailEncrypted: request.contact.method === 'email' ? request.contact.encryptedValue : null,
        phoneEncrypted: request.contact.method === 'phone' ? request.contact.encryptedValue : null,
        telegramUserId: null,
        isPrimary: true,
      });
    }

    const sanitizedProperties = this.sanitizeTimelineProperties(request.timelineEvent.properties);

    await this.leadRepository.addTimelineEvent({
      leadId: lead.id,
      eventName: request.timelineEvent.eventName,
      source: request.timelineEvent.source,
      occurredAt: request.timelineEvent.occurredAt,
      deepLinkId: request.timelineEvent.deepLinkId,
      properties: sanitizedProperties,
    });

    const nextStatus = this.resolveStatusFromEvent(
      request.timelineEvent.eventName,
      request.timelineEvent.properties,
    );
    if (nextStatus && this.shouldPromoteStatus(lead.status, nextStatus)) {
      await this.leadRepository.updateStatus(lead.id, nextStatus);
    }

    return { leadId: lead.id };
  }

  private resolveStatusFromEvent(eventName: string, properties: Record<string, any>): LeadStatus | null {
    switch (eventName) {
      case 'start_quiz':
      case 'complete_quiz':
      case 'navigator_start':
      case 'navigator_complete':
      case 'resource_thermometer_start':
      case 'resource_thermometer_complete':
      case 'cta_tg_click':
      case 'tg_subscribe_confirmed':
        return LeadStatus.engaged;
      case 'booking_start':
        return LeadStatus.booking_started;
      case 'booking_confirmed':
        return LeadStatus.booked_confirmed;
      case 'booking_paid':
        return LeadStatus.paid;
      case 'appointment_outcome_recorded':
        if (properties?.outcome === 'attended') {
          return LeadStatus.completed_session;
        }
        return null;
      default:
        return null;
    }
  }

  private shouldPromoteStatus(current: LeadStatus, next: LeadStatus): boolean {
    const order: LeadStatus[] = [
      LeadStatus.new,
      LeadStatus.engaged,
      LeadStatus.booking_started,
      LeadStatus.booked_confirmed,
      LeadStatus.paid,
      LeadStatus.completed_session,
      LeadStatus.follow_up_needed,
      LeadStatus.inactive,
    ];

    return order.indexOf(next) > order.indexOf(current);
  }

  private sanitizeTimelineProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const blockedKeyPattern = /(email|phone|name|text|message|question|answer|note|payload|content|body|diagnos)/i;

    Object.entries(properties ?? {}).forEach(([key, value]) => {
      if (blockedKeyPattern.test(key)) {
        return;
      }
      sanitized[key] = value;
    });

    return sanitized;
  }
}
