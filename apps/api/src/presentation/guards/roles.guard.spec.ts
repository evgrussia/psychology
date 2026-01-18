import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { AuditLogAction } from '../../application/audit/dto/audit-log.dto';

describe('RolesGuard', () => {
  const buildContext = (user: any) => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        method: 'GET',
        originalUrl: '/admin/leads',
      }),
    }),
  });

  it('allows access when no roles required', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    };
    const auditLogHelper = {
      logAction: jest.fn(),
    };
    const guard = new RolesGuard(reflector as any, auditLogHelper as any);

    await expect(guard.canActivate(buildContext({ id: 'user-1', roles: ['editor'] }) as any)).resolves.toBe(true);
    expect(auditLogHelper.logAction).not.toHaveBeenCalled();
  });

  it('denies access and logs security event when role mismatch', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['owner', 'assistant']),
    };
    const auditLogHelper = {
      logAction: jest.fn().mockResolvedValue(undefined),
    };
    const guard = new RolesGuard(reflector as any, auditLogHelper as any);

    await expect(guard.canActivate(buildContext({ id: 'user-1', roles: ['editor'] }) as any)).rejects.toThrow(
      ForbiddenException,
    );

    expect(auditLogHelper.logAction).toHaveBeenCalledTimes(1);
    const call = auditLogHelper.logAction.mock.calls[0];
    expect(call[2]).toBe(AuditLogAction.SECURITY_ACCESS_DENIED);
    expect(call[6]).toEqual(
      expect.objectContaining({
        required_roles: ['owner', 'assistant'],
      }),
    );
  });

  it('denies access and logs security event when user roles missing', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['owner']),
    };
    const auditLogHelper = {
      logAction: jest.fn().mockResolvedValue(undefined),
    };
    const guard = new RolesGuard(reflector as any, auditLogHelper as any);

    await expect(guard.canActivate(buildContext({ id: 'user-1' }) as any)).rejects.toThrow(ForbiddenException);
    expect(auditLogHelper.logAction).toHaveBeenCalledTimes(1);
    const call = auditLogHelper.logAction.mock.calls[0];
    expect(call[2]).toBe(AuditLogAction.SECURITY_ACCESS_DENIED);
  });
});
