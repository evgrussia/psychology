import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ISessionRepository } from '@domain/identity/repositories/ISessionRepository';
import { Session } from '@domain/identity/aggregates/Session';
import { SessionMapper } from './session.mapper';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Session | null> {
    const prismaSession = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!prismaSession) return null;

    return SessionMapper.toDomain(prismaSession);
  }

  async save(session: Session): Promise<void> {
    const data = SessionMapper.toPersistence(session);

    await this.prisma.session.upsert({
      where: { id: session.id },
      update: data,
      create: data,
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });
  }
}
