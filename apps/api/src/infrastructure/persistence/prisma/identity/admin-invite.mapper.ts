import { AdminInvite as PrismaAdminInvite } from '@prisma/client';
import { AdminInvite } from '../../../../domain/identity/aggregates/AdminInvite';

export class AdminInviteMapper {
  static toDomain(prismaInvite: PrismaAdminInvite): AdminInvite {
    return AdminInvite.reconstitute({
      id: prismaInvite.id,
      email: prismaInvite.email,
      roleCode: prismaInvite.role_code,
      token: prismaInvite.token,
      expiresAt: prismaInvite.expires_at,
      createdAt: prismaInvite.created_at,
      usedAt: prismaInvite.used_at,
    });
  }

  static toPersistence(invite: AdminInvite) {
    return {
      id: invite.id,
      email: invite.email,
      role_code: invite.roleCode,
      token: invite.token,
      expires_at: invite.expiresAt,
      created_at: invite.createdAt,
      used_at: invite.usedAt,
    };
  }
}
