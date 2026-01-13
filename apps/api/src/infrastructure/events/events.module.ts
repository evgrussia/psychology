import { Module, Global } from '@nestjs/common';
import { EventBusService } from './event-bus.service';

@Global()
@Module({
  providers: [
    EventBusService,
    {
      provide: 'IEventBus',
      useExisting: EventBusService,
    },
  ],
  exports: [EventBusService, 'IEventBus'],
})
export class EventsModule {}
