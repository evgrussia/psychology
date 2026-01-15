import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { IGoogleCalendarService } from '@domain/integrations/services/IGoogleCalendarService';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';
import { GoogleCalendarTokenService } from '../services/GoogleCalendarTokenService';
import { GoogleCalendarEventCreationResultDto } from '../dto/google-calendar.dto';
import { AppLogger } from '@infrastructure/logging/logger.service';

@Injectable()
export class CreateCalendarEventForAppointmentUseCase {
  private readonly logger = new AppLogger('CreateCalendarEventForAppointmentUseCase');

  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IGoogleCalendarIntegrationRepository')
    private readonly integrationRepository: IGoogleCalendarIntegrationRepository,
    @Inject('IGoogleCalendarService')
    private readonly googleCalendarService: IGoogleCalendarService,
    private readonly tokenService: GoogleCalendarTokenService,
  ) {}

  async execute(appointmentId: string): Promise<GoogleCalendarEventCreationResultDto> {
    const integration = await this.integrationRepository.findLatest();
    if (!integration || integration.status !== GoogleCalendarIntegrationStatus.connected) {
      return {
        status: 'failed',
        appointmentId,
        reason: 'Google Calendar integration is not connected',
      };
    }

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      return {
        status: 'failed',
        appointmentId,
        reason: 'Appointment not found',
      };
    }

    if (appointment.status !== AppointmentStatus.confirmed) {
      return {
        status: 'skipped',
        appointmentId,
        reason: 'Appointment is not confirmed',
      };
    }

    if (appointment.externalCalendarEventId) {
      return {
        status: 'skipped',
        appointmentId,
        eventId: appointment.externalCalendarEventId,
        reason: 'Event already linked',
      };
    }

    const lockToken = `pending:${randomUUID()}`;
    const locked = await this.appointmentRepository.setExternalCalendarEventIdIfMatch(
      appointmentId,
      null,
      lockToken,
    );

    if (!locked) {
      return {
        status: 'skipped',
        appointmentId,
        reason: 'Event creation already in progress',
      };
    }

    try {
      const accessToken = await this.tokenService.getValidAccessToken(integration);
      const calendarId = integration.calendarId || 'primary';
      const service = await this.serviceRepository.findById(appointment.serviceId);
      const summary = service ? service.title : 'Консультация';

      const event = await this.googleCalendarService.createEvent(accessToken, calendarId, {
        summary,
        description: service ? service.descriptionMarkdown : undefined,
        startAt: appointment.startAtUtc,
        endAt: appointment.endAtUtc,
        timeZone: appointment.timezone,
      });

      const updated = await this.appointmentRepository.setExternalCalendarEventIdIfMatch(
        appointmentId,
        lockToken,
        event.id,
      );

      if (!updated) {
        this.logger.warn({
          message: 'Appointment calendar event updated by another process',
          appointmentId,
        });
      }

      return {
        status: 'created',
        appointmentId,
        eventId: event.id,
      };
    } catch (error: any) {
      await this.appointmentRepository.clearExternalCalendarEventId(appointmentId, lockToken);
      this.logger.error(
        {
          message: 'Failed to create Google Calendar event for appointment',
          appointmentId,
          reason: error?.message || 'unknown_error',
        },
        error?.stack,
      );

      return {
        status: 'failed',
        appointmentId,
        reason: error?.message || 'unknown_error',
      };
    }
  }
}
