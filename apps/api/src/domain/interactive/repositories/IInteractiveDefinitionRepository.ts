import { InteractiveDefinition } from '../entities/InteractiveDefinition';
import { InteractiveType } from '../value-objects/InteractiveType';
import { InteractiveStatus } from '../value-objects/InteractiveStatus';

export interface IInteractiveDefinitionRepository {
  findById(id: string): Promise<InteractiveDefinition | null>;
  findPublished(): Promise<InteractiveDefinition[]>;
  findByTopic(topicCode: string): Promise<InteractiveDefinition[]>;
  findByTypeAndSlug(type: InteractiveType, slug: string): Promise<InteractiveDefinition | null>;
  findAll(filters?: { type?: InteractiveType; status?: InteractiveStatus }): Promise<InteractiveDefinition[]>;
  save(definition: InteractiveDefinition): Promise<void>;
}
