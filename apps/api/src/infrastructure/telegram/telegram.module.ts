import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../database/database.module';
import { PrismaDeepLinkRepository } from '../persistence/prisma/telegram/prisma-deep-link.repository';
import { CreateDeepLinkUseCase } from '@application/telegram/use-cases/CreateDeepLinkUseCase';
import { ResolveDeepLinkUseCase } from '@application/telegram/use-cases/ResolveDeepLinkUseCase';
import { TelegramDeepLinksController } from '@presentation/controllers/telegram-deep-links.controller';
import { DeepLinkCleanupScheduler } from './deep-link-cleanup.scheduler';
import { TelegramServiceGuard } from '@presentation/guards/telegram-service.guard';
import { CommonModule } from '../common/common.module';
import { PrismaTelegramUserRepository } from '../persistence/prisma/telegram/prisma-telegram-user.repository';
import { PrismaTelegramSessionRepository } from '../persistence/prisma/telegram/prisma-telegram-session.repository';
import { TelegramBotClient } from './telegram-bot.client';
import { TelegramUpdatesService } from './telegram-updates.service';
import { HandleTelegramUpdateUseCase } from '@application/telegram/use-cases/HandleTelegramUpdateUseCase';
import { StartOnboardingUseCase } from '@application/telegram/use-cases/StartOnboardingUseCase';
import { SendPlanMessageUseCase } from '@application/telegram/use-cases/SendPlanMessageUseCase';
import { ProcessTelegramScheduledMessagesUseCase } from '@application/telegram/use-cases/ProcessTelegramScheduledMessagesUseCase';
import { TrackingService } from '../tracking/tracking.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TelegramSchedulerService } from './telegram-scheduler.service';

@Module({
  imports: [DatabaseModule, CommonModule, HttpModule, AnalyticsModule],
  controllers: [TelegramDeepLinksController],
  providers: [
    {
      provide: 'IDeepLinkRepository',
      useClass: PrismaDeepLinkRepository,
    },
    {
      provide: 'ITelegramUserRepository',
      useClass: PrismaTelegramUserRepository,
    },
    {
      provide: 'ITelegramSessionRepository',
      useClass: PrismaTelegramSessionRepository,
    },
    {
      provide: 'ITelegramBotClient',
      useClass: TelegramBotClient,
    },
    CreateDeepLinkUseCase,
    ResolveDeepLinkUseCase,
    HandleTelegramUpdateUseCase,
    StartOnboardingUseCase,
    SendPlanMessageUseCase,
    ProcessTelegramScheduledMessagesUseCase,
    TelegramUpdatesService,
    TelegramSchedulerService,
    DeepLinkCleanupScheduler,
    TelegramServiceGuard,
    TrackingService,
  ],
  exports: [
    'IDeepLinkRepository',
    'ITelegramUserRepository',
    'ITelegramSessionRepository',
    'ITelegramBotClient',
    CreateDeepLinkUseCase,
    ResolveDeepLinkUseCase,
    HandleTelegramUpdateUseCase,
  ],
})
export class TelegramModule {}
