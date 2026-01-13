import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../audit/dto/audit-log.dto';

export interface UpdateServicePriceDto {
  serviceId: string;
  newPrice: number;
}

@Injectable()
export class UpdateServicePriceUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(dto: UpdateServicePriceDto, actorUserId: string, actorRole: string): Promise<void> {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${dto.serviceId} not found`);
    }

    const oldPrice = service.price_amount;

    await this.prisma.service.update({
      where: { id: dto.serviceId },
      data: { price_amount: dto.newPrice },
    });

    // Log to audit log (CRITICAL for FEAT-PLT-05)
    try {
      await this.auditLogHelper.logAction(
        actorUserId,
        actorRole,
        AuditLogAction.ADMIN_PRICE_CHANGED,
        'Service',
        dto.serviceId,
        { price_amount: oldPrice },
        { price_amount: dto.newPrice }
      );
    } catch (error) {
      console.error('Failed to log price change to audit log:', error);
    }
  }
}
