import { Module } from '@nestjs/common';
import { PublicController } from '@presentation/controllers/public/public.controller';
import { GetHomepageModelUseCase } from '@application/public/use-cases/GetHomepageModelUseCase';
import { GetPageBySlugUseCase } from '@application/public/use-cases/GetPageBySlugUseCase';
import { GetContentBySlugUseCase } from '@application/public/use-cases/GetContentBySlugUseCase';
import { ListContentItemsUseCase } from '@application/public/use-cases/ListContentItemsUseCase';
import { GetTopicsUseCase } from '@application/public/use-cases/GetTopicsUseCase';
import { GetTopicLandingUseCase } from '@application/public/use-cases/GetTopicLandingUseCase';
import { ListPublicGlossaryTermsUseCase } from '@application/public/use-cases/ListPublicGlossaryTermsUseCase';
import { GetPublicGlossaryTermUseCase } from '@application/public/use-cases/GetPublicGlossaryTermUseCase';
import { ListCuratedCollectionsUseCase } from '@application/public/use-cases/ListCuratedCollectionsUseCase';
import { GetCuratedCollectionUseCase } from '@application/public/use-cases/GetCuratedCollectionUseCase';
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
    GetTopicsUseCase,
    GetTopicLandingUseCase,
    ListPublicGlossaryTermsUseCase,
    GetPublicGlossaryTermUseCase,
    ListCuratedCollectionsUseCase,
    GetCuratedCollectionUseCase,
    {
      provide: 'IInteractiveDefinitionRepository',
      useClass: PrismaInteractiveDefinitionRepository,
    },
  ],
})
export class PublicModule {}
