import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppLogger } from '../logging/logger.service';
import {
  ITelegramBotClient,
  TelegramSendMessageOptions,
  TelegramUpdate,
  TelegramWebhookConfig,
} from '@domain/telegram/services/ITelegramBotClient';
import { IAlertService } from '@domain/observability/services/IAlertService';

@Injectable()
export class TelegramBotClient implements ITelegramBotClient {
  private readonly logger = new AppLogger('TelegramBotClient');

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject('IAlertService')
    private readonly alertService: IAlertService,
  ) {}

  async sendMessage(chatId: string, text: string, options?: TelegramSendMessageOptions): Promise<void> {
    await this.call('sendMessage', {
      chat_id: chatId,
      text,
      reply_markup: options?.replyMarkup,
      disable_web_page_preview: options?.disableWebPagePreview ?? true,
    });
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    await this.call('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
    });
  }

  async setWebhook(config: TelegramWebhookConfig): Promise<boolean> {
    const result = await this.call('setWebhook', {
      url: config.url,
      secret_token: config.secretToken,
    });
    return Boolean(result?.ok);
  }

  async deleteWebhook(): Promise<boolean> {
    const result = await this.call('deleteWebhook', {});
    return Boolean(result?.ok);
  }

  async getUpdates(offset?: number, timeoutSeconds?: number): Promise<TelegramUpdate[]> {
    const result = await this.call('getUpdates', {
      offset,
      timeout: timeoutSeconds ?? 0,
      allowed_updates: ['message', 'callback_query'],
    });
    return Array.isArray(result?.result) ? result.result : [];
  }

  private async call(method: string, payload: Record<string, any>): Promise<any> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.error({ message: 'Telegram bot token is not configured', method });
      await this.alertService.notify({
        key: 'telegram_bot_token_missing',
        message: 'Telegram bot token is not configured',
        severity: 'critical',
        source: 'telegram',
        details: {
          method,
        },
      });
      return { ok: false };
    }
    const url = `https://api.telegram.org/bot${token}/${method}`;
    try {
      const response = await firstValueFrom(this.httpService.post(url, payload));
      return response.data;
    } catch (error: any) {
      const reason = error?.response?.data?.description || error?.message || 'unknown_error';
      this.logger.error({ message: 'Telegram Bot API call failed', method, reason });
      await this.alertService.notify({
        key: 'telegram_api_call_failed',
        message: 'Telegram Bot API call failed',
        severity: 'critical',
        source: 'telegram',
        details: {
          method,
          reason,
        },
      });
      return { ok: false };
    }
  }
}
