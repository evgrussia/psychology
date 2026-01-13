import { InteractiveDefinition as PrismaInteractiveDefinition, InteractiveType as PrismaInteractiveType, InteractiveStatus as PrismaInteractiveStatus } from '@prisma/client';
import { InteractiveDefinition } from '../../../../../domain/interactive/entities/InteractiveDefinition';
import { InteractiveType } from '../../../../../domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '../../../../../domain/interactive/value-objects/InteractiveStatus';

export class InteractiveDefinitionMapper {
  static toDomain(prismaDef: PrismaInteractiveDefinition): InteractiveDefinition {
    return InteractiveDefinition.reconstitute({
      id: prismaDef.id,
      type: prismaDef.interactive_type as unknown as InteractiveType,
      slug: prismaDef.slug,
      title: prismaDef.title,
      topicCode: prismaDef.topic_code,
      status: prismaDef.status as unknown as InteractiveStatus,
      publishedAt: prismaDef.published_at,
    });
  }
}
