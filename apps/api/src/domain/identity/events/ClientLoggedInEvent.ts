import { DomainEvent } from '../../events/event-bus.interface';

export class ClientLoggedInEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly ipAddress: string | null,
  ) {
    super(userId, {
      userId,
      ipAddress,
    });
  }
}
