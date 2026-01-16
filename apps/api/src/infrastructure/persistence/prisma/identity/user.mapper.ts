import { User as PrismaUser, UserRole as PrismaUserRole, Role as PrismaRole, Consent as PrismaConsent } from '@prisma/client';
import { User } from '@domain/identity/aggregates/User';
import { Email } from '@domain/identity/value-objects/Email';
import { Role } from '@domain/identity/value-objects/Role';
import { UserStatus } from '@domain/identity/value-objects/UserStatus';
import { Consent } from '@domain/identity/entities/Consent';
import { ConsentType } from '@domain/identity/value-objects/ConsentType';

export class UserMapper {
  static toDomain(
    prismaUser: PrismaUser & {
      roles: (PrismaUserRole & { role: PrismaRole })[];
      consents: PrismaConsent[];
    },
  ): User {
    return User.reconstitute({
      id: prismaUser.id,
      email: prismaUser.email ? Email.create(prismaUser.email) : null,
      phone: prismaUser.phone,
      telegramUserId: prismaUser.telegram_user_id,
      displayName: prismaUser.display_name,
      passwordHash: prismaUser.password_hash,
      status: UserStatus.fromValue(prismaUser.status),
      roles: prismaUser.roles.map((ur) => Role.fromCode(ur.role_code)),
      consents: prismaUser.consents.map((c) =>
        Consent.reconstitute(
          c.id,
          ConsentType.fromValue(c.consent_type),
          c.version,
          c.source,
          c.granted_at,
          c.revoked_at,
        ),
      ),
      deletedAt: prismaUser.deleted_at,
      createdAt: prismaUser.created_at,
      updatedAt: prismaUser.updated_at,
    });
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      email: user.email?.value || null,
      phone: user.phone,
      telegram_user_id: user.telegramUserId,
      display_name: user.displayName,
      password_hash: user.passwordHash,
      status: user.status.value,
      deleted_at: user.deletedAt,
      created_at: user.createdAt,
      updated_at: new Date(),
    };
  }
}
