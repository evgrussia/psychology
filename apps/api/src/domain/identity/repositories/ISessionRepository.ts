import { Session } from '../aggregates/Session';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  save(session: Session): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
