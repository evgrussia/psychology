import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IWaitlistRequestRepository } from '@domain/booking/repositories/IWaitlistRequestRepository';
import { WaitlistRequest } from '@domain/booking/entities/WaitlistRequest';
import { WaitlistRequestMapper } from './waitlist-request.mapper';

@Injectable()
export class PrismaWaitlistRequestRepository implements IWaitlistRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(request: WaitlistRequest): Promise<void> {
    const data = WaitlistRequestMapper.toPersistence(request);
    await this.prisma.waitlistRequest.create({ data });
  }

  async findById(id: string): Promise<WaitlistRequest | null> {
    const record = await this.prisma.waitlistRequest.findUnique({ where: { id } });
    if (!record) return null;
    return WaitlistRequestMapper.toDomain(record);
  }
}
