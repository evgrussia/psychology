import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfileRepository } from '@domain/identity/repositories/IUserProfileRepository';

@Injectable()
export class GetAdminProfileUseCase {
  constructor(
    @Inject('IUserProfileRepository')
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(userId: string) {
    const profile = await this.userProfileRepository.getProfile(userId);
    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return {
      id: profile.id,
      email: profile.email,
      phone: profile.phone,
      display_name: profile.displayName,
      timezone: profile.timezone,
      bio_markdown: profile.bioMarkdown,
      avatar_media_asset_id: profile.avatarMediaAssetId,
      avatar_url: profile.avatarUrl,
    };
  }
}
