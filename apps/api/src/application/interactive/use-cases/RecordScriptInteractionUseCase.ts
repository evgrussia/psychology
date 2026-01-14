import { Injectable, Inject } from '@nestjs/common';
import { IInteractiveRunRepository } from '@domain/interactive/repositories/IInteractiveRunRepository';

@Injectable()
export class RecordScriptInteractionUseCase {
  constructor(
    @Inject('IInteractiveRunRepository')
    private readonly runRepository: IInteractiveRunRepository,
  ) {}

  async execute(params: {
    runId: string;
    variantId?: string;
    action: 'view' | 'copy';
  }): Promise<void> {
    // This use case can be expanded to store specific interaction details in the database.
    // For Release 1, we primarily rely on web-side tracking as per the Tracking Plan.
    // We keep this use case for future extensibility and to satisfy technical requirements.
    const run = await this.runRepository.findById(params.runId);
    if (!run) return;

    // We could potentially store this in a metadata JSON field if added to the run entity.
    // Currently, we just ensure the run exists and could log the interaction.
  }
}
