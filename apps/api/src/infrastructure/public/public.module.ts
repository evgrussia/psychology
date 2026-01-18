import { Module } from '@nestjs/common';
import { PublicController } from '@presentation/controllers/public/public.controller';
import { PublicAiController } from '@presentation/controllers/public/ai.controller';
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
import { ListServicesUseCase } from '@application/public/use-cases/ListServicesUseCase';
import { GetServiceBySlugUseCase } from '@application/public/use-cases/GetServiceBySlugUseCase';
import { ListAvailableSlotsUseCase } from '@application/booking/use-cases/ListAvailableSlotsUseCase';
import { GetBookingAlternativesUseCase } from '@application/booking/use-cases/GetBookingAlternativesUseCase';
import { SubmitAnonymousQuestionUseCase } from '@application/public/use-cases/SubmitAnonymousQuestionUseCase';
import { GetAnonymousQuestionStatusUseCase } from '@application/public/use-cases/GetAnonymousQuestionStatusUseCase';
import { PublicUgcController } from '@presentation/controllers/public/ugc.controller';
import { PrismaInteractiveDefinitionRepository } from '../persistence/prisma/interactive/prisma-interactive-definition.repository';
import { DatabaseModule } from '../database/database.module';
import { ContentModule } from '../content/content.module';
import { BookingModule } from '../booking/booking.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ModerationModule } from '../moderation/moderation.module';
import { ExperimentsModule } from '../experiments/experiments.module';
import { ExperimentsController } from '@presentation/controllers/experiments.controller';
import { GetAiNextStepUseCase } from '@application/ai/use-cases/GetAiNextStepUseCase';
import { GetAiConciergeUseCase } from '@application/ai/use-cases/GetAiConciergeUseCase';

@Module({
  imports: [DatabaseModule, ContentModule, BookingModule, IntegrationsModule, TelegramModule, ModerationModule, ExperimentsModule],
  controllers: [PublicController, PublicUgcController, ExperimentsController, PublicAiController],
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
    ListServicesUseCase,
    GetServiceBySlugUseCase,
    ListAvailableSlotsUseCase,
    GetBookingAlternativesUseCase,
    SubmitAnonymousQuestionUseCase,
    GetAnonymousQuestionStatusUseCase,
    GetAiNextStepUseCase,
    GetAiConciergeUseCase,
    {
      provide: 'IInteractiveDefinitionRepository',
      useClass: PrismaInteractiveDefinitionRepository,
    },
  ],
})
export class PublicModule {}
