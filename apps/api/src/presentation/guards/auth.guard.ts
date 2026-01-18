import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
  Optional,
} from '@nestjs/common';
import { GetCurrentUserUseCase } from '../../application/identity/use-cases/GetCurrentUserUseCase';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../application/audit/dto/audit-log.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    @Optional()
    @Inject('AuditLogHelper')
    private readonly auditLogHelper?: AuditLogHelper,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.['sessionId'] || request.headers?.['x-session-id'];

    if (!sessionId) {
      await this.logUnauthorizedAttempt(request, 'missing_session');
      throw new UnauthorizedException('Session not found');
    }

    try {
      const result = await this.getCurrentUserUseCase.execute(sessionId);
      request.user = result.user;
      request.session = result.session;
      return true;
    } catch (error) {
      await this.logUnauthorizedAttempt(request, 'invalid_session');
      throw new UnauthorizedException('Invalid session');
    }
  }

  private async logUnauthorizedAttempt(request: any, reason: 'missing_session' | 'invalid_session'): Promise<void> {
    if (!this.auditLogHelper) {
      return;
    }

    try {
      await this.auditLogHelper.logAction(
        null,
        'anonymous',
        AuditLogAction.SECURITY_UNAUTHORIZED,
        'auth',
        null,
        null,
        {
          reason,
          method: request?.method,
          path: request?.originalUrl || request?.url,
        },
        AuditLogHelper.extractIpAddress(request),
        AuditLogHelper.extractUserAgent(request),
      );
    } catch (logError) {
      // Security logging should be best-effort
    }
  }
}
