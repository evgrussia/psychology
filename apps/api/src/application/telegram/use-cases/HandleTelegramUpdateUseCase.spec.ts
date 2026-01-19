import { HandleTelegramUpdateUseCase } from './HandleTelegramUpdateUseCase';
import { ITelegramUserRepository } from '@domain/telegram/repositories/ITelegramUserRepository';
import { ITelegramSessionRepository } from '@domain/telegram/repositories/ITelegramSessionRepository';
import { IDeepLinkRepository } from '@domain/telegram/repositories/IDeepLinkRepository';
import { ITelegramBotClient } from '@domain/telegram/services/ITelegramBotClient';
import { TelegramFlow, TelegramSessionState, TelegramTarget } from '@domain/telegram/value-objects/TelegramEnums';
import { DeepLink } from '@domain/telegram/entities/DeepLink';
import { DeepLinkPayloadCodec } from '../services/deep-link-payload-codec';
import { StartOnboardingUseCase } from './StartOnboardingUseCase';
import { SendPlanMessageUseCase } from './SendPlanMessageUseCase';
import { TelegramSession } from '@domain/telegram/entities/TelegramSession';
import { TrackingService } from '@infrastructure/tracking/tracking.service';

class InMemoryTelegramUserRepository implements ITelegramUserRepository {
  private records = new Map<string, any>();
  async upsert(input: any): Promise<any> {
    this.records.set(input.telegramUserId, input);
    return input;
  }
  async findById(telegramUserId: string): Promise<any> {
    return this.records.get(telegramUserId) ?? null;
  }
}

class InMemoryTelegramSessionRepository implements ITelegramSessionRepository {
  private records = new Map<string, TelegramSession>();
  async findActiveByUserId(telegramUserId: string): Promise<TelegramSession | null> {
    for (const session of this.records.values()) {
      if (session.telegramUserId === telegramUserId && session.isActive) {
        return session;
      }
    }
    return null;
  }
  async create(session: TelegramSession): Promise<void> {
    this.records.set(session.id, session);
  }
  async update(session: TelegramSession): Promise<void> {
    this.records.set(session.id, session);
  }
  async findDueScheduledSessions(now: Date, limit: number): Promise<TelegramSession[]> {
    return Array.from(this.records.values())
      .filter((session) => session.isActive && session.nextSendAt && session.nextSendAt <= now)
      .sort((a, b) => (a.nextSendAt?.getTime() ?? 0) - (b.nextSendAt?.getTime() ?? 0))
      .slice(0, limit);
  }
  async deactivateSessions(telegramUserId: string): Promise<number> {
    let count = 0;
    for (const session of this.records.values()) {
      if (session.telegramUserId === telegramUserId && session.isActive) {
        session.stop(TelegramSessionState.stopped);
        count += 1;
      }
    }
    return count;
  }
}

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
  async deleteExpired(): Promise<number> {
    return 0;
  }
}

class FakeTelegramBotClient implements ITelegramBotClient {
  messages: string[] = [];
  async sendMessage(_chatId: string, text: string, _options?: any): Promise<void> {
    this.messages.push(text);
  }
  async answerCallbackQuery(): Promise<void> {}
  async setWebhook(): Promise<boolean> { return true; }
  async deleteWebhook(): Promise<boolean> { return true; }
  async getUpdates(): Promise<any[]> { return []; }
}

describe('HandleTelegramUpdateUseCase', () => {
  it('handles /start onboarding and plan flow', async () => {
    const userRepo = new InMemoryTelegramUserRepository();
    const sessionRepo = new InMemoryTelegramSessionRepository();
    const deepLinkRepo = new InMemoryDeepLinkRepository();
    const botClient = new FakeTelegramBotClient();
    const trackingService = {
      trackTelegramSubscribeConfirmed: jest.fn(),
      trackTelegramOnboardingCompleted: jest.fn(),
      trackTelegramInteraction: jest.fn(),
      trackTelegramSeriesStopped: jest.fn(),
    } as unknown as TrackingService;
    const configService = {
      get: (key: string) => {
        if (key === 'PUBLIC_WEB_URL') return 'http://localhost:3000';
        return undefined;
      },
    } as any;
    const startOnboarding = new StartOnboardingUseCase(botClient);
    const sendPlan = new SendPlanMessageUseCase(botClient as any, configService);

    const deepLink = DeepLink.create({
      deepLinkId: 'dl_123',
      flow: TelegramFlow.plan_7d,
      target: TelegramTarget.bot,
      topicCode: null,
      entityRef: null,
      sourcePage: null,
      anonymousId: null,
      leadId: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    await deepLinkRepo.create(deepLink);

    const useCase = new HandleTelegramUpdateUseCase(
      userRepo,
      sessionRepo,
      deepLinkRepo,
      botClient,
      configService,
      startOnboarding,
      sendPlan,
      trackingService,
    );

    const payload = DeepLinkPayloadCodec.encode({ dl: 'dl_123', f: TelegramFlow.plan_7d });
    await useCase.execute({
      update_id: 1,
      message: {
        message_id: 1,
        from: { id: 100, first_name: 'Test' },
        chat: { id: 100, type: 'private' },
        text: `/start ${payload}`,
        date: Date.now(),
      },
    });

    expect(botClient.messages.length).toBeGreaterThan(0);
    expect(trackingService.trackTelegramSubscribeConfirmed).toHaveBeenCalled();

    await useCase.execute({
      update_id: 2,
      callback_query: {
        id: 'cb1',
        from: { id: 100, first_name: 'Test' },
        message: { message_id: 2, chat: { id: 100, type: 'private' }, date: Date.now() },
        data: 'tg_onboard_topic:anxiety',
      },
    });

    await useCase.execute({
      update_id: 3,
      callback_query: {
        id: 'cb2',
        from: { id: 100, first_name: 'Test' },
        message: { message_id: 3, chat: { id: 100, type: 'private' }, date: Date.now() },
        data: 'tg_onboard_freq:weekly_1_2',
      },
    });

    expect(trackingService.trackTelegramOnboardingCompleted).toHaveBeenCalled();
    expect(botClient.messages.some((text) => text.includes('план'))).toBe(true);
  });

  it('confirms channel subscription before onboarding', async () => {
    const userRepo = new InMemoryTelegramUserRepository();
    const sessionRepo = new InMemoryTelegramSessionRepository();
    const deepLinkRepo = new InMemoryDeepLinkRepository();
    const botClient = new FakeTelegramBotClient();
    const trackingService = {
      trackTelegramSubscribeConfirmed: jest.fn(),
      trackTelegramOnboardingCompleted: jest.fn(),
      trackTelegramInteraction: jest.fn(),
      trackTelegramSeriesStopped: jest.fn(),
    } as unknown as TrackingService;
    const configService = {
      get: (key: string) => {
        if (key === 'PUBLIC_WEB_URL') return 'http://localhost:3000';
        if (key === 'TELEGRAM_CHANNEL_USERNAME') return 'emotional_balance_channel';
        return undefined;
      },
    } as any;
    const startOnboarding = new StartOnboardingUseCase(botClient);
    const sendPlan = new SendPlanMessageUseCase(botClient as any, configService);

    const deepLink = DeepLink.create({
      deepLinkId: 'dl_channel',
      flow: TelegramFlow.plan_7d,
      target: TelegramTarget.channel,
      topicCode: null,
      entityRef: null,
      sourcePage: null,
      anonymousId: null,
      leadId: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    await deepLinkRepo.create(deepLink);

    const useCase = new HandleTelegramUpdateUseCase(
      userRepo,
      sessionRepo,
      deepLinkRepo,
      botClient,
      configService,
      startOnboarding,
      sendPlan,
      trackingService,
    );

    const payload = DeepLinkPayloadCodec.encode({ dl: 'dl_channel', f: TelegramFlow.plan_7d });
    await useCase.execute({
      update_id: 10,
      message: {
        message_id: 10,
        from: { id: 200, first_name: 'Test' },
        chat: { id: 200, type: 'private' },
        text: `/start ${payload}`,
        date: Date.now(),
      },
    });

    expect(botClient.messages.some((text) => text.includes('Подпишитесь на канал'))).toBe(true);
    expect(trackingService.trackTelegramSubscribeConfirmed).not.toHaveBeenCalled();

    await useCase.execute({
      update_id: 11,
      callback_query: {
        id: 'cb_channel_confirm',
        from: { id: 200, first_name: 'Test' },
        message: { message_id: 11, chat: { id: 200, type: 'private' }, date: Date.now() },
        data: 'tg_channel_confirmed',
      },
    });

    expect(trackingService.trackTelegramSubscribeConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({
        tgTarget: TelegramTarget.channel,
        deepLinkId: 'dl_channel',
      }),
    );
  });
});
