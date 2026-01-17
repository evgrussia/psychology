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

export interface LeadListFilters {
  status?: string[];
  source?: string[];
  topicCode?: string | null;
  createdFrom?: Date;
  createdTo?: Date;
  hasContact?: boolean;
  search?: string | null;
  page?: number;
  pageSize?: number;
}

export interface LeadListItem {
  id: string;
  status: string;
  source: string;
  topicCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  displayName: string | null;
  hasContact: boolean;
  lastEvent: {
    eventName: string;
    occurredAt: Date;
  } | null;
}

export interface LeadIdentityRecord {
  id: string;
  userId: string | null;
  anonymousId: string | null;
  emailEncrypted: string | null;
  phoneEncrypted: string | null;
  telegramUserId: string | null;
  isPrimary: boolean;
  createdAt: Date;
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    telegramUserId: string | null;
    displayName: string | null;
  } | null;
}

export interface LeadTimelineEventRecord {
  id: string;
  eventName: string;
  source: string;
  occurredAt: Date;
  deepLinkId: string | null;
  properties: Record<string, any>;
}

export interface LeadNoteRecord {
  id: string;
  leadId: string;
  authorUserId: string;
  noteEncrypted: string;
  createdAt: Date;
  author?: {
    id: string;
    email: string | null;
    displayName: string | null;
  } | null;
}

export interface LeadConsents {
  personalData: boolean;
  communications: boolean;
  telegram: boolean;
}

export interface LeadDetails {
  id: string;
  status: string;
  source: string;
  topicCode: string | null;
  utm: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  identities: LeadIdentityRecord[];
  timelineEvents: LeadTimelineEventRecord[];
  notes: LeadNoteRecord[];
  consents: LeadConsents | null;
}

export interface ILeadRepository {
  findById(id: string): Promise<Lead | null>;
  create(lead: Lead): Promise<void>;
  updateStatus(id: string, status: string): Promise<void>;
  addIdentity(input: LeadIdentityInput): Promise<void>;
  addTimelineEvent(input: LeadTimelineEventInput): Promise<void>;
  listLeads(filters: LeadListFilters): Promise<{
    items: LeadListItem[];
    total: number;
    statusCounts: Record<string, number>;
  }>;
  getLeadDetails(id: string): Promise<LeadDetails | null>;
  addNote(leadId: string, authorUserId: string, noteEncrypted: string): Promise<LeadNoteRecord>;
}
