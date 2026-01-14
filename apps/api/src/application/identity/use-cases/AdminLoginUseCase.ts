import { Injectable, UnauthorizedException, Inject, Optional } from '@nestjs/common';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ISessionRepository } from '@domain/identity/repositories/ISessionRepository';
import { IPasswordHasher } from '../../../infrastructure/auth/bcrypt-hasher';
import { IEventBus } from '@domain/events/event-bus.interface';
import { Email } from '@domain/identity/value-objects/Email';
import { Session } from '@domain/identity/aggregates/Session';
import { AdminLoggedInEvent } from '@domain/identity/events/AdminLoggedInEvent';
import { AdminLoginDto, LoginResponseDto } from '../dto/login.dto';
import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../audit/dto/audit-log.dto';
import * as crypto from 'crypto';

@Injectable()
export class AdminLoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
    @Optional()
    @Inject('AuditLogHelper')
    private readonly auditLogHelper?: AuditLogHelper,
  ) {}

  async execute(dto: AdminLoginDto): Promise<LoginResponseDto> {
    const email = Email.create(dto.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.status.isActive()) {
      throw new UnauthorizedException('User account is not active');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('User has no password set');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is an admin
    const isAdmin = user.roles.some((role) => role.isAdmin());
    if (!isAdmin) {
      throw new UnauthorizedException('Access denied');
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const session = Session.create(
      sessionId,
      user.id,
      dto.userAgent || null,
      dto.ipAddress || null,
    );

    await this.sessionRepository.save(session);

    // Publish security event
    await this.eventBus.publish(
      new AdminLoggedInEvent(
        user.id,
        user.roles.map((r) => r.code),
        dto.ipAddress || null,
        dto.userAgent || null,
      ),
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
