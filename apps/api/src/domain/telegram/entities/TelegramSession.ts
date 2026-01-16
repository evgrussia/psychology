import { TelegramFlow, TelegramFrequency, TelegramSessionState } from '../value-objects/TelegramEnums';

export interface ConciergePreferences {
  format?: string | null;
  timeWindow?: string | null;
  goal?: string | null;
}

export interface TelegramSessionProps {
  id: string;
  telegramUserId: string;
  state: TelegramSessionState;
  flow: TelegramFlow | null;
  deepLinkId: string | null;
  topicCode: string | null;
  frequency: TelegramFrequency | null;
  conciergePreferences: ConciergePreferences | null;
  isActive: boolean;
  startedAt: Date;
  updatedAt: Date;
  stoppedAt: Date | null;
  lastInteractionAt: Date | null;
}

export class TelegramSession {
  private constructor(private props: TelegramSessionProps) {}

  static start(params: {
    id: string;
    telegramUserId: string;
    flow: TelegramFlow | null;
    deepLinkId: string | null;
    topicCode: string | null;
    state: TelegramSessionState;
  }): TelegramSession {
    if (!params.telegramUserId?.trim()) {
      throw new Error('Telegram user id is required');
    }
    const now = new Date();
    return new TelegramSession({
      id: params.id,
      telegramUserId: params.telegramUserId,
      state: params.state,
      flow: params.flow,
      deepLinkId: params.deepLinkId,
      topicCode: params.topicCode,
      frequency: null,
      conciergePreferences: null,
      isActive: true,
      startedAt: now,
      updatedAt: now,
      stoppedAt: null,
      lastInteractionAt: now,
    });
  }

  static reconstitute(props: TelegramSessionProps): TelegramSession {
    return new TelegramSession(props);
  }

  get id(): string {
    return this.props.id;
  }

  get telegramUserId(): string {
    return this.props.telegramUserId;
  }

  get state(): TelegramSessionState {
    return this.props.state;
  }

  get flow(): TelegramFlow | null {
    return this.props.flow;
  }

  get deepLinkId(): string | null {
    return this.props.deepLinkId;
  }

  get topicCode(): string | null {
    return this.props.topicCode;
  }

  get frequency(): TelegramFrequency | null {
    return this.props.frequency;
  }

  get conciergePreferences(): ConciergePreferences | null {
    return this.props.conciergePreferences;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get stoppedAt(): Date | null {
    return this.props.stoppedAt;
  }

  get lastInteractionAt(): Date | null {
    return this.props.lastInteractionAt;
  }

  update(fields: Partial<Omit<TelegramSessionProps, 'id' | 'telegramUserId' | 'startedAt'>>): void {
    this.props = {
      ...this.props,
      ...fields,
      updatedAt: new Date(),
    };
  }

  stop(reasonState: TelegramSessionState = TelegramSessionState.stopped): void {
    this.update({
      isActive: false,
      state: reasonState,
      stoppedAt: new Date(),
    });
  }
}
