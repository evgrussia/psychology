import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAdminUserRepository } from '@domain/identity/repositories/IAdminUserRepository';

@Injectable()
export class DeleteAdminUserUseCase {
  constructor(
    @Inject('IAdminUserRepository')
    private readonly adminUserRepository: IAdminUserRepository,
  ) {}

  async execute(userId: string) {
    const currentRoles = await this.adminUserRepository.getAdminRoles(userId);
    if (!currentRoles) {
      throw new NotFoundException('User not found');
    }

    if (currentRoles.includes('owner')) {
      const ownerCount = await this.adminUserRepository.countAdminUsersByRole('owner');
      if (ownerCount <= 1) {
        throw new BadRequestException('Cannot delete the last owner');
      }
    }

    await this.adminUserRepository.markUserDeleted(userId);
  }
}
