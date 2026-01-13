import { AdminInvite } from '../aggregates/AdminInvite';

export interface IAdminInviteRepository {
  findById(id: string): Promise<AdminInvite | null>;
  findByToken(token: string): Promise<AdminInvite | null>;
  findByEmail(email: string): Promise<AdminInvite | null>;
  save(invite: AdminInvite): Promise<void>;
  delete(id: string): Promise<void>;
}
