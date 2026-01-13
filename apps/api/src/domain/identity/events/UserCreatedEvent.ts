import { DomainEvent } from '../../events/event-bus.interface';
import { Email } from '../value-objects/Email';

export class UserCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly email: Email | null,
    public readonly phone: string | null,
    public readonly telegramUserId: string | null,
  ) {
    super(aggregateId, {
      email: email?.value,
      phone,
      telegramUserId,
    });
  }
}
