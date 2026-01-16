import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaLeadRepository } from '../persistence/prisma/crm/prisma-lead.repository';
import { CreateOrUpdateLeadUseCase } from '@application/crm/use-cases/CreateOrUpdateLeadUseCase';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'ILeadRepository',
      useClass: PrismaLeadRepository,
    },
    CreateOrUpdateLeadUseCase,
  ],
  exports: ['ILeadRepository', CreateOrUpdateLeadUseCase],
})
export class CrmModule {}
