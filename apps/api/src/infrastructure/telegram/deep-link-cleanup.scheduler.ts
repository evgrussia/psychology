import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDeepLinkRepository } from '@domain/telegram/repositories/IDeepLinkRepository';
import { AppLogger } from '../logging/logger.service';

const DEFAULT_CLEANUP_INTERVAL_HOURS = 12;

@Injectable()
export class DeepLinkCleanupScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new AppLogger('DeepLinkCleanupScheduler');
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    @Inject('IDeepLinkRepository')
    private readonly deepLinkRepository: IDeepLinkRepository,
  ) {}

  onModuleInit() {
    const intervalHours = this.configService.get<number>('TELEGRAM_DEEP_LINK_CLEANUP_INTERVAL_HOURS')
      || DEFAULT_CLEANUP_INTERVAL_HOURS;
    const intervalMs = intervalHours * 60 * 60 * 1000;

    this.timer = setInterval(() => {
      this.runCleanup().catch((error) => {
        this.logger.error({ message: 'Deep link cleanup failed', reason: error?.message || 'unknown_error' });
      });
    }, intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async runCleanup(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    try {
      const deleted = await this.deepLinkRepository.deleteExpired(new Date());
      if (deleted > 0) {
        this.logger.log({ message: 'Expired deep links removed', count: deleted });
      }
    } finally {
      this.isRunning = false;
    }
  }
}
