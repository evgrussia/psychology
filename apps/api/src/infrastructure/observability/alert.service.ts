import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService } from '@domain/notifications/services/IEmailService';
import { AlertPayload, IAlertService } from '@domain/observability/services/IAlertService';
import { AppLogger } from '../logging/logger.service';
import { redactSensitiveData } from './redaction';

const DEFAULT_ALERT_INTERVAL_MINUTES = 15;

@Injectable()
export class AlertService implements IAlertService {
  private readonly logger = new AppLogger('AlertService');
  private readonly enabled: boolean;
  private readonly alertEmailTo: string | null;
  private readonly minIntervalMs: number;
  private readonly lastAlertAtByKey = new Map<string, number>();

  constructor(
    private readonly configService: ConfigService,
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
  ) {
    this.enabled = (this.configService.get<string>('ALERTS_ENABLED') || '').toLowerCase() !== 'false';
    this.alertEmailTo = this.configService.get<string>('ALERT_EMAIL_TO')?.trim() || null;
    const intervalMinutes = this.configService.get<number>('ALERT_MIN_INTERVAL_MINUTES') || DEFAULT_ALERT_INTERVAL_MINUTES;
    this.minIntervalMs = intervalMinutes * 60 * 1000;
  }

  async notify(payload: AlertPayload): Promise<void> {
    const severity = payload.severity ?? 'critical';
    const key = payload.key;
    if (!this.enabled || !this.alertEmailTo) {
      this.logger.warn({
        message: 'Alert skipped because alerts are disabled or email not configured',
        key,
        severity,
      });
      return;
    }

    if (!this.shouldNotify(key)) {
      return;
    }

    const safePayload = redactSensitiveData({
      ...payload,
      severity,
    }) as AlertPayload;

    const subject = `[ALERT:${severity}] ${safePayload.source ?? 'system'} - ${safePayload.key}`;
    const body = JSON.stringify(safePayload, null, 2);

    try {
      await this.emailService.sendEmail(this.alertEmailTo, subject, body);
      this.logger.warn({ message: 'Alert sent', key, severity });
    } catch (error: any) {
      this.logger.error(
        { message: 'Failed to send alert', key, severity, reason: error?.message ?? 'unknown_error' },
        error?.stack,
      );
    }
  }

  private shouldNotify(key: string): boolean {
    const now = Date.now();
    const lastAt = this.lastAlertAtByKey.get(key) ?? 0;
    if (now - lastAt < this.minIntervalMs) {
      return false;
    }
    this.lastAlertAtByKey.set(key, now);
    return true;
  }
}
