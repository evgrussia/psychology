import { TelegramUser } from '../entities/TelegramUser';

export interface TelegramUserUpsertInput {
  telegramUserId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  languageCode?: string | null;
  isBot?: boolean;
  lastSeenAt?: Date | null;
}

export interface ITelegramUserRepository {
  upsert(input: TelegramUserUpsertInput): Promise<TelegramUser>;
  findById(telegramUserId: string): Promise<TelegramUser | null>;
}
