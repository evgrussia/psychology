import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAdminUserRepository } from '@domain/identity/repositories/IAdminUserRepository';
import { AuditLogHelper } from '../../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../../audit/dto/audit-log.dto';

export interface UpdateAdminUserRoleDto {
  role_code: string;
}

@Injectable()
export class UpdateAdminUserRoleUseCase {
  constructor(
    @Inject('IAdminUserRepository')
    private readonly adminUserRepository: IAdminUserRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(
    userId: string,
    dto: UpdateAdminUserRoleDto,
    actorUserId: string,
    actorRole: string,
  ) {
    const isAdminRole = await this.adminUserRepository.isAdminRole(dto.role_code);
    if (!isAdminRole) {
      throw new BadRequestException('Invalid admin role');
    }

    const currentRoles = await this.adminUserRepository.getAdminRoles(userId);
    if (!currentRoles) {
      throw new NotFoundException('User not found');
    }

    if (currentRoles.includes('owner') && dto.role_code !== 'owner') {
      const ownerCount = await this.adminUserRepository.countAdminUsersByRole('owner');
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot remove the last owner');
      }
    }

    await this.adminUserRepository.setAdminRole(userId, dto.role_code);

    try {
      await this.auditLogHelper.logAction(
        actorUserId,
        actorRole,
        AuditLogAction.ADMIN_ROLE_CHANGED,
        'User',
        userId,
        { roles: currentRoles },
        { roles: [dto.role_code] },
      );
    } catch (error) {
      console.error('Failed to log role update to audit log:', error);
    }
  }
}
