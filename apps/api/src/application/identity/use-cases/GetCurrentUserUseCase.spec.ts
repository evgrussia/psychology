import { GetCurrentUserUseCase } from './GetCurrentUserUseCase';
import { UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@domain/identity/value-objects/UserStatus';
import { Role } from '@domain/identity/value-objects/Role';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepository: any;
  let sessionRepository: any;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    };
    sessionRepository = {
      findById: jest.fn(),
    };
    useCase = new GetCurrentUserUseCase(userRepository, sessionRepository);
  });

  it('should throw UnauthorizedException if user is blocked', async () => {
    const sessionId = 'session-123';
    const userId = 'user-123';
    const session = {
      id: sessionId,
      userId: userId,
      isValid: () => true,
    };
    const user = {
      id: userId,
      status: UserStatus.BLOCKED,
      roles: [Role.OWNER],
    };

    sessionRepository.findById.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);

    await expect(useCase.execute(sessionId)).rejects.toThrow(
      new UnauthorizedException('User account is not active'),
    );
  });

  it('should return user info if session is valid and user is active', async () => {
    const sessionId = 'session-123';
    const userId = 'user-123';
    const session = {
      id: sessionId,
      userId: userId,
      isValid: () => true,
      expiresAt: new Date(),
    };
    const user = {
      id: userId,
      email: { value: 'test@example.com' },
      displayName: 'Test User',
      status: UserStatus.ACTIVE,
      roles: [Role.OWNER],
    };

    sessionRepository.findById.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute(sessionId);

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.id).toBe(userId);
  });
});
