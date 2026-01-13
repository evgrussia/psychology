import { DomainEvent } from '../../events/event-bus.interface';

export class AdminLoggedInEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly roles: string[],
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null = null,
  ) {
    super(userId, {
      userId,
      roles,
      ipAddress,
      userAgent,
    });
  }
}
