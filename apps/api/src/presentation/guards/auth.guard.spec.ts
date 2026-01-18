import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuditLogAction } from '../../application/audit/dto/audit-log.dto';

describe('AuthGuard', () => {
  const buildContext = (request: any) => ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  });

  it('logs security event when session is missing', async () => {
    const getCurrentUserUseCase = { execute: jest.fn() };
    const auditLogHelper = { logAction: jest.fn().mockResolvedValue(undefined) };
    const guard = new AuthGuard(getCurrentUserUseCase as any, auditLogHelper as any);

    const request = { headers: {}, cookies: {}, method: 'GET', originalUrl: '/admin/leads' };

    await expect(guard.canActivate(buildContext(request) as any)).rejects.toThrow(UnauthorizedException);
    expect(auditLogHelper.logAction).toHaveBeenCalledTimes(1);
    const call = auditLogHelper.logAction.mock.calls[0];
    expect(call[2]).toBe(AuditLogAction.SECURITY_UNAUTHORIZED);
  });

  it('logs security event when session is invalid', async () => {
    const getCurrentUserUseCase = { execute: jest.fn().mockRejectedValue(new Error('invalid')) };
    const auditLogHelper = { logAction: jest.fn().mockResolvedValue(undefined) };
    const guard = new AuthGuard(getCurrentUserUseCase as any, auditLogHelper as any);

    const request = { headers: { 'x-session-id': 'invalid' }, cookies: {}, method: 'GET', originalUrl: '/admin/leads' };

    await expect(guard.canActivate(buildContext(request) as any)).rejects.toThrow(UnauthorizedException);
    expect(auditLogHelper.logAction).toHaveBeenCalledTimes(1);
    const call = auditLogHelper.logAction.mock.calls[0];
    expect(call[2]).toBe(AuditLogAction.SECURITY_UNAUTHORIZED);
  });

  it('allows access for valid session', async () => {
    const getCurrentUserUseCase = {
      execute: jest.fn().mockResolvedValue({ user: { id: 'user-1', roles: ['owner'] }, session: { id: 's1' } }),
    };
    const auditLogHelper = { logAction: jest.fn() };
    const guard = new AuthGuard(getCurrentUserUseCase as any, auditLogHelper as any);

    const request = { headers: { 'x-session-id': 'valid' }, cookies: {}, method: 'GET', originalUrl: '/admin/leads' };

    await expect(guard.canActivate(buildContext(request) as any)).resolves.toBe(true);
    expect(auditLogHelper.logAction).not.toHaveBeenCalled();
  });
});
