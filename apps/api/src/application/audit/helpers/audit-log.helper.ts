import { Injectable, Inject } from '@nestjs/common';
import { WriteAuditLogUseCase } from '../use-cases/WriteAuditLogUseCase';
import { WriteAuditLogDto } from '../dto/audit-log.dto';

/**
 * Helper service for writing audit log entries.
 * Provides convenient methods for common audit logging scenarios.
 */
@Injectable()
export class AuditLogHelper {
  constructor(
    private readonly writeAuditLogUseCase: WriteAuditLogUseCase,
  ) {}

  /**
   * Logs a critical admin action.
   * 
   * @param actorUserId - ID of the user performing the action (nullable for anonymous)
   * @param actorRole - Role of the user (owner, assistant, editor, anonymous)
   * @param action - Action name (e.g., 'admin_price_changed')
   * @param entityType - Type of entity being acted upon (e.g., 'service', 'content')
   * @param entityId - ID of the entity (optional)
   * @param oldValue - Previous value (will be sanitized)
   * @param newValue - New value (will be sanitized)
   * @param ipAddress - IP address of the request (optional)
   * @param userAgent - User agent of the request (optional)
   */
  async logAction(
    actorUserId: string | null,
    actorRole: string | null,
    action: string,
    entityType: string,
    entityId?: string | null,
    oldValue?: Record<string, any> | null,
    newValue?: Record<string, any> | null,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<void> {
    const dto: WriteAuditLogDto = {
      actorUserId,
      actorRole,
      action,
      entityType,
      entityId: entityId || null,
      oldValue: oldValue || null,
      newValue: newValue || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    };

    try {
      await this.writeAuditLogUseCase.execute(dto);
    } catch (error) {
      // For non-critical actions, we log the error but don't throw
      // Critical actions should handle errors themselves
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Extracts IP address from request object.
   * Handles various proxy headers (X-Forwarded-For, X-Real-IP).
   */
  static extractIpAddress(request: any): string | null {
    if (!request) {
      return null;
    }

    // Check X-Forwarded-For header (first IP in chain)
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (forwardedFor) {
      const ips = forwardedFor.split(',');
      return ips[0].trim();
    }

    // Check X-Real-IP header
    const realIp = request.headers?.['x-real-ip'];
    if (realIp) {
      return realIp.trim();
    }

    // Fallback to connection remote address
    if (request.connection?.remoteAddress) {
      return request.connection.remoteAddress;
    }

    // Fallback to socket remote address
    if (request.socket?.remoteAddress) {
      return request.socket.remoteAddress;
    }

    return null;
  }

  /**
   * Extracts user agent from request object.
   */
  static extractUserAgent(request: any): string | null {
    if (!request) {
      return null;
    }

    return request.headers?.['user-agent'] || null;
  }
}
