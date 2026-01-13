import { Session as PrismaSession } from '@prisma/client';
import { Session } from '@domain/identity/aggregates/Session';

export class SessionMapper {
  static toDomain(prismaSession: PrismaSession): Session {
    return Session.reconstitute({
      id: prismaSession.id,
      userId: prismaSession.user_id,
      userAgent: prismaSession.user_agent,
      ipAddress: prismaSession.ip_address,
      expiresAt: prismaSession.expires_at,
      createdAt: prismaSession.created_at,
      revokedAt: prismaSession.revoked_at,
    });
  }

  static toPersistence(session: Session) {
    return {
      id: session.id,
      user_id: session.userId,
      user_agent: session.userAgent,
      ip_address: session.ipAddress,
      expires_at: session.expiresAt,
      created_at: session.createdAt,
      revoked_at: session.revokedAt,
    };
  }
}
