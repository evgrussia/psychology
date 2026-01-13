import { DomainEvent } from '../../events/event-bus.interface';

export class AdminLoggedInEvent implements DomainEvent {
  readonly eventName = 'AdminLoggedIn';
  readonly occurredAt = new Date();

  constructor(
    public readonly userId: string,
    public readonly roles: string[],
    public readonly ipAddress: string | null,
  ) {}
}
