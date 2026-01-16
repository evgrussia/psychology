import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ConsentType } from '@domain/identity/value-objects/ConsentType';

@Injectable()
export class GetCabinetConsentsUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      personal_data: user.hasActiveConsent(ConsentType.PERSONAL_DATA),
      communications: user.hasActiveConsent(ConsentType.COMMUNICATIONS),
      telegram: user.hasActiveConsent(ConsentType.TELEGRAM),
    };
  }
}
