import { User } from '../aggregates/User';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByTelegramUserId(telegramUserId: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
