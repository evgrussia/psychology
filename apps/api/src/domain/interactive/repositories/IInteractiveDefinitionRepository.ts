import { InteractiveDefinition } from '../entities/InteractiveDefinition';
import { InteractiveType } from '../value-objects/InteractiveType';

export interface IInteractiveDefinitionRepository {
  findPublished(): Promise<InteractiveDefinition[]>;
  findByTopic(topicCode: string): Promise<InteractiveDefinition[]>;
  findByTypeAndSlug(type: InteractiveType, slug: string): Promise<InteractiveDefinition | null>;
}
