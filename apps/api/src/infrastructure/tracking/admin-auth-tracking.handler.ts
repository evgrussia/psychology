import { Injectable, OnModuleInit, Inject, Scope } from '@nestjs/common';
import { IEventBus } from '../../domain/events/event-bus.interface';
import { AdminLoggedInEvent } from '../../domain/identity/events/AdminLoggedInEvent';
import { TrackingService } from './tracking.service';

/**
 * Tracks admin_login event for analytics (no PII).
 */
@Injectable({ scope: Scope.DEFAULT })
export class AdminAuthTrackingHandler implements OnModuleInit {
  constructor(
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
    private readonly trackingService: TrackingService,
  ) {}

  onModuleInit() {
    this.eventBus.subscribe('AdminLoggedInEvent', async (event) => {
      await this.handleAdminLoggedIn(event);
    });
  }

  private async handleAdminLoggedIn(event: any): Promise<void> {
    try {
      const roles = event.roles || event.payload?.roles || [];
      await this.trackingService.trackAdminLogin({
        role: roles[0] ?? 'unknown',
      });
    } catch (error) {
      console.error('Failed to track admin_login event:', error);
    }
  }
}
