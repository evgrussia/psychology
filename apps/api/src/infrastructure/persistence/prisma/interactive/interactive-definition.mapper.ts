import { InteractiveDefinition as PrismaInteractiveDefinition, InteractiveType as PrismaInteractiveType, InteractiveStatus as PrismaInteractiveStatus } from '@prisma/client';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { InteractiveConfig } from '@domain/interactive/types/InteractiveConfig';

export class InteractiveDefinitionMapper {
  static toDomain(
    prismaDef: PrismaInteractiveDefinition,
    mode: 'draft' | 'published' = 'draft',
  ): InteractiveDefinition {
    const configSource = mode === 'published'
      ? (prismaDef.published_json ?? prismaDef.definition_json ?? prismaDef.draft_json)
      : (prismaDef.draft_json ?? prismaDef.definition_json ?? prismaDef.published_json);

    return InteractiveDefinition.reconstitute({
      id: prismaDef.id,
      type: prismaDef.interactive_type as unknown as InteractiveType,
      slug: prismaDef.slug,
      title: prismaDef.title,
      topicCode: prismaDef.topic_code,
      status: prismaDef.status as unknown as InteractiveStatus,
      config: configSource as unknown as InteractiveConfig,
      publishedAt: prismaDef.published_at,
    });
  }
}
