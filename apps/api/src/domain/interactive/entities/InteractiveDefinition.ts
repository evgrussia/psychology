import { InteractiveType } from '../value-objects/InteractiveType';
import { InteractiveStatus } from '../value-objects/InteractiveStatus';
import { InteractiveConfig } from '../types/InteractiveConfig';

export class InteractiveDefinition {
  constructor(
    public readonly id: string,
    public readonly type: InteractiveType,
    public readonly slug: string,
    public readonly title: string,
    public readonly topicCode: string | null,
    public readonly status: InteractiveStatus,
    public readonly config: InteractiveConfig | null,
    public readonly publishedAt: Date | null,
  ) {}

  static reconstitute(params: {
    id: string;
    type: InteractiveType;
    slug: string;
    title: string;
    topicCode: string | null;
    status: InteractiveStatus;
    config?: InteractiveConfig | null;
    publishedAt: Date | null;
  }): InteractiveDefinition {
    return new InteractiveDefinition(
      params.id,
      params.type,
      params.slug,
      params.title,
      params.topicCode,
      params.status,
      params.config ?? null,
      params.publishedAt,
    );
  }
}
