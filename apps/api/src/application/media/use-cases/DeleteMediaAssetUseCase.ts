import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { IMediaAssetRepository } from '@domain/media/repositories/IMediaAssetRepository';
import { IStorageService } from '../interfaces/IStorageService';
import { IEventBus } from '@domain/events/event-bus.interface';
import { MediaAssetDeletedEvent } from '@domain/media/events/MediaAssetDeletedEvent';

import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../audit/dto/audit-log.dto';

@Injectable()
export class DeleteMediaAssetUseCase {
  constructor(
    @Inject('IMediaAssetRepository')
    private readonly mediaRepository: IMediaAssetRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(mediaAssetId: string, userId: string, userRole: string = 'admin'): Promise<void> {
    const mediaAsset = await this.mediaRepository.findById(mediaAssetId);
    if (!mediaAsset) {
      throw new NotFoundException(`Media asset with ID ${mediaAssetId} not found`);
    }

    const isUsed = await this.mediaRepository.isUsedInContent(mediaAssetId);
    if (isUsed) {
      throw new BadRequestException('Cannot delete media asset because it is used in content');
    }

    // 1. Delete from storage
    await this.storageService.delete(mediaAsset.objectKey);

    // 2. Delete from DB
    await this.mediaRepository.delete(mediaAssetId);

    // 3. Log to audit log
    try {
      await this.auditLogHelper.logAction(
        userId,
        userRole,
        AuditLogAction.ADMIN_CONTENT_DELETED,
        'MediaAsset',
        mediaAssetId,
        {
          id: mediaAsset.id,
          objectKey: mediaAsset.objectKey,
        },
        null,
      );
    } catch (error) {
      // Best effort logging
      console.error('Failed to log media asset deletion to audit log:', error);
    }

    // 4. Publish event
    await this.eventBus.publish(new MediaAssetDeletedEvent(mediaAssetId, { userId }));
  }
}
