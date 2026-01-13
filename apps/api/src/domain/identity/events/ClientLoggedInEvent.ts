import { DomainEvent } from '../../events/event-bus.interface';

export class ClientLoggedInEvent implements DomainEvent {
  readonly eventName = 'ClientLoggedIn';
  readonly occurredAt = new Date();

  constructor(
    public readonly userId: string,
    public readonly ipAddress: string | null,
  ) {}
}
