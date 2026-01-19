import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { LocalFsStorageService } from './storage/local-fs-storage.service';
import { PrismaMediaAssetRepository } from './persistence/prisma/media/prisma-media-asset.repository';
import { IMediaAssetRepository } from '../../domain/media/repositories/IMediaAssetRepository';
import { UploadMediaAssetUseCase } from '../../application/media/use-cases/UploadMediaAssetUseCase';
import { DeleteMediaAssetUseCase } from '../../application/media/use-cases/DeleteMediaAssetUseCase';
import { ListMediaAssetsUseCase } from '../../application/media/use-cases/ListMediaAssetsUseCase';
import { UpdateMediaAssetUseCase } from '../../application/media/use-cases/UpdateMediaAssetUseCase';
import { AdminMediaController } from '../../presentation/controllers/admin-media.controller';
import { IStorageService } from '../../application/media/interfaces/IStorageService';
import { TrackingService } from '../tracking/tracking.service';
import { MediaTrackingHandler } from '../tracking/media-tracking.handler';
import { EventsModule } from '../events/events.module';
import { AuditModule } from '../audit/audit.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [ConfigModule, EventsModule, AuditModule, AnalyticsModule],
  controllers: [AdminMediaController],
  providers: [
    {
      provide: 'IMediaAssetRepository',
      useClass: PrismaMediaAssetRepository,
    },
    {
      provide: 'IStorageService',
      useClass: LocalFsStorageService,
    },
    // We need to use the interface tokens for dependency injection in use cases
    // But NestJS doesn't support interface injection directly without @Inject('TOKEN')
    // So let's refine the use cases or use tokens.
    // I'll update use cases to use @Inject('TOKEN')
    UploadMediaAssetUseCase,
    DeleteMediaAssetUseCase,
    ListMediaAssetsUseCase,
    UpdateMediaAssetUseCase,
    TrackingService,
    MediaTrackingHandler,
  ],
  exports: [
    UploadMediaAssetUseCase,
    DeleteMediaAssetUseCase,
    ListMediaAssetsUseCase,
    UpdateMediaAssetUseCase,
    'IMediaAssetRepository',
  ],
})
export class MediaModule {}
