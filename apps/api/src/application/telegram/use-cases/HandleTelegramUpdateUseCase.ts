import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramUpdateDto } from '../dto/telegram-updates.dto';
import { ITelegramUserRepository } from '@domain/telegram/repositories/ITelegramUserRepository';
import { ITelegramSessionRepository } from '@domain/telegram/repositories/ITelegramSessionRepository';
import { IDeepLinkRepository } from '@domain/telegram/repositories/IDeepLinkRepository';
import { ITelegramBotClient } from '@domain/telegram/services/ITelegramBotClient';
import { TelegramFlow, TelegramFrequency, TelegramSessionState, TelegramTarget } from '@domain/telegram/value-objects/TelegramEnums';
import { TelegramSeriesType } from '@domain/telegram/value-objects/TelegramSeriesType';
import { DeepLinkPayloadCodec } from '../services/deep-link-payload-codec';
import { StartOnboardingUseCase } from './StartOnboardingUseCase';
import { SendPlanMessageUseCase } from './SendPlanMessageUseCase';
import { TelegramSession } from '@domain/telegram/entities/TelegramSession';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import * as crypto from 'crypto';

const STOP_BUTTON = 'tg_stop';
const CHANNEL_CONFIRM_BUTTON = 'tg_channel_confirmed';
const ONBOARD_TOPIC_PREFIX = 'tg_onboard_topic:';
const ONBOARD_FREQ_PREFIX = 'tg_onboard_freq:';
const CONCIERGE_FORMAT_PREFIX = 'tg_concierge_format:';
const CONCIERGE_TIME_PREFIX = 'tg_concierge_time:';
const CONCIERGE_GOAL_PREFIX = 'tg_concierge_goal:';

@Injectable()
export class HandleTelegramUpdateUseCase {
  constructor(
    @Inject('ITelegramUserRepository')
    private readonly telegramUserRepository: ITelegramUserRepository,
    @Inject('ITelegramSessionRepository')
    private readonly telegramSessionRepository: ITelegramSessionRepository,
    @Inject('IDeepLinkRepository')
    private readonly deepLinkRepository: IDeepLinkRepository,
    @Inject('ITelegramBotClient')
    private readonly botClient: ITelegramBotClient,
    private readonly configService: ConfigService,
    private readonly startOnboardingUseCase: StartOnboardingUseCase,
    private readonly sendPlanMessageUseCase: SendPlanMessageUseCase,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(update: TelegramUpdateDto): Promise<void> {
    const context = this.parseUpdate(update);
    if (!context) {
      return;
    }

    await this.telegramUserRepository.upsert({
      telegramUserId: context.telegramUserId,
      username: context.username,
      firstName: context.firstName,
      lastName: context.lastName,
      languageCode: context.languageCode,
      isBot: context.isBot,
      lastSeenAt: new Date(),
    });

    if (context.command === '/start') {
      await this.handleStart(context);
      return;
    }

    const session = await this.telegramSessionRepository.findActiveByUserId(context.telegramUserId);
    if (!session) {
      await this.botClient.sendMessage(context.chatId, 'Пожалуйста, нажмите /start, чтобы начать.');
      return;
    }

    if (context.command === '/stop') {
      await this.handleStop(session, context, 'command');
      return;
    }

    if (context.callbackData) {
      await this.trackInteraction(session, context, 'button_click', context.callbackData);
      if (context.callbackQueryId) {
        await this.botClient.answerCallbackQuery(context.callbackQueryId);
      }
      await this.handleCallback(session, context);
      return;
    }

    if (context.messageText) {
      await this.trackInteraction(session, context, 'message', null, context.messageText);
      session.update({ lastInteractionAt: new Date() });
      await this.telegramSessionRepository.update(session);
      await this.botClient.sendMessage(
        context.chatId,
        'Я пока умею работать с кнопками. Пожалуйста, выберите вариант на экране.',
      );
    }
  }

  private async handleStart(context: ParsedUpdateContext): Promise<void> {
    const deepLinkPayload = this.tryDecodeStartPayload(context.commandPayload);
    const deepLinkRecord = deepLinkPayload?.dl
      ? await this.deepLinkRepository.findActiveById(deepLinkPayload.dl, new Date())
      : null;

    const flow = deepLinkRecord?.flow ?? deepLinkPayload?.f ?? TelegramFlow.concierge;
    const topicCode = deepLinkRecord?.topicCode ?? deepLinkPayload?.t ?? null;
    const deepLinkId = deepLinkRecord?.deepLinkId ?? deepLinkPayload?.dl ?? null;
    const target = deepLinkRecord?.target ?? TelegramTarget.bot;
    const skipOnboarding = this.shouldSkipOnboarding(flow);

    await this.telegramSessionRepository.deactivateSessions(context.telegramUserId);

    const session = TelegramSession.start({
      id: crypto.randomUUID(),
      telegramUserId: context.telegramUserId,
      flow,
      deepLinkId,
      topicCode,
      state: target === TelegramTarget.channel
        ? TelegramSessionState.channel_confirmation
        : skipOnboarding
          ? TelegramSessionState.idle
          : topicCode
          ? TelegramSessionState.onboarding_frequency
          : TelegramSessionState.onboarding_topic,
    });

    await this.telegramSessionRepository.create(session);

    if (target === TelegramTarget.bot) {
      await this.trackingService.trackTelegramSubscribeConfirmed({
        tgTarget: TelegramTarget.bot,
        deepLinkId,
        tgFlow: flow,
        topic: topicCode ?? undefined,
      });
    }
    await this.trackingService.trackTelegramInteraction({
      interactionType: 'command',
      tgFlow: flow,
      deepLinkId: deepLinkId ?? undefined,
      topic: topicCode ?? undefined,
      hasText: context.messageText ? true : undefined,
      textLengthBucket: context.messageText ? this.getTextLengthBucket(context.messageText.length) : undefined,
    });

    if (target === TelegramTarget.channel) {
      await this.sendChannelConfirmation(session, context.chatId);
      return;
    }

    if (skipOnboarding) {
      await this.sendFlowIntro(session, context);
      session.update({ state: TelegramSessionState.idle });
      await this.telegramSessionRepository.update(session);
      return;
    }

    await this.botClient.sendMessage(
      context.chatId,
      'Привет! Я помогу с планом, сохранением материалов и записью.',
    );

    const nextState = await this.startOnboardingUseCase.execute({
      chatId: context.chatId,
      hasTopic: Boolean(topicCode),
    });
    session.update({ state: nextState });
    await this.telegramSessionRepository.update(session);
  }

  private async handleCallback(session: TelegramSession, context: ParsedUpdateContext): Promise<void> {
    const data = context.callbackData || '';
    if (data === STOP_BUTTON) {
      await this.handleStop(session, context, 'button');
      return;
    }

    if (data === CHANNEL_CONFIRM_BUTTON) {
      await this.handleChannelConfirmation(session, context);
      return;
    }

    if (data.startsWith(ONBOARD_TOPIC_PREFIX)) {
      const topic = data.replace(ONBOARD_TOPIC_PREFIX, '').trim();
      session.update({
        topicCode: topic || null,
        state: TelegramSessionState.onboarding_frequency,
        lastInteractionAt: new Date(),
      });
      await this.telegramSessionRepository.update(session);
      await this.botClient.sendMessage(
        context.chatId,
        'Спасибо. Как часто вам удобно получать материалы?',
        {
          replyMarkup: {
            inline_keyboard: [
              [
                { text: '1-2 раза в неделю', callback_data: `tg_onboard_freq:${TelegramFrequency.weekly_1_2}` },
                { text: '3-4 раза в неделю', callback_data: `tg_onboard_freq:${TelegramFrequency.weekly_3_4}` },
              ],
              [
                { text: 'По запросу', callback_data: `tg_onboard_freq:${TelegramFrequency.on_demand}` },
              ],
            ],
          },
        },
      );
      return;
    }

    if (data.startsWith(ONBOARD_FREQ_PREFIX)) {
      const frequency = data.replace(ONBOARD_FREQ_PREFIX, '').trim() as TelegramFrequency;
      session.update({
        frequency,
        state: TelegramSessionState.idle,
        lastInteractionAt: new Date(),
      });
      await this.telegramSessionRepository.update(session);
      await this.trackingService.trackTelegramOnboardingCompleted({
        deepLinkId: session.deepLinkId ?? undefined,
        segment: session.topicCode ?? 'other',
        frequency,
      });
      await this.sendFlowIntro(session, context);
      return;
    }

    if (data.startsWith(CONCIERGE_FORMAT_PREFIX)) {
      const format = data.replace(CONCIERGE_FORMAT_PREFIX, '').trim();
      session.update({
        conciergePreferences: {
          ...(session.conciergePreferences ?? {}),
          format,
        },
        state: TelegramSessionState.concierge_time,
        lastInteractionAt: new Date(),
      });
      await this.telegramSessionRepository.update(session);
      await this.askConciergeTime(context.chatId);
      return;
    }

    if (data.startsWith(CONCIERGE_TIME_PREFIX)) {
      const timeWindow = data.replace(CONCIERGE_TIME_PREFIX, '').trim();
      session.update({
        conciergePreferences: {
          ...(session.conciergePreferences ?? {}),
          timeWindow,
        },
        state: TelegramSessionState.concierge_goal,
        lastInteractionAt: new Date(),
      });
      await this.telegramSessionRepository.update(session);
      await this.askConciergeGoal(context.chatId);
      return;
    }

    if (data.startsWith(CONCIERGE_GOAL_PREFIX)) {
      const goal = data.replace(CONCIERGE_GOAL_PREFIX, '').trim();
      session.update({
        conciergePreferences: {
          ...(session.conciergePreferences ?? {}),
          goal,
        },
        state: TelegramSessionState.idle,
        lastInteractionAt: new Date(),
      });
      await this.telegramSessionRepository.update(session);
      await this.sendConciergeSummary(session, context.chatId);
    }
  }

  private async sendFlowIntro(session: TelegramSession, context: ParsedUpdateContext): Promise<void> {
    const flow = session.flow ?? TelegramFlow.concierge;
    switch (flow) {
      case TelegramFlow.plan_7d:
      case TelegramFlow.challenge_7d:
        await this.sendPlanMessageUseCase.execute({
          chatId: context.chatId,
          flow,
          topicCode: session.topicCode,
          deepLinkId: session.deepLinkId,
        });
        await this.scheduleSeries(session, flow === TelegramFlow.challenge_7d
          ? TelegramSeriesType.challenge_7d
          : TelegramSeriesType.plan_7d);
        break;
      case TelegramFlow.save_resource:
        await this.sendSaveResourceMessage(session, context.chatId);
        await this.scheduleReminder(session, TelegramSeriesType.save_resource_reminder);
        break;
      case TelegramFlow.prep:
        await this.sendPrepChecklist(session, context.chatId);
        break;
      case TelegramFlow.ritual:
        await this.sendRitualMessage(session, context.chatId);
        await this.scheduleReminder(session, TelegramSeriesType.ritual_reminder);
        break;
      case TelegramFlow.boundaries:
        await this.sendBoundariesMessage(session, context.chatId);
        await this.scheduleReminder(session, TelegramSeriesType.boundaries_reminder);
        break;
      case TelegramFlow.favorites:
        await this.sendFavoritesMessage(session, context.chatId);
        break;
      case TelegramFlow.concierge:
        await this.startConciergeFlow(session, context.chatId);
        break;
      case TelegramFlow.question:
        await this.sendQuestionAck(context.chatId, session.deepLinkId);
        break;
      default:
        await this.botClient.sendMessage(context.chatId, 'Готово. Если нужна запись — нажмите /start снова.');
    }
  }

  private async sendSaveResourceMessage(session: TelegramSession, chatId: string): Promise<void> {
    const deepLink = session.deepLinkId
      ? await this.deepLinkRepository.findById(session.deepLinkId)
      : null;
    await this.botClient.sendMessage(
      chatId,
      'Материал сохранен. Если хотите вернуться к нему позже, можно открыть на сайте.',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть на сайте',
                url: this.buildSiteUrl(session.deepLinkId, session.topicCode, session.flow, deepLink?.sourcePage ?? null),
              },
            ],
            [
              { text: 'Стоп', callback_data: STOP_BUTTON },
            ],
          ],
        },
        disableWebPagePreview: true,
      },
    );
  }

  private async sendPrepChecklist(session: TelegramSession, chatId: string): Promise<void> {
    await this.botClient.sendMessage(
      chatId,
      'Подготовка к первой встрече: короткий чек-лист и мягкий старт уже доступны.',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть чек-лист',
                url: this.buildSiteUrl(session.deepLinkId, session.topicCode, session.flow, '/start/consultation-prep'),
              },
            ],
            [
              {
                text: 'Записаться',
                url: this.buildBookingUrl(session.deepLinkId, TelegramFlow.prep),
              },
            ],
            [
              { text: 'Стоп', callback_data: STOP_BUTTON },
            ],
          ],
        },
        disableWebPagePreview: true,
      },
    );
  }

  private async sendRitualMessage(session: TelegramSession, chatId: string): Promise<void> {
    const deepLink = session.deepLinkId
      ? await this.deepLinkRepository.findById(session.deepLinkId)
      : null;
    await this.botClient.sendMessage(
      chatId,
      'Ритуал сохранен. Можно вернуться к нему в удобное время.',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть ритуал',
                url: this.buildSiteUrl(session.deepLinkId, session.topicCode, session.flow, deepLink?.sourcePage ?? null),
              },
            ],
            [
              { text: 'Стоп', callback_data: STOP_BUTTON },
            ],
          ],
        },
        disableWebPagePreview: true,
      },
    );
  }

  private async sendBoundariesMessage(session: TelegramSession, chatId: string): Promise<void> {
    const deepLink = session.deepLinkId
      ? await this.deepLinkRepository.findById(session.deepLinkId)
      : null;
    await this.botClient.sendMessage(
      chatId,
      'Скрипты границ сохранены. Если нужно, можно вернуться и выбрать вариант.',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть скрипты',
                url: this.buildSiteUrl(session.deepLinkId, session.topicCode, session.flow, deepLink?.sourcePage ?? null),
              },
            ],
            [
              { text: 'Стоп', callback_data: STOP_BUTTON },
            ],
          ],
        },
        disableWebPagePreview: true,
      },
    );
  }

  private async sendFavoritesMessage(session: TelegramSession, chatId: string): Promise<void> {
    await this.botClient.sendMessage(
      chatId,
      'Избранное доступно на сайте. Можно открыть аптечку и вернуться к материалам.',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть избранное',
                url: this.buildSiteUrl(session.deepLinkId, session.topicCode, session.flow, '/start/favorites'),
              },
            ],
            [
              { text: 'Стоп', callback_data: STOP_BUTTON },
            ],
          ],
        },
        disableWebPagePreview: true,
      },
    );
  }

  private async startConciergeFlow(session: TelegramSession, chatId: string): Promise<void> {
    session.update({
      state: TelegramSessionState.concierge_format,
      lastInteractionAt: new Date(),
    });
    await this.telegramSessionRepository.update(session);
    await this.askConciergeFormat(chatId);
  }

  private async askConciergeFormat(chatId: string): Promise<void> {
    await this.botClient.sendMessage(
      chatId,
      'Помогу с записью. Какой формат вам удобнее?',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              { text: 'Онлайн', callback_data: `${CONCIERGE_FORMAT_PREFIX}online` },
              { text: 'Офлайн', callback_data: `${CONCIERGE_FORMAT_PREFIX}offline` },
            ],
            [
              { text: 'Без разницы', callback_data: `${CONCIERGE_FORMAT_PREFIX}any` },
            ],
          ],
        },
      },
    );
  }

  private async askConciergeTime(chatId: string): Promise<void> {
    await this.botClient.sendMessage(
      chatId,
      'Когда удобнее по времени?',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              { text: 'Утро/день', callback_data: `${CONCIERGE_TIME_PREFIX}weekday_morning` },
              { text: 'Вечер', callback_data: `${CONCIERGE_TIME_PREFIX}weekday_evening` },
            ],
            [
              { text: 'Выходные', callback_data: `${CONCIERGE_TIME_PREFIX}weekend` },
              { text: 'Не важно', callback_data: `${CONCIERGE_TIME_PREFIX}any` },
            ],
          ],
        },
      },
    );
  }

  private async askConciergeGoal(chatId: string): Promise<void> {
    await this.botClient.sendMessage(
      chatId,
      'С чем хотели бы начать?',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              { text: 'Тревога', callback_data: `${CONCIERGE_GOAL_PREFIX}anxiety` },
              { text: 'Выгорание', callback_data: `${CONCIERGE_GOAL_PREFIX}burnout` },
            ],
            [
              { text: 'Отношения', callback_data: `${CONCIERGE_GOAL_PREFIX}relationships` },
              { text: 'Другое', callback_data: `${CONCIERGE_GOAL_PREFIX}other` },
            ],
          ],
        },
      },
    );
  }

  private async sendConciergeSummary(session: TelegramSession, chatId: string): Promise<void> {
    await this.botClient.sendMessage(
      chatId,
      'Спасибо! Я передам информацию и помогу с записью. Если хотите выбрать слот сами — можно перейти на сайт.',
      {
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: 'Открыть запись',
                url: this.buildBookingUrl(session.deepLinkId, session.flow ?? TelegramFlow.concierge),
              },
            ],
            [
              { text: 'Стоп', callback_data: STOP_BUTTON },
            ],
          ],
        },
        disableWebPagePreview: true,
      },
    );
  }

  private async sendQuestionAck(chatId: string, deepLinkId: string | null): Promise<void> {
    const deepLink = deepLinkId ? await this.deepLinkRepository.findById(deepLinkId) : null;
    const questionId = deepLink?.entityRef ?? null;
    const questionLine = questionId ? `ID вопроса: ${questionId}.` : '';
    await this.botClient.sendMessage(
      chatId,
      [
        'Спасибо! Ответ на вопрос придет в Telegram.',
        questionLine,
        'Это не экстренная помощь. Если нужна запись — используйте кнопку ниже.',
      ].filter(Boolean).join('\n'),
      {
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: 'Записаться',
                url: this.buildBookingUrl(null, TelegramFlow.question),
              },
            ],
            [
              { text: 'Стоп', callback_data: STOP_BUTTON },
            ],
          ],
        },
        disableWebPagePreview: true,
      },
    );
  }

  private async handleChannelConfirmation(session: TelegramSession, context: ParsedUpdateContext): Promise<void> {
    if (session.state !== TelegramSessionState.channel_confirmation) {
      await this.botClient.sendMessage(context.chatId, 'Подписка уже подтверждена. Если нужно — нажмите /start.');
      return;
    }

    await this.trackingService.trackTelegramSubscribeConfirmed({
      tgTarget: TelegramTarget.channel,
      deepLinkId: session.deepLinkId ?? undefined,
      tgFlow: session.flow ?? undefined,
      topic: session.topicCode ?? undefined,
    });

    const nextState = await this.startOnboardingUseCase.execute({
      chatId: context.chatId,
      hasTopic: Boolean(session.topicCode),
    });
    session.update({ state: nextState, lastInteractionAt: new Date() });
    await this.telegramSessionRepository.update(session);
  }

  private async handleStop(session: TelegramSession, context: ParsedUpdateContext, stopMethod: string): Promise<void> {
    session.update({
      seriesType: null,
      seriesStep: null,
      nextSendAt: null,
      lastMessageKey: null,
    });
    session.stop();
    await this.telegramSessionRepository.update(session);
    await this.trackingService.trackTelegramSeriesStopped({
      tgFlow: session.flow ?? TelegramFlow.concierge,
      stopMethod,
      deepLinkId: session.deepLinkId ?? undefined,
    });
    await this.botClient.sendMessage(context.chatId, 'Ок, остановила серию. Если захотите вернуться — нажмите /start.');
  }

  private async sendChannelConfirmation(session: TelegramSession, chatId: string): Promise<void> {
    const channelUrl = this.buildChannelUrl();
    const keyboard = [];
    if (channelUrl) {
      keyboard.push([{ text: 'Открыть канал', url: channelUrl }]);
    }
    keyboard.push([{ text: 'Я подписался(ась)', callback_data: CHANNEL_CONFIRM_BUTTON }]);
    keyboard.push([{ text: 'Стоп', callback_data: STOP_BUTTON }]);

    await this.botClient.sendMessage(
      chatId,
      'Подпишитесь на канал, чтобы получать материалы. Когда будете готовы, нажмите кнопку ниже.',
      {
        replyMarkup: {
          inline_keyboard: keyboard,
        },
        disableWebPagePreview: true,
      },
    );
  }

  private async trackInteraction(
    session: TelegramSession,
    context: ParsedUpdateContext,
    interactionType: string,
    buttonId: string | null,
    messageText?: string | null,
  ): Promise<void> {
    await this.trackingService.trackTelegramInteraction({
      interactionType,
      tgFlow: session.flow ?? TelegramFlow.concierge,
      deepLinkId: session.deepLinkId ?? undefined,
      buttonId: buttonId ?? undefined,
      topic: session.topicCode ?? undefined,
      hasText: messageText ? true : undefined,
      textLengthBucket: messageText ? this.getTextLengthBucket(messageText.length) : undefined,
    });
  }

  private parseUpdate(update: TelegramUpdateDto): ParsedUpdateContext | null {
    if (update.message) {
      const message = update.message;
      const chatId = String(message.chat.id);
      const from = message.from;
      if (!from) {
        return null;
      }
      const text = message.text ?? '';
      const command = text.startsWith('/') ? text.split(' ')[0] : null;
      const payload = text.startsWith('/start') ? text.split(' ')[1] : null;
      return {
        chatId,
        telegramUserId: String(from.id),
        username: from.username ?? null,
        firstName: from.first_name ?? null,
        lastName: from.last_name ?? null,
        languageCode: from.language_code ?? null,
        isBot: Boolean(from.is_bot),
        messageText: text || null,
        command,
        commandPayload: payload ?? null,
        callbackData: null,
        callbackQueryId: null,
      };
    }

    if (update.callback_query) {
      const callback = update.callback_query;
      const from = callback.from;
      const chatId = callback.message?.chat?.id;
      if (!from || typeof chatId !== 'number') {
        return null;
      }
      return {
        chatId: String(chatId),
        telegramUserId: String(from.id),
        username: from.username ?? null,
        firstName: from.first_name ?? null,
        lastName: from.last_name ?? null,
        languageCode: from.language_code ?? null,
        isBot: Boolean(from.is_bot),
        messageText: null,
        command: null,
        commandPayload: null,
        callbackData: callback.data ?? null,
        callbackQueryId: callback.id ?? null,
      };
    }

    return null;
  }

  private tryDecodeStartPayload(encoded: string | null): { dl: string; f: TelegramFlow; t?: string; e?: string; s?: string } | null {
    if (!encoded) {
      return null;
    }
    try {
      return DeepLinkPayloadCodec.decode(encoded);
    } catch {
      return null;
    }
  }

  private buildBookingUrl(deepLinkId: string | null, flow: TelegramFlow): string {
    const base = this.configService.get<string>('PUBLIC_WEB_URL') || 'http://localhost:3000';
    const url = new URL('/booking/', base);
    url.searchParams.set('utm_source', 'telegram');
    url.searchParams.set('utm_medium', TelegramTarget.bot);
    url.searchParams.set('utm_campaign', flow);
    if (deepLinkId) {
      url.searchParams.set('dl', deepLinkId);
    }
    return url.toString();
  }

  private buildSiteUrl(
    deepLinkId: string | null,
    topicCode: string | null,
    flow: TelegramFlow | null,
    sourcePage: string | null,
  ): string {
    const base = this.configService.get<string>('PUBLIC_WEB_URL') || 'http://localhost:3000';
    const safePath = this.normalizeSourcePath(sourcePage) ?? '/';
    const url = new URL(safePath, base);
    url.searchParams.set('utm_source', 'telegram');
    url.searchParams.set('utm_medium', TelegramTarget.bot);
    url.searchParams.set('utm_campaign', flow ?? TelegramFlow.save_resource);
    if (topicCode) {
      url.searchParams.set('topic', topicCode);
    }
    if (deepLinkId) {
      url.searchParams.set('dl', deepLinkId);
    }
    return url.toString();
  }

  private buildChannelUrl(): string | null {
    const channelUsername = this.configService.get<string>('TELEGRAM_CHANNEL_USERNAME');
    if (!channelUsername) {
      return null;
    }
    return `https://t.me/${channelUsername.replace(/^@/, '')}`;
  }

  private normalizeSourcePath(sourcePage: string | null): string | null {
    if (!sourcePage) {
      return null;
    }
    const trimmed = sourcePage.trim();
    if (!trimmed.startsWith('/')) {
      return null;
    }
    if (trimmed.includes('://') || trimmed.includes('..')) {
      return null;
    }
    return trimmed;
  }

  private getTextLengthBucket(length: number): string {
    if (length <= 0) return '0';
    if (length <= 20) return '1_20';
    if (length <= 80) return '21_80';
    if (length <= 200) return '81_200';
    return '200_plus';
  }

  private shouldSkipOnboarding(flow: TelegramFlow): boolean {
    return [
      TelegramFlow.save_resource,
      TelegramFlow.prep,
      TelegramFlow.ritual,
      TelegramFlow.boundaries,
      TelegramFlow.favorites,
      TelegramFlow.question,
    ].includes(flow);
  }

  private async scheduleSeries(session: TelegramSession, seriesType: TelegramSeriesType): Promise<void> {
    const delayHours = this.configService.get<number>('TELEGRAM_SERIES_STEP_DELAY_HOURS') ?? 24;
    session.update({
      seriesType,
      seriesStep: 1,
      nextSendAt: new Date(Date.now() + delayHours * 60 * 60 * 1000),
      lastMessageKey: `${seriesType}_day_1`,
      lastInteractionAt: new Date(),
    });
    await this.telegramSessionRepository.update(session);
  }

  private async scheduleReminder(session: TelegramSession, seriesType: TelegramSeriesType): Promise<void> {
    const delayHours = this.configService.get<number>('TELEGRAM_REMINDER_DELAY_HOURS') ?? 24;
    session.update({
      seriesType,
      seriesStep: 1,
      nextSendAt: new Date(Date.now() + delayHours * 60 * 60 * 1000),
      lastMessageKey: `${seriesType}_scheduled`,
      lastInteractionAt: new Date(),
    });
    await this.telegramSessionRepository.update(session);
  }
}

interface ParsedUpdateContext {
  chatId: string;
  telegramUserId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  languageCode: string | null;
  isBot: boolean;
  messageText: string | null;
  command: string | null;
  commandPayload: string | null;
  callbackData: string | null;
  callbackQueryId: string | null;
}
