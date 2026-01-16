import { WaitlistRequest } from '../entities/WaitlistRequest';

export interface IWaitlistRequestRepository {
  create(request: WaitlistRequest): Promise<void>;
  findById(id: string): Promise<WaitlistRequest | null>;
}
