import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IDiaryEntryRepository } from '@domain/cabinet/repositories/IDiaryEntryRepository';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { DeleteDiaryEntryResponseDto } from '../dto/cabinet.dto';

@Injectable()
export class DeleteDiaryEntryUseCase {
  constructor(
    @Inject('IDiaryEntryRepository')
    private readonly diaryEntryRepository: IDiaryEntryRepository,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(userId: string, diaryEntryId: string): Promise<DeleteDiaryEntryResponseDto> {
    const entry = await this.diaryEntryRepository.findById(diaryEntryId);
    if (!entry || entry.deletedAt) {
      throw new NotFoundException('Diary entry not found');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenException('You do not have access to this diary entry');
    }

    const deletedAt = new Date();
    await this.diaryEntryRepository.softDelete(entry.id, deletedAt);
    await this.trackingService.trackDiaryEntryDeleted({
      diaryType: entry.diaryType,
    });

    return {
      id: entry.id,
      diary_type: entry.diaryType,
      deleted_at: deletedAt.toISOString(),
    };
  }
}
