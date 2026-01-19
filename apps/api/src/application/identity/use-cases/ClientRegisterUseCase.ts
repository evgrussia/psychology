import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ISessionRepository } from '@domain/identity/repositories/ISessionRepository';
import { IPasswordHasher } from '../../../infrastructure/auth/bcrypt-hasher';
import { IEventBus } from '@domain/events/event-bus.interface';
import { Email } from '@domain/identity/value-objects/Email';
import { Session } from '@domain/identity/aggregates/Session';
import { Role } from '@domain/identity/value-objects/Role';
import { User } from '@domain/identity/aggregates/User';
import { ClientLoggedInEvent } from '@domain/identity/events/ClientLoggedInEvent';
import { ClientRegisterDto, LoginResponseDto } from '../dto/login.dto';
import * as crypto from 'crypto';

@Injectable()
export class ClientRegisterUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async execute(dto: ClientRegisterDto): Promise<LoginResponseDto> {
    const email = Email.create(dto.email);
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      if (!existingUser.status.isActive()) {
        throw new UnauthorizedException('User account is not active');
      }

      if (existingUser.roles.some((role) => role.isAdmin())) {
        throw new ConflictException('User already exists');
      }

      if (existingUser.passwordHash) {
        throw new ConflictException('User already registered');
      }

      const passwordHash = await this.passwordHasher.hash(dto.password);
      existingUser.updatePassword(passwordHash);
      existingUser.assignRole(Role.CLIENT);
      await this.userRepository.save(existingUser);

      return this.createSession(existingUser, dto);
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const user = User.create(
      crypto.randomUUID(),
      email,
      null,
      null,
      passwordHash,
    );

    await this.userRepository.save(user);
    return this.createSession(user, dto);
  }

  private async createSession(user: User, dto: ClientRegisterDto): Promise<LoginResponseDto> {
    const sessionId = crypto.randomUUID();
    const session = Session.create(
      sessionId,
      user.id,
      dto.userAgent || null,
      dto.ipAddress || null,
    );

    await this.sessionRepository.save(session);
    await this.eventBus.publish(
      new ClientLoggedInEvent(user.id, dto.ipAddress || null),
    );

    return {
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email?.value || null,
        displayName: user.displayName,
        roles: user.roles.map((r) => r.code),
      },
    };
  }
}
