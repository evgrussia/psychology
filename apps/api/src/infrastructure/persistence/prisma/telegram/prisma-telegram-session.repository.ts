import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ITelegramSessionRepository } from '@domain/telegram/repositories/ITelegramSessionRepository';
import { TelegramSession } from '@domain/telegram/entities/TelegramSession';
import { TelegramFlow, TelegramFrequency, TelegramSessionState } from '@domain/telegram/value-objects/TelegramEnums';

@Injectable()
export class PrismaTelegramSessionRepository implements ITelegramSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByUserId(telegramUserId: string): Promise<TelegramSession | null> {
    const record = await this.prisma.telegramSession.findFirst({
      where: {
        telegram_user_id: telegramUserId,
        is_active: true,
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async create(session: TelegramSession): Promise<void> {
    await this.prisma.telegramSession.create({
      data: this.toPersistence(session) as any,
    });
  }

  async update(session: TelegramSession): Promise<void> {
    await this.prisma.telegramSession.update({
      where: { id: session.id },
      data: this.toPersistence(session) as any,
    });
  }

  async deactivateSessions(telegramUserId: string): Promise<number> {
    const result = await this.prisma.telegramSession.updateMany({
      where: {
        telegram_user_id: telegramUserId,
        is_active: true,
      },
      data: {
        is_active: false,
        state: TelegramSessionState.stopped,
        stopped_at: new Date(),
        updated_at: new Date(),
      },
    });
    return result.count;
  }

  private toDomain(record: any): TelegramSession {
    return TelegramSession.reconstitute({
      id: record.id,
      telegramUserId: record.telegram_user_id,
      state: record.state as TelegramSessionState,
      flow: record.flow ? (record.flow as TelegramFlow) : null,
      deepLinkId: record.deep_link_id,
      topicCode: record.topic_code,
      frequency: record.frequency ? (record.frequency as TelegramFrequency) : null,
      conciergePreferences: record.concierge_payload ?? null,
      isActive: record.is_active,
      startedAt: record.started_at,
      updatedAt: record.updated_at,
      stoppedAt: record.stopped_at,
      lastInteractionAt: record.last_interaction_at,
    });
  }

  private toPersistence(session: TelegramSession) {
    return {
      id: session.id,
      telegram_user_id: session.telegramUserId,
      state: session.state,
      flow: session.flow ?? null,
      deep_link_id: session.deepLinkId,
      topic_code: session.topicCode,
      frequency: session.frequency ?? null,
      concierge_payload: session.conciergePreferences ?? undefined,
      is_active: session.isActive,
      started_at: session.startedAt,
      updated_at: session.updatedAt,
      stopped_at: session.stoppedAt,
      last_interaction_at: session.lastInteractionAt,
    };
  }
}
