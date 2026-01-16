import { CreateDeepLinkUseCase } from './CreateDeepLinkUseCase';
import { ResolveDeepLinkUseCase } from './ResolveDeepLinkUseCase';
import { IDeepLinkRepository } from '@domain/telegram/repositories/IDeepLinkRepository';
import { DeepLink } from '@domain/telegram/entities/DeepLink';
import { TelegramFlow, TelegramTarget } from '@domain/telegram/value-objects/TelegramEnums';
import { NotFoundException } from '@nestjs/common';

class InMemoryDeepLinkRepository implements IDeepLinkRepository {
  private records = new Map<string, DeepLink>();

  async create(deepLink: DeepLink): Promise<void> {
    this.records.set(deepLink.deepLinkId, deepLink);
  }

  async findById(deepLinkId: string): Promise<DeepLink | null> {
    return this.records.get(deepLinkId) ?? null;
  }

  async findActiveById(deepLinkId: string, now: Date): Promise<DeepLink | null> {
    const record = this.records.get(deepLinkId);
    if (!record || record.isExpired(now)) {
      return null;
    }
    return record;
  }

  async deleteExpired(now: Date): Promise<number> {
    let deleted = 0;
    for (const [id, record] of this.records.entries()) {
      if (record.isExpired(now)) {
        this.records.delete(id);
        deleted += 1;
      }
    }
    return deleted;
  }

  updateExpiry(id: string, expiresAt: Date) {
    const record = this.records.get(id);
    if (!record) return;
    this.records.set(
      id,
      DeepLink.reconstitute({
        deepLinkId: record.deepLinkId,
        flow: record.flow,
        target: record.target,
        topicCode: record.topicCode,
        entityRef: record.entityRef,
        sourcePage: record.sourcePage,
        anonymousId: record.anonymousId,
        leadId: record.leadId,
        createdAt: record.createdAt,
        expiresAt,
      }),
    );
  }
}

describe('Deep link use cases', () => {
  it('creates and resolves a deep link', async () => {
    const repository = new InMemoryDeepLinkRepository();
    const configService = {
      get: (key: string) => {
        if (key === 'TELEGRAM_BOT_USERNAME') return 'emotional_balance_bot';
        if (key === 'TELEGRAM_DEEP_LINK_TTL_DAYS') return 30;
        return undefined;
      },
    } as any;

    const createUseCase = new CreateDeepLinkUseCase(repository, configService);
    const resolveUseCase = new ResolveDeepLinkUseCase(repository);

    const created = await createUseCase.execute({
      tg_flow: TelegramFlow.concierge,
      tg_target: TelegramTarget.bot,
      source_page: 'booking_no_slots',
    });

    const resolved = await resolveUseCase.execute(created.deep_link_id);
    expect(resolved.payload.dl).toBe(created.deep_link_id);
    expect(resolved.payload.f).toBe(TelegramFlow.concierge);
  });

  it('does not resolve expired deep links', async () => {
    const repository = new InMemoryDeepLinkRepository();
    const configService = {
      get: (_key: string) => 1,
    } as any;

    const createUseCase = new CreateDeepLinkUseCase(repository, configService);
    const resolveUseCase = new ResolveDeepLinkUseCase(repository);

    const created = await createUseCase.execute({
      tg_flow: TelegramFlow.plan_7d,
      tg_target: TelegramTarget.bot,
    });

    repository.updateExpiry(created.deep_link_id, new Date(Date.now() - 1000));

    await expect(resolveUseCase.execute(created.deep_link_id)).rejects.toBeInstanceOf(NotFoundException);
  });
});
