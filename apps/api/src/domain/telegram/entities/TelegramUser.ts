export interface TelegramUserProps {
  telegramUserId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  languageCode: string | null;
  isBot: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date | null;
}

export class TelegramUser {
  private constructor(private readonly props: TelegramUserProps) {}

  static create(props: TelegramUserProps): TelegramUser {
    if (!props.telegramUserId?.trim()) {
      throw new Error('Telegram user id is required');
    }
    return new TelegramUser(props);
  }

  static reconstitute(props: TelegramUserProps): TelegramUser {
    return new TelegramUser(props);
  }

  get telegramUserId(): string {
    return this.props.telegramUserId;
  }

  get username(): string | null {
    return this.props.username;
  }

  get firstName(): string | null {
    return this.props.firstName;
  }

  get lastName(): string | null {
    return this.props.lastName;
  }

  get languageCode(): string | null {
    return this.props.languageCode;
  }

  get isBot(): boolean {
    return this.props.isBot;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get lastSeenAt(): Date | null {
    return this.props.lastSeenAt;
  }
}
