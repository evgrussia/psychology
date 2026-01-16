import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ISessionRepository } from '@domain/identity/repositories/ISessionRepository';
import { IAccountCleanupService } from '@domain/cabinet/services/IAccountCleanupService';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { WriteAuditLogUseCase } from '@application/audit/use-cases/WriteAuditLogUseCase';
import { ITelegramSessionRepository } from '@domain/telegram/repositories/ITelegramSessionRepository';
import { ConsentType } from '@domain/identity/value-objects/ConsentType';

import { DeleteAccountResponseDto } from '../dto/cabinet.dto';

export interface DeleteAccountAuditContext {
  actorUserId: string;
  actorRole: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('IAccountCleanupService')
    private readonly accountCleanupService: IAccountCleanupService,
    @Inject('ITelegramSessionRepository')
    private readonly telegramSessionRepository: ITelegramSessionRepository,
    private readonly trackingService: TrackingService,
    private readonly writeAuditLogUseCase: WriteAuditLogUseCase,
  ) {}

  async execute(userId: string, audit: DeleteAccountAuditContext): Promise<DeleteAccountResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const telegramUserId = user.telegramUserId;

    await this.accountCleanupService.cleanupUserData(userId);

    user.revokeConsent(ConsentType.COMMUNICATIONS);
    user.revokeConsent(ConsentType.TELEGRAM);
    user.revokeConsent(ConsentType.PERSONAL_DATA);
    user.deleteAccount();
    await this.userRepository.save(user);

    await this.sessionRepository.revokeAllForUser(userId);

    if (telegramUserId) {
      await this.telegramSessionRepository.deactivateSessions(telegramUserId);
    }

    await this.trackingService.trackAccountDeleted({
      method: 'self_service',
    });

    await this.writeAuditLogUseCase.execute({
      actorUserId: audit.actorUserId,
      actorRole: audit.actorRole,
      action: 'account_deleted',
      entityType: 'user',
      entityId: userId,
      oldValue: null,
      newValue: {
        method: 'self_service',
      },
      ipAddress: audit.ipAddress ?? null,
      userAgent: audit.userAgent ?? null,
    });

    return { status: 'deleted' };
  }
}
