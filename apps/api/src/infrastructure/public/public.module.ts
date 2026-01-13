import { Module } from '@nestjs/common';
import { PublicController } from '../../../presentation/controllers/public/public.controller';
import { GetHomepageModelUseCase } from '../../../application/public/use-cases/GetHomepageModelUseCase';
import { GetPageBySlugUseCase } from '../../../application/public/use-cases/GetPageBySlugUseCase';
import { GetContentBySlugUseCase } from '../../../application/public/use-cases/GetContentBySlugUseCase';
import { ListContentItemsUseCase } from '../../../application/public/use-cases/ListContentItemsUseCase';
import { PrismaInteractiveDefinitionRepository } from '../persistence/prisma/interactive/prisma-interactive-definition.repository';
import { DatabaseModule } from '../database/database.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [DatabaseModule, ContentModule],
  controllers: [PublicController],
  providers: [
    GetHomepageModelUseCase,
    GetPageBySlugUseCase,
    GetContentBySlugUseCase,
    ListContentItemsUseCase,
    {
      provide: 'IInteractiveDefinitionRepository',
      useClass: PrismaInteractiveDefinitionRepository,
    },
  ],
})
export class PublicModule {}
