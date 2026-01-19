import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logging/logger.service';
import { ProcessTelegramScheduledMessagesUseCase } from '@application/telegram/use-cases/ProcessTelegramScheduledMessagesUseCase';

const DEFAULT_SCHEDULE_INTERVAL_MS = 60000;

@Injectable()
export class TelegramSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new AppLogger('TelegramSchedulerService');
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    @Inject(ProcessTelegramScheduledMessagesUseCase)
    private readonly processScheduledMessages: ProcessTelegramScheduledMessagesUseCase,
  ) {}

  onModuleInit(): void {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn({ message: 'Telegram bot token is not configured, scheduler disabled' });
      return;
    }
    const intervalMs = this.configService.get<number>('TELEGRAM_SCHEDULE_INTERVAL_MS')
      ?? DEFAULT_SCHEDULE_INTERVAL_MS;
    this.timer = setInterval(() => {
      this.tick().catch((error) => {
        this.logger.error({ message: 'Telegram schedule tick failed', reason: error?.message || 'unknown_error' });
      });
    }, intervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    try {
      await this.processScheduledMessages.execute();
    } finally {
      this.isRunning = false;
    }
  }
}
