import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { InteractiveDefinitionVersion } from '@domain/interactive/entities/InteractiveDefinitionVersion';
import { InteractiveConfig } from '@domain/interactive/types/InteractiveConfig';
import { InteractiveDefinitionMapper } from './interactive-definition.mapper';
import { InteractiveStatus, InteractiveType as PrismaInteractiveType } from '@prisma/client';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';

@Injectable()
export class PrismaInteractiveDefinitionRepository implements IInteractiveDefinitionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    options?: { includeDraft?: boolean; includePublished?: boolean },
  ): Promise<InteractiveDefinition | null> {
    const def = await this.prisma.interactiveDefinition.findUnique({
      where: { id },
    });

    if (!def) {
      return null;
    }

    const mode = options?.includeDraft === false || options?.includePublished ? 'published' : 'draft';
    return InteractiveDefinitionMapper.toDomain(def, mode);
  }

  async findPublished(): Promise<InteractiveDefinition[]> {
    const defs = await this.prisma.interactiveDefinition.findMany({
      where: { status: InteractiveStatus.published },
    });
    return defs.map((def) => InteractiveDefinitionMapper.toDomain(def, 'published'));
  }

  async findByTopic(topicCode: string): Promise<InteractiveDefinition[]> {
    const defs = await this.prisma.interactiveDefinition.findMany({
      where: { 
        topic_code: topicCode,
        status: InteractiveStatus.published 
      },
    });
    return defs.map((def) => InteractiveDefinitionMapper.toDomain(def, 'published'));
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

    return InteractiveDefinitionMapper.toDomain(def, 'published');
  }

  async findAll(filters?: { type?: InteractiveType; status?: InteractiveStatus }): Promise<InteractiveDefinition[]> {
    const where: any = {};
    if (filters?.type) {
      where.interactive_type = filters.type as unknown as PrismaInteractiveType;
    }
    if (filters?.status) {
      where.status = filters.status as unknown as InteractiveStatus;
    }
    const defs = await this.prisma.interactiveDefinition.findMany({ where });
    return defs.map((def) => InteractiveDefinitionMapper.toDomain(def, 'draft'));
  }

  async saveDraft(definition: InteractiveDefinition): Promise<void> {
    await this.prisma.interactiveDefinition.update({
      where: { id: definition.id },
      data: {
        title: definition.title,
        topic_code: definition.topicCode,
        status: definition.status as unknown as InteractiveStatus,
        draft_json: definition.config as any,
        draft_updated_at: new Date(),
      },
    });
  }

  async publishDraft(
    definitionId: string,
    config: InteractiveConfig,
    actorUserId?: string | null,
  ): Promise<number> {
    const latestVersion = await this.prisma.interactiveDefinitionVersion.findFirst({
      where: { interactive_definition_id: definitionId },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latestVersion?.version ?? 0) + 1;
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.interactiveDefinition.update({
        where: { id: definitionId },
        data: {
          status: InteractiveStatus.published,
          published_at: now,
          published_json: config as any,
          definition_json: config as any,
          published_version: nextVersion,
          draft_json: config as any,
          draft_updated_at: now,
        },
      }),
      this.prisma.interactiveDefinitionVersion.create({
        data: {
          interactive_definition_id: definitionId,
          version: nextVersion,
          config_json: config as any,
          created_by_user_id: actorUserId ?? null,
        },
      }),
    ]);

    return nextVersion;
  }

  async listVersions(definitionId: string): Promise<InteractiveDefinitionVersion[]> {
    const versions = await this.prisma.interactiveDefinitionVersion.findMany({
      where: { interactive_definition_id: definitionId },
      orderBy: { version: 'desc' },
    });
    return versions.map((version) => InteractiveDefinitionVersion.reconstitute({
      id: version.id,
      interactiveDefinitionId: version.interactive_definition_id,
      version: version.version,
      config: version.config_json as unknown as InteractiveConfig,
      createdAt: version.created_at,
      createdByUserId: version.created_by_user_id ?? null,
    }));
  }

  async getVersion(definitionId: string, versionNumber: number): Promise<InteractiveDefinitionVersion | null> {
    const version = await this.prisma.interactiveDefinitionVersion.findFirst({
      where: {
        interactive_definition_id: definitionId,
        version: versionNumber,
      },
    });
    if (!version) {
      return null;
    }
    return InteractiveDefinitionVersion.reconstitute({
      id: version.id,
      interactiveDefinitionId: version.interactive_definition_id,
      version: version.version,
      config: version.config_json as unknown as InteractiveConfig,
      createdAt: version.created_at,
      createdByUserId: version.created_by_user_id ?? null,
    });
  }
}
