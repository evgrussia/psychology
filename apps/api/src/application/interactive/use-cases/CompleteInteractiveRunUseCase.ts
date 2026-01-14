import { IInteractiveRunRepository } from '@domain/interactive/repositories/IInteractiveRunRepository';
import { ResultLevel } from '@domain/interactive/value-objects/ResultLevel';
import { Injectable, Inject, NotFoundException } from '@nestjs/common';

@Injectable()
export class CompleteInteractiveRunUseCase {
  constructor(
    @Inject('IInteractiveRunRepository')
    private readonly runRepository: IInteractiveRunRepository,
  ) {}

  async execute(params: {
    runId: string;
    resultLevel?: ResultLevel | null;
    resultProfile?: string | null;
    durationMs: number;
    crisisTriggered?: boolean;
    crisisTriggerType?: string | null;
  }): Promise<void> {
    const run = await this.runRepository.findById(params.runId);

    if (!run) {
      throw new NotFoundException(`Interactive run with ID ${params.runId} not found`);
    }

    run.complete({
      resultLevel: params.resultLevel,
      resultProfile: params.resultProfile,
      durationMs: params.durationMs,
      crisisTriggered: params.crisisTriggered,
      crisisTriggerType: params.crisisTriggerType,
    });

    await this.runRepository.save(run);
  }
}
