import { Module } from '@nestjs/common';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
import { GoogleCalendarService } from './google-calendar.service';
import { PrismaGoogleCalendarIntegrationRepository } from '../persistence/prisma/integrations/prisma-google-calendar-integration.repository';
import { AesGcmEncryptionService } from '../security/encryption.service';
import { DatabaseModule } from '../database/database.module';
import { BookingModule } from '../booking/booking.module';
import { GoogleCalendarTokenService } from '@application/integrations/services/GoogleCalendarTokenService';
import { SyncCalendarBusyTimesUseCase } from '@application/integrations/use-cases/SyncCalendarBusyTimesUseCase';
import { CreateCalendarEventForAppointmentUseCase } from '@application/integrations/use-cases/CreateCalendarEventForAppointmentUseCase';
import { HandleAppointmentConfirmedEvent } from '@application/integrations/use-cases/HandleAppointmentConfirmedEvent';
import { GoogleCalendarSyncScheduler } from './google-calendar-sync.scheduler';

@Module({
  imports: [DatabaseModule, BookingModule],
  providers: [
    {
      provide: 'IGoogleCalendarIntegrationRepository',
      useClass: PrismaGoogleCalendarIntegrationRepository,
    },
    {
      provide: 'IGoogleCalendarOAuthService',
      useClass: GoogleCalendarOAuthService,
    },
    {
      provide: 'IGoogleCalendarService',
      useClass: GoogleCalendarService,
    },
    GoogleCalendarTokenService,
    SyncCalendarBusyTimesUseCase,
    CreateCalendarEventForAppointmentUseCase,
    HandleAppointmentConfirmedEvent,
    GoogleCalendarSyncScheduler,
  ],
  exports: [
    'IGoogleCalendarIntegrationRepository',
    'IGoogleCalendarOAuthService',
    'IGoogleCalendarService',
    GoogleCalendarTokenService,
    SyncCalendarBusyTimesUseCase,
    CreateCalendarEventForAppointmentUseCase,
    HandleAppointmentConfirmedEvent,
  ],
})
export class IntegrationsModule {}
