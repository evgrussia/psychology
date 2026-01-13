import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IAdminInviteRepository } from '../../../../domain/identity/repositories/IAdminInviteRepository';
import { AdminInvite } from '../../../../domain/identity/aggregates/AdminInvite';
import { AdminInviteMapper } from './admin-invite.mapper';

@Injectable()
export class PrismaAdminInviteRepository implements IAdminInviteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AdminInvite | null> {
    const prismaInvite = await this.prisma.adminInvite.findUnique({
      where: { id },
    });

    if (!prismaInvite) return null;

    return AdminInviteMapper.toDomain(prismaInvite);
  }

  async findByToken(token: string): Promise<AdminInvite | null> {
    const prismaInvite = await this.prisma.adminInvite.findUnique({
      where: { token },
    });

    if (!prismaInvite) return null;

    return AdminInviteMapper.toDomain(prismaInvite);
  }

  async findByEmail(email: string): Promise<AdminInvite | null> {
    const prismaInvite = await this.prisma.adminInvite.findUnique({
      where: { email },
    });

    if (!prismaInvite) return null;

    return AdminInviteMapper.toDomain(prismaInvite);
  }

  async save(invite: AdminInvite): Promise<void> {
    const data = AdminInviteMapper.toPersistence(invite);

    await this.prisma.adminInvite.upsert({
      where: { id: invite.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.adminInvite.delete({
      where: { id },
    });
  }
}
