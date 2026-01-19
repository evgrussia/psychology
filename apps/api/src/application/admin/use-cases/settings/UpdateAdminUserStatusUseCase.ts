import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAdminUserRepository } from '@domain/identity/repositories/IAdminUserRepository';

export interface UpdateAdminUserStatusDto {
  status: 'active' | 'blocked';
}

@Injectable()
export class UpdateAdminUserStatusUseCase {
  constructor(
    @Inject('IAdminUserRepository')
    private readonly adminUserRepository: IAdminUserRepository,
  ) {}

  async execute(userId: string, dto: UpdateAdminUserStatusDto) {
    const currentRoles = await this.adminUserRepository.getAdminRoles(userId);
    if (!currentRoles) {
      throw new NotFoundException('User not found');
    }

    await this.adminUserRepository.setUserStatus(userId, dto.status);
  }
}
