import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IUserRepository } from '../../../../domain/identity/repositories/IUserRepository';
import { User } from '../../../../domain/identity/aggregates/User';
import { Email } from '../../../../domain/identity/value-objects/Email';
import { UserMapper } from './user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        consents: true,
      },
    });

    if (!prismaUser) return null;

    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: email.value },
      include: {
        roles: { include: { role: true } },
        consents: true,
      },
    });

    if (!prismaUser) return null;

    return UserMapper.toDomain(prismaUser);
  }

  async findByTelegramUserId(telegramUserId: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { telegram_user_id: telegramUserId },
      include: {
        roles: { include: { role: true } },
        consents: true,
      },
    });

    if (!prismaUser) return null;

    return UserMapper.toDomain(prismaUser);
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await this.prisma.$transaction(async (tx) => {
      // Upsert user
      await tx.user.upsert({
        where: { id: user.id },
        update: data,
        create: data,
      });

      // Sync roles
      await tx.userRole.deleteMany({
        where: { user_id: user.id },
      });

      if (user.roles.length > 0) {
        await tx.userRole.createMany({
          data: user.roles.map((role) => ({
            user_id: user.id,
            role_code: role.code,
          })),
        });
      }

      // Sync consents
      for (const consent of user.consents) {
        await tx.consent.upsert({
          where: { id: consent.id },
          update: {
            revoked_at: consent.revokedAt,
          },
          create: {
            id: consent.id,
            user_id: user.id,
            consent_type: consent.type.value,
            version: consent.version,
            source: consent.source,
            granted_at: consent.grantedAt,
            revoked_at: consent.revokedAt,
          },
        });
      }
    });
  }
}
