import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logging/logger.service';
import { ITelegramBotClient } from '@domain/telegram/services/ITelegramBotClient';
import { HandleTelegramUpdateUseCase } from '@application/telegram/use-cases/HandleTelegramUpdateUseCase';

type TelegramUpdatesMode = 'webhook' | 'polling' | 'auto';

@Injectable()
export class TelegramUpdatesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new AppLogger('TelegramUpdatesService');
  private timer: NodeJS.Timeout | null = null;
  private offset: number | undefined;
  private isPolling = false;

  constructor(
    @Inject('ITelegramBotClient')
    private readonly botClient: ITelegramBotClient,
    private readonly configService: ConfigService,
    private readonly handleUpdateUseCase: HandleTelegramUpdateUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn({ message: 'Telegram bot token is not configured, updates listener disabled' });
      return;
    }
    const mode = (this.configService.get<string>('TELEGRAM_UPDATES_MODE') ?? 'auto') as TelegramUpdatesMode;
    if (mode === 'polling') {
      this.startPolling();
      return;
    }
    if (mode === 'webhook') {
      await this.configureWebhook();
      return;
    }

    const webhookOk = await this.configureWebhook();
    if (!webhookOk) {
      this.logger.warn({ message: 'Webhook setup failed, switching to polling mode' });
      this.startPolling();
    }
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async configureWebhook(): Promise<boolean> {
    const webhookUrl = this.configService.get<string>('TELEGRAM_WEBHOOK_URL');
    if (!webhookUrl) {
      this.logger.warn({ message: 'Telegram webhook URL is not configured' });
      return false;
    }
    const secretToken = this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET');
    const ok = await this.botClient.setWebhook({ url: webhookUrl, secretToken });
    if (!ok) {
      this.logger.warn({ message: 'Telegram webhook setup failed' });
      return false;
    }
    this.logger.log({ message: 'Telegram webhook configured' });
    return true;
  }

  private startPolling(): void {
    const intervalMs = this.configService.get<number>('TELEGRAM_POLLING_INTERVAL_MS') ?? 4000;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.poll().catch((error) => {
        this.logger.error({ message: 'Telegram polling failed', reason: error?.message || 'unknown_error' });
      });
    }, intervalMs);
  }

  private async poll(): Promise<void> {
    if (this.isPolling) {
      return;
    }
    this.isPolling = true;
    try {
      const updates = await this.botClient.getUpdates(this.offset, 0);
      if (updates.length > 0) {
        this.offset = updates[updates.length - 1].update_id + 1;
      }
      for (const update of updates) {
        await this.handleUpdateUseCase.execute(update as any);
      }
      if (updates.length > 0) {
        this.logger.log({ message: 'Telegram updates processed', count: updates.length });
      }
    } finally {
      this.isPolling = false;
    }
  }
}
