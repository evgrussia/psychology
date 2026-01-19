import { Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AdminUserListItem, IAdminUserRepository } from '@domain/identity/repositories/IAdminUserRepository';

@Injectable()
export class PrismaAdminUserRepository implements IAdminUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listAdminUsers(): Promise<AdminUserListItem[]> {
    const users = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              scope: 'admin',
            },
          },
        },
      },
      include: {
        roles: {
          include: { role: true },
        },
        sessions: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map((user) => {
      const adminRoles = user.roles
        .filter((role) => role.role.scope === 'admin')
        .map((role) => role.role.code);

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: user.display_name,
        status: user.status,
        roles: adminRoles,
        lastLoginAt: user.sessions[0]?.created_at ?? null,
      };
    });
  }

  async getAdminRoles(userId: string): Promise<string[] | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      return null;
    }

    return user.roles
      .filter((role) => role.role.scope === 'admin')
      .map((role) => role.role.code);
  }

  async countAdminUsersByRole(roleCode: string): Promise<number> {
    return this.prisma.userRole.count({
      where: {
        role_code: roleCode,
        role: {
          scope: 'admin',
        },
      },
    });
  }

  async isAdminRole(roleCode: string): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { code: roleCode },
    });
    return Boolean(role && role.scope === 'admin');
  }

  async setAdminRole(userId: string, roleCode: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({
        where: {
          user_id: userId,
          role: {
            scope: 'admin',
          },
        },
      });

      await tx.userRole.create({
        data: {
          user_id: userId,
          role_code: roleCode,
        },
      });
    });
  }

  async setUserStatus(userId: string, status: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: status as UserStatus,
      },
    });
  }

  async markUserDeleted(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.deleted,
        deleted_at: new Date(),
      },
    });
  }
}
