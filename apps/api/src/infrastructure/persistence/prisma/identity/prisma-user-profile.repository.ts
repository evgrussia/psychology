import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IUserProfileRepository, UserProfile } from '@domain/identity/repositories/IUserProfileRepository';

@Injectable()
export class PrismaUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        avatar_media_asset: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.display_name,
      timezone: user.timezone,
      bioMarkdown: user.bio_markdown,
      avatarMediaAssetId: user.avatar_media_asset_id,
      avatarUrl: user.avatar_media_asset?.public_url ?? null,
    };
  }

  async updateProfile(
    userId: string,
    data: Partial<Omit<UserProfile, 'id' | 'avatarUrl'>>,
  ): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        phone: data.phone,
        display_name: data.displayName,
        timezone: data.timezone,
        bio_markdown: data.bioMarkdown,
        avatar_media_asset_id: data.avatarMediaAssetId,
      },
      include: {
        avatar_media_asset: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.display_name,
      timezone: user.timezone,
      bioMarkdown: user.bio_markdown,
      avatarMediaAssetId: user.avatar_media_asset_id,
      avatarUrl: user.avatar_media_asset?.public_url ?? null,
    };
  }
}
