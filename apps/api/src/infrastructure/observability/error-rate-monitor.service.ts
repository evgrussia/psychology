import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAlertService } from '@domain/observability/services/IAlertService';

type ErrorRateBucket = {
  total: number;
  errors: number;
};

@Injectable()
export class ErrorRateMonitor {
  private readonly windowMs: number;
  private readonly threshold: number;
  private readonly minSamples: number;
  private readonly bucketMs = 10_000;
  private readonly buckets = new Map<number, ErrorRateBucket>();

  constructor(
    private readonly configService: ConfigService,
    @Inject('IAlertService')
    private readonly alertService: IAlertService,
  ) {
    const windowMinutes = this.configService.get<number>('ERROR_RATE_WINDOW_MINUTES') ?? 5;
    const threshold = this.configService.get<number>('ERROR_RATE_THRESHOLD') ?? 0.1;
    const minSamples = this.configService.get<number>('ERROR_RATE_MIN_SAMPLES') ?? 50;

    this.windowMs = Math.max(windowMinutes, 1) * 60 * 1000;
    this.threshold = Math.max(threshold, 0);
    this.minSamples = Math.max(minSamples, 1);
  }

  recordStatus(statusCode: number): void {
    const now = Date.now();
    const bucketKey = Math.floor(now / this.bucketMs) * this.bucketMs;
    const bucket = this.buckets.get(bucketKey) ?? { total: 0, errors: 0 };
    bucket.total += 1;
    if (statusCode >= 500) {
      bucket.errors += 1;
    }
    this.buckets.set(bucketKey, bucket);

    this.prune(now);
    void this.evaluateAndAlert();
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    for (const key of this.buckets.keys()) {
      if (key < cutoff) {
        this.buckets.delete(key);
      }
    }
  }

  private async evaluateAndAlert(): Promise<void> {
    let total = 0;
    let errors = 0;
    for (const bucket of this.buckets.values()) {
      total += bucket.total;
      errors += bucket.errors;
    }

    if (total < this.minSamples) {
      return;
    }

    const rate = total > 0 ? errors / total : 0;
    if (rate < this.threshold) {
      return;
    }

    await this.alertService.notify({
      key: 'error_rate_5xx',
      message: 'High 5xx error rate detected',
      severity: 'critical',
      source: 'api',
      details: {
        window_minutes: this.windowMs / 60000,
        total_requests: total,
        error_requests: errors,
        error_rate: Number(rate.toFixed(4)),
        threshold: this.threshold,
      },
    });
  }
}
