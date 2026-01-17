import { Injectable } from '@nestjs/common';
import { Prisma, ConsentType, LeadStatus as PrismaLeadStatus, LeadSource as PrismaLeadSource } from '@prisma/client';
import { validate as validateUuid } from 'uuid';
import { PrismaService } from '../../../database/prisma.service';
import {
  ILeadRepository,
  LeadDetails,
  LeadIdentityInput,
  LeadListFilters,
  LeadListItem,
  LeadNoteRecord,
  LeadTimelineEventInput,
} from '@domain/crm/repositories/ILeadRepository';
import { Lead } from '@domain/crm/entities/Lead';
import { LeadMapper } from './lead.mapper';

@Injectable()
export class PrismaLeadRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Lead | null> {
    const record = await this.prisma.lead.findUnique({ where: { id } });
    if (!record) return null;
    return LeadMapper.toDomain(record);
  }

  async create(lead: Lead): Promise<void> {
    const data = LeadMapper.toPersistence(lead);
    await this.prisma.lead.create({ data });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.prisma.lead.update({
      where: { id },
      data: { status: status as PrismaLeadStatus },
    });
  }

  async addIdentity(input: LeadIdentityInput): Promise<void> {
    await this.prisma.leadIdentity.create({
      data: {
        lead_id: input.leadId,
        user_id: input.userId ?? null,
        anonymous_id: input.anonymousId ?? null,
        email_encrypted: input.emailEncrypted ?? null,
        phone_encrypted: input.phoneEncrypted ?? null,
        telegram_user_id: input.telegramUserId ?? null,
        is_primary: input.isPrimary ?? false,
      },
    });
  }

  async addTimelineEvent(input: LeadTimelineEventInput): Promise<void> {
    const deepLinkId = input.deepLinkId ?? null;
    const deepLink = deepLinkId
      ? await this.prisma.deepLink.findUnique({ where: { deep_link_id: deepLinkId } })
      : null;

    await this.prisma.leadTimelineEvent.create({
      data: {
        lead_id: input.leadId,
        event_name: input.eventName,
        source: input.source,
        occurred_at: input.occurredAt ?? new Date(),
        deep_link_id: deepLink?.deep_link_id ?? null,
        properties: input.properties ?? {},
      },
    });
  }

  async listLeads(filters: LeadListFilters): Promise<{
    items: LeadListItem[];
    total: number;
    statusCounts: Record<string, number>;
  }> {
    const where = this.buildWhere(filters);
    const statusCountWhere = this.buildWhere({ ...filters, status: undefined });
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    const [records, total, grouped] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          identities: {
            orderBy: { created_at: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  phone: true,
                  telegram_user_id: true,
                  display_name: true,
                },
              },
            },
          },
          timeline_events: {
            orderBy: { occurred_at: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.lead.count({ where }),
      (this.prisma.lead as any).groupBy({
        by: ['status'],
        where: statusCountWhere,
        _count: {
          status: true,
        },
      }),
    ]);

    const statusCounts = (grouped as any[]).reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    const items = records.map((record) => {
      const identities = record.identities || [];
      const primaryIdentity = identities.find((identity) => identity.is_primary) ?? identities[0];
      const lastEvent = record.timeline_events?.[0]
        ? {
            eventName: record.timeline_events[0].event_name,
            occurredAt: record.timeline_events[0].occurred_at,
          }
        : null;

      const hasContact = identities.some((identity) => {
        return Boolean(
          identity.email_encrypted ||
          identity.phone_encrypted ||
          identity.telegram_user_id ||
          identity.user?.email ||
          identity.user?.phone ||
          identity.user?.telegram_user_id,
        );
      });

      return {
        id: record.id,
        status: record.status,
        source: record.source,
        topicCode: record.topic_code,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        displayName: primaryIdentity?.user?.display_name ?? primaryIdentity?.user?.email ?? null,
        hasContact,
        lastEvent,
      };
    });

    return { items, total, statusCounts };
  }

  async getLeadDetails(id: string): Promise<LeadDetails | null> {
    const record = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        identities: {
          orderBy: { created_at: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                telegram_user_id: true,
                display_name: true,
              },
            },
          },
        },
        timeline_events: {
          orderBy: { occurred_at: 'desc' },
        },
        notes: {
          orderBy: { created_at: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                display_name: true,
              },
            },
          },
        },
      },
    });

    if (!record) {
      return null;
    }

    const linkedUserId = record.identities.find((identity) => identity.user_id)?.user_id ?? null;
    const consents = linkedUserId
      ? await this.prisma.consent.findMany({
          where: {
            user_id: linkedUserId,
            granted: true,
          },
        })
      : [];

    const consentMap = {
      personalData: consents.some((consent) => consent.consent_type === ConsentType.personal_data),
      communications: consents.some((consent) => consent.consent_type === ConsentType.communications),
      telegram: consents.some((consent) => consent.consent_type === ConsentType.telegram),
    };

    return {
      id: record.id,
      status: record.status,
      source: record.source,
      topicCode: record.topic_code,
      utm: record.utm as Record<string, any> | null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      identities: record.identities.map((identity) => ({
        id: identity.id,
        userId: identity.user_id,
        anonymousId: identity.anonymous_id,
        emailEncrypted: identity.email_encrypted,
        phoneEncrypted: identity.phone_encrypted,
        telegramUserId: identity.telegram_user_id,
        isPrimary: identity.is_primary,
        createdAt: identity.created_at,
        user: identity.user
          ? {
              id: identity.user.id,
              email: identity.user.email,
              phone: identity.user.phone,
              telegramUserId: identity.user.telegram_user_id,
              displayName: identity.user.display_name,
            }
          : null,
      })),
      timelineEvents: record.timeline_events.map((event) => ({
        id: event.id,
        eventName: event.event_name,
        source: event.source,
        occurredAt: event.occurred_at,
        deepLinkId: event.deep_link_id,
        properties: (event.properties as Record<string, any>) ?? {},
      })),
      notes: record.notes.map((note) => ({
        id: note.id,
        leadId: note.lead_id,
        authorUserId: note.author_user_id,
        noteEncrypted: note.note_encrypted,
        createdAt: note.created_at,
        author: note.author
          ? {
              id: note.author.id,
              email: note.author.email,
              displayName: note.author.display_name,
            }
          : null,
      })),
      consents: linkedUserId ? consentMap : null,
    };
  }

  async addNote(leadId: string, authorUserId: string, noteEncrypted: string): Promise<LeadNoteRecord> {
    const note = await this.prisma.leadNote.create({
      data: {
        lead_id: leadId,
        author_user_id: authorUserId,
        note_encrypted: noteEncrypted,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            display_name: true,
          },
        },
      },
    });

    return {
      id: note.id,
      leadId: note.lead_id,
      authorUserId: note.author_user_id,
      noteEncrypted: note.note_encrypted,
      createdAt: note.created_at,
      author: note.author
        ? {
            id: note.author.id,
            email: note.author.email,
            displayName: note.author.display_name,
          }
        : null,
    };
  }

  private buildWhere(filters: LeadListFilters): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {};

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status as PrismaLeadStatus[] };
    }

    if (filters.source && filters.source.length > 0) {
      where.source = { in: filters.source as PrismaLeadSource[] };
    }

    if (filters.topicCode) {
      where.topic_code = filters.topicCode;
    }

    if (filters.createdFrom || filters.createdTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filters.createdFrom) {
        dateFilter.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        dateFilter.lte = filters.createdTo;
      }
      where.created_at = dateFilter;
    }

    if (filters.hasContact !== undefined) {
      const contactCondition: Prisma.LeadIdentityWhereInput = {
        OR: [
          { email_encrypted: { not: null } },
          { phone_encrypted: { not: null } },
          { telegram_user_id: { not: null } },
          { user: { email: { not: null } } },
          { user: { phone: { not: null } } },
          { user: { telegram_user_id: { not: null } } },
        ],
      };

      where.identities = filters.hasContact
        ? { some: contactCondition }
        : { none: contactCondition };
    }

    if (filters.search && filters.search.trim().length > 0) {
      const term = filters.search.trim();
      const orConditions: Prisma.LeadWhereInput[] = [
        {
          identities: {
            some: {
              user: {
                OR: [
                  { email: { contains: term, mode: 'insensitive' } },
                  { phone: { contains: term } },
                  { display_name: { contains: term, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ];

      if (validateUuid(term)) {
        orConditions.push({ id: term });
      }

      where.OR = orConditions;
    }

    return where;
  }
}
