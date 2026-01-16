import { Inject, Injectable } from '@nestjs/common';
import { ITelegramBotClient } from '@domain/telegram/services/ITelegramBotClient';
import { TelegramFrequency, TelegramSessionState } from '@domain/telegram/value-objects/TelegramEnums';

const TOPIC_OPTIONS = [
  { code: 'anxiety', label: 'Тревога' },
  { code: 'burnout', label: 'Выгорание' },
  { code: 'relationships', label: 'Отношения' },
  { code: 'boundaries', label: 'Границы' },
  { code: 'selfesteem', label: 'Самооценка' },
  { code: 'other', label: 'Другое' },
];

@Injectable()
export class StartOnboardingUseCase {
  constructor(
    @Inject('ITelegramBotClient')
    private readonly botClient: ITelegramBotClient,
  ) {}

  async execute(params: {
    chatId: string;
    hasTopic: boolean;
  }): Promise<TelegramSessionState> {
    if (params.hasTopic) {
      await this.botClient.sendMessage(
        params.chatId,
        'Отлично. Как часто вам удобно получать материалы?',
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
      return TelegramSessionState.onboarding_frequency;
    }

    await this.botClient.sendMessage(
      params.chatId,
      'Подскажите, что сейчас ближе по теме — так я подберу релевантные материалы.',
      {
        replyMarkup: {
          inline_keyboard: [
            TOPIC_OPTIONS.slice(0, 2).map((topic) => ({
              text: topic.label,
              callback_data: `tg_onboard_topic:${topic.code}`,
            })),
            TOPIC_OPTIONS.slice(2, 4).map((topic) => ({
              text: topic.label,
              callback_data: `tg_onboard_topic:${topic.code}`,
            })),
            TOPIC_OPTIONS.slice(4).map((topic) => ({
              text: topic.label,
              callback_data: `tg_onboard_topic:${topic.code}`,
            })),
          ],
        },
      },
    );

    return TelegramSessionState.onboarding_topic;
  }
}
