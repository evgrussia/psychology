import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaAvailabilitySlotRepository } from '../persistence/prisma/booking/prisma-availability-slot.repository';
import { PrismaAppointmentRepository } from '../persistence/prisma/booking/prisma-appointment.repository';
import { PrismaServiceRepository } from '../persistence/prisma/booking/prisma-service.repository';
import { PrismaIntakeFormRepository } from '../persistence/prisma/booking/prisma-intake-form.repository';
import { PrismaWaitlistRequestRepository } from '../persistence/prisma/booking/prisma-waitlist-request.repository';
import { PrismaScheduleSettingsRepository } from '../persistence/prisma/booking/prisma-schedule-settings.repository';
import { PrismaPaymentWebhookEventRepository } from '../persistence/prisma/payment/prisma-payment-webhook-event.repository';
import { PrismaPaymentRepository } from '../persistence/prisma/payment/prisma-payment.repository';
import { ReserveSlotForAppointmentUseCase } from '@application/booking/use-cases/ReserveSlotForAppointmentUseCase';
import { StartBookingUseCase } from '@application/booking/use-cases/StartBookingUseCase';
import { SubmitIntakeUseCase } from '@application/booking/use-cases/SubmitIntakeUseCase';
import { UpdateBookingConsentsUseCase } from '@application/booking/use-cases/UpdateBookingConsentsUseCase';
import { GetBookingStatusUseCase } from '@application/booking/use-cases/GetBookingStatusUseCase';
import { CreatePaymentUseCase } from '@application/booking/use-cases/CreatePaymentUseCase';
import { ConfirmAppointmentAfterPaymentUseCase } from '@application/booking/use-cases/ConfirmAppointmentAfterPaymentUseCase';
import { HandlePaymentWebhookUseCase } from '@application/payment/use-cases/HandlePaymentWebhookUseCase';
import { CreateWaitlistRequestUseCase } from '@application/booking/use-cases/CreateWaitlistRequestUseCase';
import { GetNoSlotsModelUseCase } from '@application/booking/use-cases/GetNoSlotsModelUseCase';
import { AesGcmEncryptionService } from '../security/encryption.service';
import { TrackingService } from '../tracking/tracking.service';
import { CrmModule } from '../crm/crm.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [DatabaseModule, CrmModule, AnalyticsModule],
  providers: [
    {
      provide: 'IAvailabilitySlotRepository',
      useClass: PrismaAvailabilitySlotRepository,
    },
    {
      provide: 'IScheduleSettingsRepository',
      useClass: PrismaScheduleSettingsRepository,
    },
    {
      provide: 'IAppointmentRepository',
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: 'IServiceRepository',
      useClass: PrismaServiceRepository,
    },
    {
      provide: 'IIntakeFormRepository',
      useClass: PrismaIntakeFormRepository,
    },
    {
      provide: 'IWaitlistRequestRepository',
      useClass: PrismaWaitlistRequestRepository,
    },
    {
      provide: 'IPaymentWebhookEventRepository',
      useClass: PrismaPaymentWebhookEventRepository,
    },
    {
      provide: 'IPaymentRepository',
      useClass: PrismaPaymentRepository,
    },
    {
      provide: 'IEncryptionService',
      useClass: AesGcmEncryptionService,
    },
    ReserveSlotForAppointmentUseCase,
    StartBookingUseCase,
    SubmitIntakeUseCase,
    UpdateBookingConsentsUseCase,
    GetBookingStatusUseCase,
    CreatePaymentUseCase,
    ConfirmAppointmentAfterPaymentUseCase,
    HandlePaymentWebhookUseCase,
    CreateWaitlistRequestUseCase,
    GetNoSlotsModelUseCase,
    TrackingService,
  ],
  exports: [
    'IAvailabilitySlotRepository',
    'IScheduleSettingsRepository',
    'IAppointmentRepository',
    'IServiceRepository',
    'IIntakeFormRepository',
    'IWaitlistRequestRepository',
    'IPaymentRepository',
    'IEncryptionService',
    ReserveSlotForAppointmentUseCase,
    StartBookingUseCase,
    SubmitIntakeUseCase,
    UpdateBookingConsentsUseCase,
    GetBookingStatusUseCase,
    CreatePaymentUseCase,
    ConfirmAppointmentAfterPaymentUseCase,
    HandlePaymentWebhookUseCase,
    CreateWaitlistRequestUseCase,
    GetNoSlotsModelUseCase,
  ],
})
export class BookingModule {}
