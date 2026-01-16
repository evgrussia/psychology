import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ConsentType } from '@domain/identity/value-objects/ConsentType';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { ITelegramSessionRepository } from '@domain/telegram/repositories/ITelegramSessionRepository';
import { UpdateCabinetConsentsRequestDto, UpdateCabinetConsentsResponseDto } from '../dto/cabinet.dto';
import { WriteAuditLogUseCase } from '@application/audit/use-cases/WriteAuditLogUseCase';

const DEFAULT_CONSENT_VERSION = 'v1';
const DEFAULT_CONSENT_SOURCE = 'cabinet';

export interface UpdateConsentsAuditContext {
  actorUserId: string;
  actorRole: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class UpdateCabinetConsentsUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITelegramSessionRepository')
    private readonly telegramSessionRepository: ITelegramSessionRepository,
    private readonly trackingService: TrackingService,
    private readonly writeAuditLogUseCase: WriteAuditLogUseCase,
  ) {}

  async execute(
    userId: string,
    dto: UpdateCabinetConsentsRequestDto,
    audit?: UpdateConsentsAuditContext,
  ): Promise<UpdateCabinetConsentsResponseDto> {
    if (dto.communications === undefined && dto.telegram === undefined) {
      throw new BadRequestException('No consent updates provided');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previous = {
      communications: user.hasActiveConsent(ConsentType.COMMUNICATIONS),
      telegram: user.hasActiveConsent(ConsentType.TELEGRAM),
      personal_data: user.hasActiveConsent(ConsentType.PERSONAL_DATA),
    };

    const source = dto.source ?? DEFAULT_CONSENT_SOURCE;
    const version = DEFAULT_CONSENT_VERSION;

    if (dto.communications !== undefined) {
      if (dto.communications) {
        user.grantConsent(ConsentType.COMMUNICATIONS, version, source);
      } else {
        user.revokeConsent(ConsentType.COMMUNICATIONS);
      }
    }

    if (dto.telegram !== undefined) {
      if (dto.telegram) {
        user.grantConsent(ConsentType.TELEGRAM, version, source);
      } else {
        user.revokeConsent(ConsentType.TELEGRAM);
      }
    }

    await this.userRepository.save(user);

    const current = {
      communications: user.hasActiveConsent(ConsentType.COMMUNICATIONS),
      telegram: user.hasActiveConsent(ConsentType.TELEGRAM),
      personal_data: previous.personal_data,
    };

    if (audit && (previous.communications !== current.communications || previous.telegram !== current.telegram)) {
      await this.writeAuditLogUseCase.execute({
        actorUserId: audit.actorUserId,
        actorRole: audit.actorRole,
        action: 'consent_updated',
        entityType: 'user',
        entityId: userId,
        oldValue: {
          communications: previous.communications,
          telegram: previous.telegram,
        },
        newValue: {
          communications: current.communications,
          telegram: current.telegram,
        },
        ipAddress: audit.ipAddress ?? null,
        userAgent: audit.userAgent ?? null,
      });
    }

    if (previous.communications !== current.communications) {
      await this.trackingService.trackConsentUpdated({
        consentType: 'communications',
        newValue: current.communications,
      });
    }

    if (previous.telegram !== current.telegram) {
      await this.trackingService.trackConsentUpdated({
        consentType: 'telegram',
        newValue: current.telegram,
      });

      if (!current.telegram && user.telegramUserId) {
        await this.telegramSessionRepository.deactivateSessions(user.telegramUserId);
      }
    }

    return {
      consents: {
        personal_data: current.personal_data,
        communications: current.communications,
        telegram: current.telegram,
      },
    };
  }
}
