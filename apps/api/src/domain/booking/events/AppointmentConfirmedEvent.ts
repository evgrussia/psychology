import { DomainEvent } from '../../events/event-bus.interface';

export class AppointmentConfirmedEvent extends DomainEvent {
  constructor(
    public readonly appointmentId: string,
    public readonly serviceId: string,
    public readonly startAtUtc: Date,
    public readonly endAtUtc: Date,
    public readonly timezone: string,
  ) {
    super(appointmentId, {
      serviceId,
      startAtUtc,
      endAtUtc,
      timezone,
    });
  }
}
