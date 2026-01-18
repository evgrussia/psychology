import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaExperimentAssignmentRepository } from '../persistence/prisma/experiments/prisma-experiment-assignment.repository';
import { GetExperimentAssignmentUseCase } from '@application/experiments/use-cases/GetExperimentAssignmentUseCase';
import { ListExperimentsUseCase } from '@application/experiments/use-cases/ListExperimentsUseCase';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'IExperimentAssignmentRepository',
      useClass: PrismaExperimentAssignmentRepository,
    },
    GetExperimentAssignmentUseCase,
    ListExperimentsUseCase,
  ],
  exports: [GetExperimentAssignmentUseCase, ListExperimentsUseCase],
})
export class ExperimentsModule {}
