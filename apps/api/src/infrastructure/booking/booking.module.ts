import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaAvailabilitySlotRepository } from '../persistence/prisma/booking/prisma-availability-slot.repository';
import { PrismaAppointmentRepository } from '../persistence/prisma/booking/prisma-appointment.repository';
import { PrismaServiceRepository } from '../persistence/prisma/booking/prisma-service.repository';
import { PrismaIntakeFormRepository } from '../persistence/prisma/booking/prisma-intake-form.repository';
import { PrismaPaymentWebhookEventRepository } from '../persistence/prisma/payment/prisma-payment-webhook-event.repository';
import { ReserveSlotForAppointmentUseCase } from '@application/booking/use-cases/ReserveSlotForAppointmentUseCase';
import { StartBookingUseCase } from '@application/booking/use-cases/StartBookingUseCase';
import { SubmitIntakeUseCase } from '@application/booking/use-cases/SubmitIntakeUseCase';
import { UpdateBookingConsentsUseCase } from '@application/booking/use-cases/UpdateBookingConsentsUseCase';
import { GetBookingStatusUseCase } from '@application/booking/use-cases/GetBookingStatusUseCase';
import { CreatePaymentUseCase } from '@application/booking/use-cases/CreatePaymentUseCase';
import { ConfirmAppointmentUseCase } from '@application/booking/use-cases/ConfirmAppointmentUseCase';
import { HandlePaymentWebhookUseCase } from '@application/payment/use-cases/HandlePaymentWebhookUseCase';
import { AesGcmEncryptionService } from '../security/encryption.service';
import { TrackingService } from '../tracking/tracking.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'IAvailabilitySlotRepository',
      useClass: PrismaAvailabilitySlotRepository,
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
      provide: 'IPaymentWebhookEventRepository',
      useClass: PrismaPaymentWebhookEventRepository,
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
    ConfirmAppointmentUseCase,
    HandlePaymentWebhookUseCase,
    TrackingService,
  ],
  exports: [
    'IAvailabilitySlotRepository',
    'IAppointmentRepository',
    'IServiceRepository',
    'IIntakeFormRepository',
    'IEncryptionService',
    ReserveSlotForAppointmentUseCase,
    StartBookingUseCase,
    SubmitIntakeUseCase,
    UpdateBookingConsentsUseCase,
    GetBookingStatusUseCase,
    CreatePaymentUseCase,
    ConfirmAppointmentUseCase,
    HandlePaymentWebhookUseCase,
  ],
})
export class BookingModule {}
