import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { IEventBus } from '../../domain/events/event-bus.interface';
import { AdminLoggedInEvent } from '../../domain/identity/events/AdminLoggedInEvent';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../application/audit/dto/audit-log.dto';

/**
 * Event handler for admin actions that should be logged to audit log.
 * Subscribes to domain events and writes audit log entries.
 */
@Injectable()
export class AuditLogHandler implements OnModuleInit {
  constructor(
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  onModuleInit() {
    // Subscribe to AdminLoggedInEvent
    this.eventBus.subscribe('AdminLoggedInEvent', async (event: any) => {
      await this.handleAdminLoggedIn(event);
    });
  }

  private async handleAdminLoggedIn(event: AdminLoggedInEvent): Promise<void> {
    try {
      await this.auditLogHelper.logAction(
        event.userId,
        event.roles[0] || 'unknown', // Use first role or 'unknown'
        AuditLogAction.ADMIN_LOGIN,
        'user',
        event.userId,
        null,
        { roles: event.roles },
        event.ipAddress || null,
        event.userAgent || null,
      );
    } catch (error) {
      // Log error but don't fail the login process
      console.error('Failed to write audit log for admin login:', error);
    }
  }
}
