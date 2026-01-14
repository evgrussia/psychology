import { RitualConfig } from '@domain/interactive/types/InteractiveConfig';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';

export class RitualDto {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: InteractiveStatus;
  config: RitualConfig | null;
  publishedAt: Date | null;
}

export class ListRitualsResponse {
  items: RitualDto[];
  total: number;
}
