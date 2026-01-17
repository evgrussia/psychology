import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUgcModerationRepository } from '@domain/moderation/repositories/IUgcModerationRepository';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { ModerationActionType, UgcStatus } from '@domain/moderation/value-objects/ModerationEnums';

@Injectable()
export class ApproveModerationItemUseCase {
  constructor(
    @Inject('IUgcModerationRepository')
    private readonly moderationRepository: IUgcModerationRepository,
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(
    id: string,
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
      throw new BadRequestException('Rejected item cannot be approved');
    }

    if (item.status === UgcStatus.answered) {
      throw new BadRequestException('Answered item cannot be approved');
    }

    if (item.status === UgcStatus.approved) {
      return;
    }

    const previousStatus = item.status;
    await this.moderationRepository.updateQuestionStatus(id, UgcStatus.approved);
    await this.moderationRepository.addModerationAction({
      ugcType: 'anonymous_question',
      ugcId: id,
      moderatorUserId: actorUserId,
      action: ModerationActionType.approve,
    });

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      'admin_moderation_approved',
      'ugc_question',
      id,
      { status: previousStatus },
      { status: UgcStatus.approved },
      ipAddress ?? null,
      userAgent ?? null,
    );
  }
}
