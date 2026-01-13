import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IInteractiveDefinitionRepository } from '../../../../../domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveDefinition } from '../../../../../domain/interactive/entities/InteractiveDefinition';
import { InteractiveDefinitionMapper } from './interactive-definition.mapper';
import { InteractiveStatus, InteractiveType as PrismaInteractiveType } from '@prisma/client';
import { InteractiveType } from '../../../../../domain/interactive/value-objects/InteractiveType';

@Injectable()
export class PrismaInteractiveDefinitionRepository implements IInteractiveDefinitionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(): Promise<InteractiveDefinition[]> {
    const defs = await this.prisma.interactiveDefinition.findMany({
      where: { status: InteractiveStatus.published },
    });
    return defs.map(InteractiveDefinitionMapper.toDomain);
  }

  async findByTopic(topicCode: string): Promise<InteractiveDefinition[]> {
    const defs = await this.prisma.interactiveDefinition.findMany({
      where: { 
        topic_code: topicCode,
        status: InteractiveStatus.published 
      },
    });
    return defs.map(InteractiveDefinitionMapper.toDomain);
  }

  async findByTypeAndSlug(type: InteractiveType, slug: string): Promise<InteractiveDefinition | null> {
    const def = await this.prisma.interactiveDefinition.findUnique({
      where: {
        interactive_type_slug: {
          interactive_type: type as unknown as PrismaInteractiveType,
          slug: slug,
        },
      },
    });

    if (!def || def.status !== InteractiveStatus.published) {
      return null;
    }

    return InteractiveDefinitionMapper.toDomain(def);
  }
}
