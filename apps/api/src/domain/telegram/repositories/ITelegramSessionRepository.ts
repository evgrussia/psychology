import { TelegramSession } from '../entities/TelegramSession';

export interface ITelegramSessionRepository {
  findActiveByUserId(telegramUserId: string): Promise<TelegramSession | null>;
  findDueScheduledSessions(now: Date, limit: number): Promise<TelegramSession[]>;
  create(session: TelegramSession): Promise<void>;
  update(session: TelegramSession): Promise<void>;
  deactivateSessions(telegramUserId: string): Promise<number>;
}
