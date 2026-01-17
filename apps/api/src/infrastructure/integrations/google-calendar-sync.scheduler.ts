import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncCalendarBusyTimesUseCase } from '@application/integrations/use-cases/SyncCalendarBusyTimesUseCase';
import { CreateCalendarEventForAppointmentUseCase } from '@application/integrations/use-cases/CreateCalendarEventForAppointmentUseCase';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { AppLogger } from '../logging/logger.service';
import { IAlertService } from '@domain/observability/services/IAlertService';

const DEFAULT_SYNC_INTERVAL_MINUTES = 15;
const DEFAULT_LOOKAHEAD_DAYS = 30;

@Injectable()
export class GoogleCalendarSyncScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new AppLogger('GoogleCalendarSyncScheduler');
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly syncBusyTimesUseCase: SyncCalendarBusyTimesUseCase,
    private readonly createEventUseCase: CreateCalendarEventForAppointmentUseCase,
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IAlertService')
    private readonly alertService: IAlertService,
  ) {}

  onModuleInit() {
    const intervalMinutes = this.configService.get<number>('GOOGLE_CALENDAR_SYNC_INTERVAL_MINUTES') || DEFAULT_SYNC_INTERVAL_MINUTES;
    const intervalMs = intervalMinutes * 60 * 1000;

    this.timer = setInterval(() => {
      this.runSync().catch((error) => {
        this.logger.error({ message: 'Background sync failed', reason: error?.message || 'unknown_error' });
        this.alertService.notify({
          key: 'google_calendar_sync_failed',
          message: 'Google Calendar sync failed',
          severity: 'critical',
          source: 'calendar',
          details: {
            reason: error?.message || 'unknown_error',
          },
        });
      });
    }, intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async runSync(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    try {
      const lookaheadDays = this.configService.get<number>('GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS') || DEFAULT_LOOKAHEAD_DAYS;
      const from = new Date();
      const to = this.addDays(from, lookaheadDays);

      const busySync = await this.syncBusyTimesUseCase.execute({ from, to });
      if (busySync.status !== 'success') {
        this.logger.warn({
          message: 'Skipping event export because busy sync failed',
          reason: busySync.errorMessage || 'unknown_error',
        });
        await this.alertService.notify({
          key: 'google_calendar_busy_sync_failed',
          message: 'Google Calendar busy time sync failed',
          severity: 'critical',
          source: 'calendar',
          details: {
            reason: busySync.errorMessage || 'unknown_error',
          },
        });
        return;
      }

      const appointments = await this.appointmentRepository.findConfirmedWithoutCalendarEvent(from, to);
      for (const appointment of appointments) {
        try {
          await this.createEventUseCase.execute(appointment.id);
        } catch (error: any) {
          this.logger.error({ message: 'Failed to create calendar event', appointmentId: appointment.id, reason: error?.message || 'unknown_error' });
          await this.alertService.notify({
            key: 'google_calendar_event_create_failed',
            message: 'Google Calendar event creation failed',
            severity: 'critical',
            source: 'calendar',
            details: {
              appointment_id: appointment.id,
              reason: error?.message || 'unknown_error',
            },
          });
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
}
