import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GetCurrentUserUseCase } from '../../application/identity/use-cases/GetCurrentUserUseCase';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.['sessionId'] || request.headers?.['x-session-id'];

    if (!sessionId) {
      throw new UnauthorizedException('Session not found');
    }

    try {
      const result = await this.getCurrentUserUseCase.execute(sessionId);
      request.user = result.user;
      request.session = result.session;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
