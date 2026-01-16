import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IDeepLinkRepository } from '@domain/telegram/repositories/IDeepLinkRepository';
import { DeepLink } from '@domain/telegram/entities/DeepLink';
import { TelegramFlow, TelegramTarget } from '@domain/telegram/value-objects/TelegramEnums';
import { DeepLink as PrismaDeepLink } from '@prisma/client';

@Injectable()
export class PrismaDeepLinkRepository implements IDeepLinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(deepLink: DeepLink): Promise<void> {
    await this.prisma.deepLink.create({
      data: {
        deep_link_id: deepLink.deepLinkId,
        flow: deepLink.flow,
        tg_target: deepLink.target,
        topic_code: deepLink.topicCode,
        entity_ref: deepLink.entityRef,
        source_page: deepLink.sourcePage,
        anonymous_id: deepLink.anonymousId,
        lead_id: deepLink.leadId,
        created_at: deepLink.createdAt,
        expires_at: deepLink.expiresAt,
      },
    });
  }

  async findById(deepLinkId: string): Promise<DeepLink | null> {
    const record = await this.prisma.deepLink.findUnique({
      where: { deep_link_id: deepLinkId },
    });
    return record ? this.toDomain(record) : null;
  }

  async findActiveById(deepLinkId: string, now: Date): Promise<DeepLink | null> {
    const record = await this.prisma.deepLink.findFirst({
      where: {
        deep_link_id: deepLinkId,
        expires_at: { gt: now },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async deleteExpired(now: Date): Promise<number> {
    const result = await this.prisma.deepLink.deleteMany({
      where: {
        expires_at: { lte: now },
      },
    });
    return result.count;
  }

  private toDomain(record: PrismaDeepLink): DeepLink {
    return DeepLink.reconstitute({
      deepLinkId: record.deep_link_id,
      flow: record.flow as TelegramFlow,
      target: record.tg_target as TelegramTarget,
      topicCode: record.topic_code,
      entityRef: record.entity_ref,
      sourcePage: record.source_page,
      anonymousId: record.anonymous_id,
      leadId: record.lead_id,
      createdAt: record.created_at,
      expiresAt: record.expires_at,
    });
  }
}
