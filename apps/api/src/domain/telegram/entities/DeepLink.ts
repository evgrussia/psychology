import { TelegramFlow, TelegramTarget } from '../value-objects/TelegramEnums';

export interface DeepLinkProps {
  deepLinkId: string;
  flow: TelegramFlow;
  target: TelegramTarget;
  topicCode: string | null;
  entityRef: string | null;
  sourcePage: string | null;
  anonymousId: string | null;
  leadId: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export class DeepLink {
  private constructor(private readonly props: DeepLinkProps) {}

  static create(props: DeepLinkProps): DeepLink {
    if (!props.deepLinkId?.trim()) {
      throw new Error('Deep link id is required');
    }
    if (!Object.values(TelegramFlow).includes(props.flow)) {
      throw new Error(`Unsupported telegram flow: ${props.flow}`);
    }
    if (!Object.values(TelegramTarget).includes(props.target)) {
      throw new Error(`Unsupported telegram target: ${props.target}`);
    }
    if (!(props.expiresAt instanceof Date) || Number.isNaN(props.expiresAt.getTime())) {
      throw new Error('Invalid deep link expiration date');
    }
    if (props.expiresAt <= props.createdAt) {
      throw new Error('Deep link expiration must be after creation time');
    }
    return new DeepLink(props);
  }

  static reconstitute(props: DeepLinkProps): DeepLink {
    return new DeepLink(props);
  }

  get deepLinkId(): string {
    return this.props.deepLinkId;
  }

  get flow(): TelegramFlow {
    return this.props.flow;
  }

  get target(): TelegramTarget {
    return this.props.target;
  }

  get topicCode(): string | null {
    return this.props.topicCode;
  }

  get entityRef(): string | null {
    return this.props.entityRef;
  }

  get sourcePage(): string | null {
    return this.props.sourcePage;
  }

  get anonymousId(): string | null {
    return this.props.anonymousId;
  }

  get leadId(): string | null {
    return this.props.leadId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  isExpired(referenceDate: Date = new Date()): boolean {
    return this.props.expiresAt <= referenceDate;
  }
}
