import { Module } from '@nestjs/common';
import { StartInteractiveRunUseCase } from '../../application/interactive/use-cases/StartInteractiveRunUseCase';
import { CompleteInteractiveRunUseCase } from '../../application/interactive/use-cases/CompleteInteractiveRunUseCase';
import { GetBoundaryScriptsUseCase } from '../../application/interactive/use-cases/GetBoundaryScriptsUseCase';
import { RecordScriptInteractionUseCase } from '../../application/interactive/use-cases/RecordScriptInteractionUseCase';
import { GetInteractiveDefinitionUseCase } from '../../application/interactive/use-cases/GetInteractiveDefinitionUseCase';
import { ListRitualsUseCase } from '../../application/interactive/use-cases/ListRitualsUseCase';
import { GetRitualUseCase } from '../../application/interactive/use-cases/GetRitualUseCase';
import { GetNavigatorDefinitionUseCase } from '../../application/interactive/use-cases/GetNavigatorDefinitionUseCase';
import { ValidateNavigatorDefinitionUseCase } from '../../application/interactive/use-cases/ValidateNavigatorDefinitionUseCase';
import { PrismaInteractiveRunRepository } from '../persistence/prisma/interactive/prisma-interactive-run.repository';
import { PrismaInteractiveDefinitionRepository } from '../persistence/prisma/interactive/prisma-interactive-definition.repository';
import { InteractiveController } from '../../presentation/controllers/interactive.controller';
import { DatabaseModule } from '../database/database.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [DatabaseModule, MediaModule],
  controllers: [InteractiveController],
  providers: [
    StartInteractiveRunUseCase,
    CompleteInteractiveRunUseCase,
    GetBoundaryScriptsUseCase,
    RecordScriptInteractionUseCase,
    GetInteractiveDefinitionUseCase,
    ListRitualsUseCase,
    GetRitualUseCase,
    GetNavigatorDefinitionUseCase,
    ValidateNavigatorDefinitionUseCase,
    {
      provide: 'IInteractiveRunRepository',
      useClass: PrismaInteractiveRunRepository,
    },
    {
      provide: 'IInteractiveDefinitionRepository',
      useClass: PrismaInteractiveDefinitionRepository,
    },
  ],
  exports: [
    StartInteractiveRunUseCase, 
    CompleteInteractiveRunUseCase, 
    GetBoundaryScriptsUseCase, 
    RecordScriptInteractionUseCase, 
    GetInteractiveDefinitionUseCase, 
    ListRitualsUseCase, 
    GetRitualUseCase, 
    GetNavigatorDefinitionUseCase, 
    ValidateNavigatorDefinitionUseCase,
    'IInteractiveRunRepository',
    'IInteractiveDefinitionRepository'
  ],
})
export class InteractiveModule {}
