import { InteractiveDefinition } from '../entities/InteractiveDefinition';
import { InteractiveDefinitionVersion } from '../entities/InteractiveDefinitionVersion';
import { InteractiveConfig } from '../types/InteractiveConfig';
import { InteractiveType } from '../value-objects/InteractiveType';
import { InteractiveStatus } from '../value-objects/InteractiveStatus';

export interface IInteractiveDefinitionRepository {
  findById(
    id: string,
    options?: { includeDraft?: boolean; includePublished?: boolean },
  ): Promise<InteractiveDefinition | null>;
  findPublished(): Promise<InteractiveDefinition[]>;
  findByTopic(topicCode: string): Promise<InteractiveDefinition[]>;
  findByTypeAndSlug(type: InteractiveType, slug: string): Promise<InteractiveDefinition | null>;
  findAnyByTypeAndSlug(type: InteractiveType, slug: string): Promise<InteractiveDefinition | null>;
  findAll(filters?: { type?: InteractiveType; status?: InteractiveStatus }): Promise<InteractiveDefinition[]>;
  create(definition: InteractiveDefinition): Promise<void>;
  saveDraft(definition: InteractiveDefinition): Promise<void>;
  publishDraft(definitionId: string, config: InteractiveConfig, actorUserId?: string | null): Promise<number>;
  listVersions(definitionId: string): Promise<InteractiveDefinitionVersion[]>;
  getVersion(definitionId: string, version: number): Promise<InteractiveDefinitionVersion | null>;
}
