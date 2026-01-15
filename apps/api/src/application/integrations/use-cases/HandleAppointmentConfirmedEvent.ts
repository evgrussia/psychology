import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IEventBus } from '@domain/events/event-bus.interface';
import { CreateCalendarEventForAppointmentUseCase } from './CreateCalendarEventForAppointmentUseCase';
import { AppointmentConfirmedEvent } from '@domain/booking/events/AppointmentConfirmedEvent';
import { AppLogger } from '@infrastructure/logging/logger.service';

@Injectable()
export class HandleAppointmentConfirmedEvent implements OnModuleInit {
  private readonly logger = new AppLogger('HandleAppointmentConfirmedEvent');

  constructor(
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
    private readonly createCalendarEventUseCase: CreateCalendarEventForAppointmentUseCase,
  ) {}

  onModuleInit() {
    this.eventBus.subscribe(
      'AppointmentConfirmedEvent',
      async (event: AppointmentConfirmedEvent) => {
        await this.handle(event);
      },
    );
  }

  private async handle(event: AppointmentConfirmedEvent): Promise<void> {
    this.logger.log({
      message: 'Handling AppointmentConfirmedEvent',
      appointmentId: event.appointmentId,
    });

    try {
      await this.createCalendarEventUseCase.execute(event.appointmentId);
    } catch (error: any) {
      this.logger.error({
        message: 'Failed to create calendar event from event handler',
        appointmentId: event.appointmentId,
        reason: error?.message || 'unknown_error',
      });
    }
  }
}
