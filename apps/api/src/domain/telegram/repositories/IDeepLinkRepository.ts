import { DeepLink } from '../entities/DeepLink';

export interface IDeepLinkRepository {
  create(deepLink: DeepLink): Promise<void>;
  findById(deepLinkId: string): Promise<DeepLink | null>;
  findActiveById(deepLinkId: string, now: Date): Promise<DeepLink | null>;
  deleteExpired(now: Date): Promise<number>;
}
