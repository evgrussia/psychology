import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CrmModule } from '../crm/crm.module';
import { PrismaAnalyticsEventRepository } from '../persistence/prisma/analytics/prisma-analytics-event.repository';
import { IngestAnalyticsEventUseCase } from '@application/analytics/use-cases/IngestAnalyticsEventUseCase';
import { AnalyticsController } from '@presentation/controllers/analytics.controller';

@Module({
  imports: [DatabaseModule, CrmModule],
  controllers: [AnalyticsController],
  providers: [
    {
      provide: 'IAnalyticsEventRepository',
      useClass: PrismaAnalyticsEventRepository,
    },
    IngestAnalyticsEventUseCase,
  ],
  exports: [IngestAnalyticsEventUseCase],
})
export class AnalyticsModule {}
