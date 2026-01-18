import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../application/audit/dto/audit-log.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Optional()
    @Inject('AuditLogHelper')
    private readonly auditLogHelper?: AuditLogHelper,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roles) {
      await this.logAccessDenied(context, null, null, requiredRoles, 'missing_roles');
      throw new ForbiddenException('You do not have the required roles');
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));
    
    if (!hasRole) {
      await this.logAccessDenied(context, user.id ?? null, user.roles?.[0] ?? null, requiredRoles, 'role_mismatch');
      throw new ForbiddenException('You do not have the required roles');
    }

    return true;
  }

  private async logAccessDenied(
    context: ExecutionContext,
    actorUserId: string | null,
    actorRole: string | null,
    requiredRoles: string[],
    reason: 'missing_roles' | 'role_mismatch',
  ): Promise<void> {
    if (!this.auditLogHelper) {
      return;
    }

    const request = context.switchToHttp().getRequest();
    try {
      await this.auditLogHelper.logAction(
        actorUserId,
        actorRole ?? 'unknown',
        AuditLogAction.SECURITY_ACCESS_DENIED,
        'auth',
        null,
        null,
        {
          reason,
          method: request?.method,
          path: request?.originalUrl || request?.url,
          required_roles: requiredRoles,
        },
        AuditLogHelper.extractIpAddress(request),
        AuditLogHelper.extractUserAgent(request),
      );
    } catch (logError) {
      // Security logging should be best-effort
    }
  }
}
