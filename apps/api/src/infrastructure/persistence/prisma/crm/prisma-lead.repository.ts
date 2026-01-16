import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ILeadRepository, LeadIdentityInput, LeadTimelineEventInput } from '@domain/crm/repositories/ILeadRepository';
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
}
