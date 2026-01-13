import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IInteractiveRunRepository } from '../../../../../domain/interactive/repositories/IInteractiveRunRepository';
import { InteractiveRun } from '../../../../../domain/interactive/aggregates/InteractiveRun';
import { InteractiveRunMapper } from './interactive-run.mapper';

@Injectable()
export class PrismaInteractiveRunRepository implements IInteractiveRunRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(run: InteractiveRun): Promise<void> {
    const data = InteractiveRunMapper.toPrisma(run);

    await this.prisma.interactiveRun.upsert({
      where: { id: run.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<InteractiveRun | null> {
    const prismaRun = await this.prisma.interactiveRun.findUnique({
      where: { id },
    });

    if (!prismaRun) {
      return null;
    }

    return InteractiveRunMapper.toDomain(prismaRun);
  }
}
