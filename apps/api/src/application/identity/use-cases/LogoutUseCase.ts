import { Injectable, Inject } from '@nestjs/common';
import { ISessionRepository } from '@domain/identity/repositories/ISessionRepository';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (session) {
      session.revoke();
      await this.sessionRepository.save(session);
    }
  }
}
