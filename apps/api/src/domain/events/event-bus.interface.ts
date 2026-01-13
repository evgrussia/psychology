/**
 * Domain Event Bus Interface
 * 
 * This interface defines the contract for publishing and subscribing to domain events.
 * Implementations should be in the infrastructure layer.
 */

export interface IDomainEvent {
  eventId: string;
  occurredOn: Date;
  eventType: string;
  aggregateId: string;
  payload: Record<string, any>;
}

export interface IEventBus {
  /**
   * Publish a domain event
   */
  publish(event: IDomainEvent): Promise<void>;

  /**
   * Publish multiple domain events
   */
  publishAll(events: IDomainEvent[]): Promise<void>;

  /**
   * Subscribe to events of a specific type
   */
  subscribe(
    eventType: string,
    handler: (event: IDomainEvent) => Promise<void>,
  ): void;

  /**
   * Unsubscribe from events
   */
  unsubscribe(eventType: string, handler: (event: IDomainEvent) => Promise<void>): void;
}

/**
 * Base class for domain events
 */
export abstract class DomainEvent implements IDomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventType: string;
  public readonly aggregateId: string;
  public readonly payload: Record<string, any>;

  constructor(aggregateId: string, payload: Record<string, any> = {}) {
    this.eventId = this.generateEventId();
    this.occurredOn = new Date();
    this.eventType = this.constructor.name;
    this.aggregateId = aggregateId;
    this.payload = payload;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
