import { Lead } from '../entities/Lead';

export interface LeadIdentityInput {
  leadId: string;
  userId?: string | null;
  anonymousId?: string | null;
  emailEncrypted?: string | null;
  phoneEncrypted?: string | null;
  telegramUserId?: string | null;
  isPrimary?: boolean;
}

export interface LeadTimelineEventInput {
  leadId: string;
  eventName: string;
  source: 'web' | 'backend' | 'telegram' | 'admin';
  occurredAt?: Date;
  deepLinkId?: string | null;
  properties: Record<string, any>;
}

export interface ILeadRepository {
  findById(id: string): Promise<Lead | null>;
  create(lead: Lead): Promise<void>;
  addIdentity(input: LeadIdentityInput): Promise<void>;
  addTimelineEvent(input: LeadTimelineEventInput): Promise<void>;
}
