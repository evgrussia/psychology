import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITelegramSessionRepository } from '@domain/telegram/repositories/ITelegramSessionRepository';
import { IDeepLinkRepository } from '@domain/telegram/repositories/IDeepLinkRepository';
import { ITelegramBotClient } from '@domain/telegram/services/ITelegramBotClient';
import { TelegramFlow, TelegramTarget } from '@domain/telegram/value-objects/TelegramEnums';
import { TelegramSeriesType } from '@domain/telegram/value-objects/TelegramSeriesType';
import { TelegramSession } from '@domain/telegram/entities/TelegramSession';
import { TrackingService } from '@infrastructure/tracking/tracking.service';

const DEFAULT_BATCH_LIMIT = 50;
const DEFAULT_STEP_DELAY_HOURS = 24;
const DEFAULT_REMINDER_DELAY_HOURS = 24;
const STOP_BUTTON = 'tg_stop';

@Injectable()
export class ProcessTelegramScheduledMessagesUseCase {
  private readonly logger = new Logger(ProcessTelegramScheduledMessagesUseCase.name);

  constructor(
    @Inject('ITelegramSessionRepository')
    private readonly telegramSessionRepository: ITelegramSessionRepository,
    @Inject('IDeepLinkRepository')
    private readonly deepLinkRepository: IDeepLinkRepository,
    @Inject('ITelegramBotClient')
    private readonly botClient: ITelegramBotClient,
    private readonly configService: ConfigService,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(now: Date = new Date()): Promise<void> {
    const limit = this.configService.get<number>('TELEGRAM_SCHEDULE_BATCH_LIMIT') ?? DEFAULT_BATCH_LIMIT;
    const sessions = await this.telegramSessionRepository.findDueScheduledSessions(now, limit);
    if (sessions.length === 0) {
      return;
    }

    for (const session of sessions) {
      await this.processSession(session, now);
    }
  }

  private async processSession(session: TelegramSession, now: Date): Promise<void> {
    const seriesType = session.seriesType;
    if (!seriesType) {
      session.update({ nextSendAt: null });
      await this.telegramSessionRepository.update(session);
      return;
    }

    try {
      switch (seriesType) {
        case TelegramSeriesType.plan_7d:
        case TelegramSeriesType.challenge_7d:
          await this.sendNextPlanStep(session, seriesType, now);
          return;
        case TelegramSeriesType.save_resource_reminder:
        case TelegramSeriesType.ritual_reminder:
        case TelegramSeriesType.boundaries_reminder:
          await this.sendReminder(session, seriesType, now);
          return;
        default:
          this.logger.warn(`Unknown series type: ${seriesType}`);
          session.update({ seriesType: null, seriesStep: null, nextSendAt: null });
          await this.telegramSessionRepository.update(session);
      }
    } catch (error: any) {
      this.logger.warn(`Failed to process scheduled message: ${error?.message ?? 'unknown_error'}`);
    }
  }

  private async sendNextPlanStep(
    session: TelegramSession,
    seriesType: TelegramSeriesType.plan_7d | TelegramSeriesType.challenge_7d,
    now: Date,
  ): Promise<void> {
    const currentStep = session.seriesStep ?? 1;
    const nextStep = currentStep + 1;
    if (nextStep > 7) {
      session.update({ seriesType: null, seriesStep: null, nextSendAt: null });
      await this.telegramSessionRepository.update(session);
      return;
    }

    const messageKey = `${seriesType}_day_${nextStep}`;
    const message = this.buildPlanStepMessage(seriesType, nextStep, session.topicCode);
    await this.botClient.sendMessage(session.telegramUserId, message, {
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: 'Записаться',
              url: this.buildBookingUrl(session.deepLinkId, session.flow ?? TelegramFlow.plan_7d),
            },
          ],
          [
            {
              text: 'Стоп',
              callback_data: STOP_BUTTON,
            },
          ],
        ],
      },
      disableWebPagePreview: true,
    });

    await this.trackingService.trackTelegramInteraction({
      interactionType: 'scheduled_message',
      tgFlow: session.flow ?? TelegramFlow.plan_7d,
      deepLinkId: session.deepLinkId ?? undefined,
      messageTemplateId: messageKey,
      topic: session.topicCode ?? undefined,
    });

    const delayHours = this.configService.get<number>('TELEGRAM_SERIES_STEP_DELAY_HOURS') ?? DEFAULT_STEP_DELAY_HOURS;
    session.update({
      seriesType,
      seriesStep: nextStep,
      nextSendAt: new Date(now.getTime() + delayHours * 60 * 60 * 1000),
      lastMessageKey: messageKey,
      lastInteractionAt: now,
    });
    await this.telegramSessionRepository.update(session);
  }

  private async sendReminder(
    session: TelegramSession,
    seriesType: TelegramSeriesType.save_resource_reminder | TelegramSeriesType.ritual_reminder | TelegramSeriesType.boundaries_reminder,
    now: Date,
  ): Promise<void> {
    const deepLink = session.deepLinkId
      ? await this.deepLinkRepository.findById(session.deepLinkId)
      : null;
    const sourcePage = deepLink?.sourcePage ?? null;
    const message = this.buildReminderMessage(seriesType);
    const messageKey = `${seriesType}_reminder`;

    await this.botClient.sendMessage(session.telegramUserId, message, {
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: 'Открыть на сайте',
              url: this.buildSiteUrl(session.deepLinkId, session.topicCode, session.flow, sourcePage),
            },
          ],
          [
            {
              text: 'Стоп',
              callback_data: STOP_BUTTON,
            },
          ],
        ],
      },
      disableWebPagePreview: true,
    });

    await this.trackingService.trackTelegramInteraction({
      interactionType: 'scheduled_message',
      tgFlow: session.flow ?? TelegramFlow.save_resource,
      deepLinkId: session.deepLinkId ?? undefined,
      messageTemplateId: messageKey,
      topic: session.topicCode ?? undefined,
    });

    session.update({
      seriesType: null,
      seriesStep: null,
      nextSendAt: null,
      lastMessageKey: messageKey,
      lastInteractionAt: now,
    });
    await this.telegramSessionRepository.update(session);
  }

  private buildPlanStepMessage(seriesType: TelegramSeriesType, step: number, topicCode: string | null): string {
    const intro = seriesType === TelegramSeriesType.challenge_7d
      ? `Челлендж 7 дней: день ${step}.`
      : `План на 7 дней: день ${step}.`;
    const topicLine = topicCode ? `Тема: ${this.humanizeTopic(topicCode)}.` : '';
    return [
      `${intro} ${topicLine}`.trim(),
      'Небольшой шаг сегодня поддержит ваш ритм.',
      'Если хочется поддержки — можно записаться.',
    ].filter(Boolean).join('\n');
  }

  private buildReminderMessage(seriesType: TelegramSeriesType): string {
    switch (seriesType) {
      case TelegramSeriesType.ritual_reminder:
        return 'Небольшое напоминание: можно вернуться к ритуалу и сделать короткий шаг.';
      case TelegramSeriesType.boundaries_reminder:
        return 'Напоминание: если нужно, можно вернуться к скриптам границ и выбрать вариант.';
      default:
        return 'Напоминание: сохранённый материал доступен, можно открыть его на сайте.';
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

  private humanizeTopic(code: string): string {
    switch (code) {
      case 'anxiety':
        return 'Тревога';
      case 'burnout':
        return 'Выгорание';
      case 'relationships':
        return 'Отношения';
      case 'boundaries':
        return 'Границы';
      case 'selfesteem':
        return 'Самооценка';
      default:
        return 'Другое';
    }
  }
}
