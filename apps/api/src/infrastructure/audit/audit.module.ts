import { Module } from '@nestjs/common';
import { PrismaAuditLogRepository } from '../persistence/prisma/audit/prisma-audit-log.repository';
import { WriteAuditLogUseCase } from '../../application/audit/use-cases/WriteAuditLogUseCase';
import { ListAuditLogUseCase } from '../../application/audit/use-cases/ListAuditLogUseCase';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';
import { AuditLogHandler } from './audit-log.handler';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  providers: [
    {
      provide: 'IAuditLogRepository',
      useClass: PrismaAuditLogRepository,
    },
    PrismaAuditLogRepository,
    WriteAuditLogUseCase,
    ListAuditLogUseCase,
    AuditLogHelper,
    AuditLogHandler,
    // Provide alias for interface
    { provide: 'IAuditLogRepository', useExisting: PrismaAuditLogRepository },
    { provide: 'AuditLogHelper', useExisting: AuditLogHelper },
  ],
  exports: [
    WriteAuditLogUseCase,
    ListAuditLogUseCase,
    AuditLogHelper,
    'AuditLogHelper',
    'IAuditLogRepository',
  ],
})
export class AuditModule {}
