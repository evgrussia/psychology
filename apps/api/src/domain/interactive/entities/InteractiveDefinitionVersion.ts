import { InteractiveConfig } from '../types/InteractiveConfig';

export class InteractiveDefinitionVersion {
  constructor(
    public readonly id: string,
    public readonly interactiveDefinitionId: string,
    public readonly version: number,
    public readonly config: InteractiveConfig,
    public readonly createdAt: Date,
    public readonly createdByUserId: string | null,
  ) {}

  static reconstitute(params: {
    id: string;
    interactiveDefinitionId: string;
    version: number;
    config: InteractiveConfig;
    createdAt: Date;
    createdByUserId: string | null;
  }): InteractiveDefinitionVersion {
    return new InteractiveDefinitionVersion(
      params.id,
      params.interactiveDefinitionId,
      params.version,
      params.config,
      params.createdAt,
      params.createdByUserId,
    );
  }
}
