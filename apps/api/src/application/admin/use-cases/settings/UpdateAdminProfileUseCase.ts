import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '@domain/identity/repositories/IUserProfileRepository';
import { AuditLogHelper } from '../../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../../audit/dto/audit-log.dto';

export interface UpdateAdminProfileDto {
  email?: string | null;
  phone?: string | null;
  display_name?: string | null;
  timezone?: string | null;
  bio_markdown?: string | null;
  avatar_media_asset_id?: string | null;
}

@Injectable()
export class UpdateAdminProfileUseCase {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly userProfileRepository: IUserProfileRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(userId: string, dto: UpdateAdminProfileDto, actorRole: string) {
    const current = await this.userProfileRepository.getProfile(userId);
    if (!current) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userProfileRepository.updateProfile(userId, {
      email: dto.email ?? current.email,
      phone: dto.phone ?? current.phone,
      displayName: dto.display_name ?? current.displayName,
      timezone: dto.timezone ?? current.timezone,
      bioMarkdown: dto.bio_markdown ?? current.bioMarkdown,
      avatarMediaAssetId: dto.avatar_media_asset_id ?? current.avatarMediaAssetId,
    });

    try {
      await this.auditLogHelper.logAction(
        userId,
        actorRole,
        AuditLogAction.ADMIN_SETTINGS_CHANGED,
        'UserProfile',
        userId,
        {
          email: current.email,
          phone: current.phone,
          display_name: current.displayName,
          timezone: current.timezone,
          bio_markdown: current.bioMarkdown,
          avatar_media_asset_id: current.avatarMediaAssetId,
        },
        {
          email: updated.email,
          phone: updated.phone,
          display_name: updated.displayName,
          timezone: updated.timezone,
          bio_markdown: updated.bioMarkdown,
          avatar_media_asset_id: updated.avatarMediaAssetId,
        },
      );
    } catch (error) {
      console.error('Failed to log profile update to audit log:', error);
    }

    return {
      id: updated.id,
      email: updated.email,
      phone: updated.phone,
      display_name: updated.displayName,
      timezone: updated.timezone,
      bio_markdown: updated.bioMarkdown,
      avatar_media_asset_id: updated.avatarMediaAssetId,
      avatar_url: updated.avatarUrl,
    };
  }
}
