import { Injectable } from '@nestjs/common';
import { IEventBus, IDomainEvent } from '../../domain/events/event-bus.interface';

/**
 * In-memory implementation of EventBus
 * 
 * For production, this should be replaced with a proper message broker
 * (RabbitMQ, Kafka, Redis Pub/Sub, etc.)
 */
@Injectable()
export class EventBusService implements IEventBus {
  private handlers: Map<string, Array<(event: IDomainEvent) => Promise<void>>> = new Map();

  async publish(event: IDomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    
    // Execute all handlers for this event type
    await Promise.all(
      handlers.map((handler) => 
        handler(event).catch((error) => {
          console.error(`Error handling event ${event.eventType}:`, error);
          // In production, this should be logged to a proper logging service
        })
      )
    );
  }

  async publishAll(events: IDomainEvent[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  subscribe(
    eventType: string,
    handler: (event: IDomainEvent) => Promise<void>,
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unsubscribe(
    eventType: string,
    handler: (event: IDomainEvent) => Promise<void>,
  ): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}
