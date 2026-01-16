import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITelegramBotClient } from '@domain/telegram/services/ITelegramBotClient';
import { TelegramFlow, TelegramTarget } from '@domain/telegram/value-objects/TelegramEnums';

@Injectable()
export class SendPlanMessageUseCase {
  constructor(
    @Inject('ITelegramBotClient')
    private readonly botClient: ITelegramBotClient,
    private readonly configService: ConfigService,
  ) {}

  async execute(params: {
    chatId: string;
    flow: TelegramFlow;
    topicCode: string | null;
    deepLinkId: string | null;
  }): Promise<void> {
    const intro = params.flow === TelegramFlow.challenge_7d
      ? 'Стартуем 7-дневный челлендж.'
      : 'Вот план на 7 дней.';
    const topicLine = params.topicCode ? `Тема: ${this.humanizeTopic(params.topicCode)}.` : '';
    const message = [
      `${intro} ${topicLine}`.trim(),
      'День 1: короткое упражнение на 2-3 минуты. Если откликается, начните сейчас.',
      'Если понадобится поддержка или запись — я рядом.',
    ].filter(Boolean).join('\n');

    await this.botClient.sendMessage(params.chatId, message, {
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: 'Записаться',
              url: this.buildBookingUrl(params.deepLinkId, params.flow),
            },
          ],
          [
            {
              text: 'Стоп',
              callback_data: 'tg_stop',
            },
          ],
        ],
      },
      disableWebPagePreview: true,
    });
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
