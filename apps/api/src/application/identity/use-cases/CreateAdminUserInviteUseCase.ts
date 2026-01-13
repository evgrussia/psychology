import { Injectable, Inject, ConflictException, BadRequestException, Optional } from '@nestjs/common';
import { IAdminInviteRepository } from '../../../domain/identity/repositories/IAdminInviteRepository';
import { IUserRepository } from '../../../domain/identity/repositories/IUserRepository';
import { AdminInvite } from '../../../domain/identity/aggregates/AdminInvite';
import { CreateAdminInviteDto, AdminInviteResponseDto } from '../dto/invite.dto';
import { Email } from '../../../domain/identity/value-objects/Email';
import { Role } from '../../../domain/identity/value-objects/Role';
import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../audit/dto/audit-log.dto';
import * as crypto from 'crypto';

@Injectable()
export class CreateAdminUserInviteUseCase {
  constructor(
    @Inject('IAdminInviteRepository')
    private readonly adminInviteRepository: IAdminInviteRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Optional()
    @Inject('AuditLogHelper')
    private readonly auditLogHelper?: AuditLogHelper,
  ) {}

  async execute(dto: CreateAdminInviteDto, actorUserId?: string, actorRole?: string): Promise<AdminInviteResponseDto> {
    const email = Email.create(dto.email);
    
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role
    let role: Role;
    try {
      role = Role.fromCode(dto.roleCode);
      if (!role.isAdmin()) {
        throw new BadRequestException('Only admin roles can be invited via this flow');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const inviteId = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    
    const invite = AdminInvite.create(
      inviteId,
      email.value,
      role.code,
      token
    );

    await this.adminInviteRepository.save(invite);

    // Log to audit log
    if (this.auditLogHelper && actorUserId) {
      try {
        await this.auditLogHelper.logAction(
          actorUserId,
          actorRole || 'owner',
          AuditLogAction.ADMIN_ROLE_CHANGED,
          'UserInvite',
          inviteId,
          null,
          {
            email: email.value,
            invitedRole: role.code,
          }
        );
      } catch (error) {
        console.error('Failed to write audit log for admin invite:', error);
      }
    }

    return {
      id: invite.id,
      email: invite.email,
      roleCode: invite.roleCode,
      token: invite.token,
      expiresAt: invite.expiresAt,
    };
  }
}
