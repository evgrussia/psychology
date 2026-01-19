import { Inject, Injectable } from '@nestjs/common';
import { IAdminUserRepository } from '@domain/identity/repositories/IAdminUserRepository';

@Injectable()
export class ListAdminUsersUseCase {
  constructor(
    @Inject('IAdminUserRepository')
    private readonly adminUserRepository: IAdminUserRepository,
  ) {}

  async execute() {
    const users = await this.adminUserRepository.listAdminUsers();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      display_name: user.displayName,
      status: user.status,
      roles: user.roles,
      last_login_at: user.lastLoginAt,
    }));
  }
}
