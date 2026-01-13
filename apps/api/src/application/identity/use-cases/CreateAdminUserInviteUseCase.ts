import { Injectable, Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { IAdminInviteRepository } from '../../../domain/identity/repositories/IAdminInviteRepository';
import { IUserRepository } from '../../../domain/identity/repositories/IUserRepository';
import { AdminInvite } from '../../../domain/identity/aggregates/AdminInvite';
import { CreateAdminInviteDto, AdminInviteResponseDto } from '../dto/invite.dto';
import { Email } from '../../../domain/identity/value-objects/Email';
import { Role } from '../../../domain/identity/value-objects/Role';
import * as crypto from 'crypto';

@Injectable()
export class CreateAdminUserInviteUseCase {
  constructor(
    @Inject('IAdminInviteRepository')
    private readonly adminInviteRepository: IAdminInviteRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateAdminInviteDto): Promise<AdminInviteResponseDto> {
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

    return {
      id: invite.id,
      email: invite.email,
      roleCode: invite.roleCode,
      token: invite.token,
      expiresAt: invite.expiresAt,
    };
  }
}
