import { Injectable, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetModerationMetricsUseCase } from '@application/admin/use-cases/moderation/GetModerationMetricsUseCase';
import { IAlertService } from '@domain/observability/services/IAlertService';
import { AppLogger } from '../logging/logger.service';

const DEFAULT_ALERT_INTERVAL_MINUTES = 10;

@Injectable()
export class ModerationAlertsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new AppLogger('ModerationAlertsScheduler');
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsUseCase: GetModerationMetricsUseCase,
    @Inject('IAlertService')
    private readonly alertService: IAlertService,
  ) {}

  onModuleInit() {
    const intervalMinutes = this.configService.get<number>('MODERATION_ALERT_INTERVAL_MINUTES') || DEFAULT_ALERT_INTERVAL_MINUTES;
    this.timer = setInterval(() => {
      this.checkAlerts().catch((error) => {
        this.logger.error({ message: 'Moderation alert check failed', reason: error?.message || 'unknown_error' });
      });
    }, intervalMinutes * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async checkAlerts(): Promise<void> {
    const metrics = await this.metricsUseCase.execute();
    if (!metrics.alerts || metrics.alerts.length === 0) {
      return;
    }

    for (const alert of metrics.alerts) {
      await this.alertService.notify({
        key: `moderation_queue_${alert.type}`,
        message: alert.message,
        severity: alert.type === 'crisis_overdue' ? 'critical' : 'warning',
        source: 'moderation',
        details: {
          pending_count: metrics.queue.pendingCount,
          flagged_count: metrics.queue.flaggedCount,
          overdue_count: metrics.queue.overdueCount,
          crisis_overdue_count: metrics.queue.crisisOverdueCount,
        },
      });
    }
  }
}
