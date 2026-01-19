export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  timezone: string | null;
  bioMarkdown: string | null;
  avatarMediaAssetId: string | null;
  avatarUrl: string | null;
}

export interface IUserProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  updateProfile(
    userId: string,
    data: Partial<Omit<UserProfile, 'id' | 'avatarUrl'>>,
  ): Promise<UserProfile>;
}
