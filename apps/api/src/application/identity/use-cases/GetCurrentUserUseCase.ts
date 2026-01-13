import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../../domain/identity/repositories/IUserRepository';
import { ISessionRepository } from '../../../domain/identity/repositories/ISessionRepository';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(sessionId: string) {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session || !session.isValid()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const user = await this.userRepository.findById(session.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.status.isActive()) {
      throw new UnauthorizedException('User account is not active');
    }

    return {
      user: {
        id: user.id,
        email: user.email?.value || null,
        displayName: user.displayName,
        roles: user.roles.map((r) => r.code),
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }
}
