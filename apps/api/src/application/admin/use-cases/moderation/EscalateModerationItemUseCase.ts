import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUgcModerationRepository } from '@domain/moderation/repositories/IUgcModerationRepository';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { ModerationActionType, ModerationReasonCategory, UgcStatus } from '@domain/moderation/value-objects/ModerationEnums';

@Injectable()
export class EscalateModerationItemUseCase {
  constructor(
    @Inject('IUgcModerationRepository')
    private readonly moderationRepository: IUgcModerationRepository,
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(
    id: string,
    reasonCategory: ModerationReasonCategory | undefined,
    actorUserId: string,
    actorRole: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<void> {
    const item = await this.moderationRepository.getAnonymousQuestionById(id);
    if (!item) {
      throw new NotFoundException('Moderation item not found');
    }

    if (item.status === UgcStatus.rejected || item.status === UgcStatus.answered) {
      return;
    }

    if (item.status === UgcStatus.flagged) {
      return;
    }

    const previousStatus = item.status;
    await this.moderationRepository.updateQuestionStatus(id, UgcStatus.flagged);
    await this.moderationRepository.addModerationAction({
      ugcType: 'anonymous_question',
      ugcId: id,
      moderatorUserId: actorUserId,
      action: ModerationActionType.escalate,
      reasonCategory: reasonCategory ?? null,
    });

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      'admin_moderation_escalated',
      'ugc_question',
      id,
      { status: previousStatus },
      { status: UgcStatus.flagged, reasonCategory: reasonCategory ?? null },
      ipAddress ?? null,
      userAgent ?? null,
    );
  }
}
