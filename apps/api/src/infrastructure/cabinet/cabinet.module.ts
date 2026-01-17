import { Module } from '@nestjs/common';
import { CabinetController } from '@presentation/controllers/cabinet.controller';
import { ListClientAppointmentsUseCase } from '@application/cabinet/use-cases/ListClientAppointmentsUseCase';
import { ListClientMaterialsUseCase } from '@application/cabinet/use-cases/ListClientMaterialsUseCase';
import { PrismaAppointmentMaterialRepository } from '@infrastructure/persistence/prisma/booking/prisma-appointment-material.repository';
import { BookingModule } from '@infrastructure/booking/booking.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { PrismaDiaryEntryRepository } from '@infrastructure/persistence/prisma/cabinet/prisma-diary-entry.repository';
import { CreateDiaryEntryUseCase } from '@application/cabinet/use-cases/CreateDiaryEntryUseCase';
import { ListDiaryEntriesUseCase } from '@application/cabinet/use-cases/ListDiaryEntriesUseCase';
import { DeleteDiaryEntryUseCase } from '@application/cabinet/use-cases/DeleteDiaryEntryUseCase';
import { ExportDiaryPdfUseCase } from '@application/cabinet/use-cases/ExportDiaryPdfUseCase';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { PdfMakeDiaryExportRenderer } from '@infrastructure/cabinet/diary-pdf.renderer';
import { ExportAccountDataUseCase } from '@application/cabinet/use-cases/ExportAccountDataUseCase';
import { UpdateCabinetConsentsUseCase } from '@application/cabinet/use-cases/UpdateCabinetConsentsUseCase';
import { GetCabinetConsentsUseCase } from '@application/cabinet/use-cases/GetCabinetConsentsUseCase';
import { DeleteAccountUseCase } from '@application/cabinet/use-cases/DeleteAccountUseCase';
import { PrismaAccountDataExporter } from '@infrastructure/cabinet/account-data-exporter.service';
import { PrismaAccountCleanupService } from '@infrastructure/cabinet/account-cleanup.service';
import { PrismaTelegramSessionRepository } from '@infrastructure/persistence/prisma/telegram/prisma-telegram-session.repository';
import { AuditModule } from '@infrastructure/audit/audit.module';
import { AnalyticsModule } from '@infrastructure/analytics/analytics.module';

@Module({
  imports: [DatabaseModule, BookingModule, AuditModule, AnalyticsModule],
  controllers: [CabinetController],
  providers: [
    {
      provide: 'IAppointmentMaterialRepository',
      useClass: PrismaAppointmentMaterialRepository,
    },
    {
      provide: 'IDiaryEntryRepository',
      useClass: PrismaDiaryEntryRepository,
    },
    {
      provide: 'IDiaryExportRenderer',
      useClass: PdfMakeDiaryExportRenderer,
    },
    {
      provide: 'IAccountDataExporter',
      useClass: PrismaAccountDataExporter,
    },
    {
      provide: 'IAccountCleanupService',
      useClass: PrismaAccountCleanupService,
    },
    {
      provide: 'ITelegramSessionRepository',
      useClass: PrismaTelegramSessionRepository,
    },
    ListClientAppointmentsUseCase,
    ListClientMaterialsUseCase,
    CreateDiaryEntryUseCase,
    ListDiaryEntriesUseCase,
    DeleteDiaryEntryUseCase,
    ExportDiaryPdfUseCase,
    ExportAccountDataUseCase,
    UpdateCabinetConsentsUseCase,
    GetCabinetConsentsUseCase,
    DeleteAccountUseCase,
    TrackingService,
  ],
})
export class CabinetModule {}
