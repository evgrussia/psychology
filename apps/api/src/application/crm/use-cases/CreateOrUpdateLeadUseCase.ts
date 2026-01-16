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

    await this.leadRepository.addTimelineEvent({
      leadId: lead.id,
      eventName: request.timelineEvent.eventName,
      source: request.timelineEvent.source,
      occurredAt: request.timelineEvent.occurredAt,
      deepLinkId: request.timelineEvent.deepLinkId,
      properties: request.timelineEvent.properties,
    });

    return { leadId: lead.id };
  }
}
