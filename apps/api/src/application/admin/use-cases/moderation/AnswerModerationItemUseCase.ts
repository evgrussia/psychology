import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUgcModerationRepository } from '@domain/moderation/repositories/IUgcModerationRepository';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { ModerationActionType, UgcStatus } from '@domain/moderation/value-objects/ModerationEnums';
import { TrackingService } from '@infrastructure/tracking/tracking.service';

@Injectable()
export class AnswerModerationItemUseCase {
  constructor(
    @Inject('IUgcModerationRepository')
    private readonly moderationRepository: IUgcModerationRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
    private readonly auditLogHelper: AuditLogHelper,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(
    id: string,
    answerText: string,
    actorUserId: string,
    actorRole: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<void> {
    const item = await this.moderationRepository.getAnonymousQuestionById(id);
    if (!item) {
      throw new NotFoundException('Moderation item not found');
    }

    if (item.status === UgcStatus.rejected) {
      throw new BadRequestException('Rejected item cannot be answered');
    }

    if (item.status === UgcStatus.answered) {
      return;
    }

    const encrypted = this.encryptionService.encrypt(answerText);
    const publishedAt = new Date();

    await this.moderationRepository.addAnswer({
      questionId: id,
      answeredByUserId: actorUserId,
      answerTextEncrypted: encrypted,
      publishedAt,
    });
    await this.moderationRepository.updateQuestionStatus(id, UgcStatus.answered, publishedAt);
    await this.moderationRepository.addModerationAction({
      ugcType: 'anonymous_question',
      ugcId: id,
      moderatorUserId: actorUserId,
      action: ModerationActionType.publish,
    });

    const timeToAnswerHours = (publishedAt.getTime() - item.submittedAt.getTime()) / (60 * 60 * 1000);
    await this.trackingService.trackUgcAnswered({
      ugcId: id,
      answerLengthBucket: this.getAnswerLengthBucket(answerText),
      timeToAnswerHours,
    });

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      'admin_moderation_answered',
      'ugc_question',
      id,
      { status: item.status },
      { status: UgcStatus.answered },
      ipAddress ?? null,
      userAgent ?? null,
    );
  }

  private getAnswerLengthBucket(text: string): 'short' | 'medium' | 'long' {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (words <= 60) return 'short';
    if (words <= 150) return 'medium';
    return 'long';
  }
}
