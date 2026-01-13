import { IInteractiveRunRepository } from '../../../domain/interactive/repositories/IInteractiveRunRepository';
import { IInteractiveDefinitionRepository } from '../../../domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveRun } from '../../../domain/interactive/aggregates/InteractiveRun';
import { InteractiveType } from '../../../domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '../../../domain/interactive/value-objects/InteractiveStatus';
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class StartInteractiveRunUseCase {
  constructor(
    @Inject('IInteractiveRunRepository')
    private readonly runRepository: IInteractiveRunRepository,
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(params: {
    interactive_type: InteractiveType;
    interactive_slug: string;
    topic?: string | null;
    entry_point?: string | null;
    userId?: string | null;
    anonymousId?: string | null;
    deepLinkId?: string | null;
  }): Promise<{ runId: string }> {
    // Lookup interactive definition by type and slug
    const definition = await this.definitionRepository.findByTypeAndSlug(
      params.interactive_type,
      params.interactive_slug,
    );

    if (!definition) {
      throw new NotFoundException(
        `Interactive definition not found: ${params.interactive_type}/${params.interactive_slug}`,
      );
    }

    // Note: Definition is already filtered to published in repository
    // But we keep this check for extra safety
    if (definition.status !== InteractiveStatus.PUBLISHED) {
      throw new BadRequestException('Interactive is not published');
    }

    const runId = randomUUID();
    const run = InteractiveRun.create({
      id: runId,
      interactiveDefinitionId: definition.id,
      userId: params.userId,
      anonymousId: params.anonymousId,
      deepLinkId: params.deepLinkId,
    });

    await this.runRepository.save(run);

    return { runId };
  }
}
