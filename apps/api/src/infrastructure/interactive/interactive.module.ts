import { Module } from '@nestjs/common';
import { StartInteractiveRunUseCase } from '../../application/interactive/use-cases/StartInteractiveRunUseCase';
import { CompleteInteractiveRunUseCase } from '../../application/interactive/use-cases/CompleteInteractiveRunUseCase';
import { PrismaInteractiveRunRepository } from '../persistence/prisma/interactive/prisma-interactive-run.repository';
import { PrismaInteractiveDefinitionRepository } from '../persistence/prisma/interactive/prisma-interactive-definition.repository';
import { InteractiveController } from '../../presentation/controllers/interactive.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InteractiveController],
  providers: [
    StartInteractiveRunUseCase,
    CompleteInteractiveRunUseCase,
    {
      provide: 'IInteractiveRunRepository',
      useClass: PrismaInteractiveRunRepository,
    },
    {
      provide: 'IInteractiveDefinitionRepository',
      useClass: PrismaInteractiveDefinitionRepository,
    },
  ],
  exports: [StartInteractiveRunUseCase, CompleteInteractiveRunUseCase],
})
export class InteractiveModule {}
