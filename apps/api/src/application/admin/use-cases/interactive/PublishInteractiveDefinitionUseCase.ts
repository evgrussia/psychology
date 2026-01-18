import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { QuizConfig, NavigatorConfig, BoundariesConfig, RitualConfig } from '@domain/interactive/types/InteractiveConfig';
import { ValidateNavigatorDefinitionUseCase } from '../../../interactive/use-cases/ValidateNavigatorDefinitionUseCase';
import { AuditLogHelper } from '../../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../../audit/dto/audit-log.dto';

@Injectable()
export class PublishInteractiveDefinitionUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
    private readonly validateNavigatorUseCase: ValidateNavigatorDefinitionUseCase,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(id: string, actor?: { userId: string; role: string; ipAddress?: string | null; userAgent?: string | null }): Promise<void> {
    const definition = await this.definitionRepository.findById(id);

    if (!definition) {
      throw new NotFoundException(`Interactive definition with ID ${id} not found`);
    }

    // Validate quiz config before publishing
    const configToPublish = definition.config;
    if (!configToPublish) {
      throw new BadRequestException('Interactive definition has no draft config to publish');
    }

    if (definition.type === InteractiveType.QUIZ) {
      this.validateQuizConfig(configToPublish as QuizConfig);
    }

    // Validate navigator config before publishing
    if (definition.type === InteractiveType.NAVIGATOR) {
      await this.validateNavigatorConfig(configToPublish as NavigatorConfig);
    }

    if (definition.type === InteractiveType.BOUNDARIES) {
      this.validateBoundariesConfig(configToPublish as BoundariesConfig);
    }

    if (definition.type === InteractiveType.RITUAL) {
      this.validateRitualConfig(configToPublish as RitualConfig);
    }

    await this.definitionRepository.publishDraft(definition.id, configToPublish, actor?.userId ?? null);

    if (actor) {
      await this.auditLogHelper.logAction(
        actor.userId,
        actor.role,
        AuditLogAction.ADMIN_INTERACTIVE_PUBLISHED,
        'interactive_definition',
        definition.id,
        { status: definition.status },
        { status: InteractiveStatus.PUBLISHED },
        actor.ipAddress ?? null,
        actor.userAgent ?? null,
      );
    }
  }

  private validateQuizConfig(config: QuizConfig) {
    if (!config.questions || config.questions.length === 0) {
      throw new BadRequestException('Quiz must have at least one question before publishing');
    }

    if (!config.thresholds || config.thresholds.length === 0) {
      throw new BadRequestException('Quiz must have thresholds defined before publishing');
    }

    if (!config.results || config.results.length === 0) {
      throw new BadRequestException('Quiz must have results defined before publishing');
    }

    // Check for threshold overlaps
    const sortedThresholds = [...config.thresholds].sort((a, b) => a.minScore - b.minScore);
    for (let i = 0; i < sortedThresholds.length - 1; i++) {
      if (sortedThresholds[i].maxScore >= sortedThresholds[i + 1].minScore) {
        throw new BadRequestException(`Cannot publish: threshold overlap detected between ${sortedThresholds[i].level} and ${sortedThresholds[i + 1].level}`);
      }
    }
  }

  private async validateNavigatorConfig(config: NavigatorConfig): Promise<void> {
    const validationResult = await this.validateNavigatorUseCase.execute(config);
    if (!validationResult.isValid) {
      throw new BadRequestException(`Cannot publish navigator: ${validationResult.errors.join(', ')}`);
    }
  }

  private validateBoundariesConfig(config: BoundariesConfig) {
    if (!config.scenarios?.length) {
      throw new BadRequestException('Boundaries config must include at least one scenario before publishing');
    }
    if (!config.tones?.length) {
      throw new BadRequestException('Boundaries config must include at least one tone before publishing');
    }
    if (!config.goals?.length) {
      throw new BadRequestException('Boundaries config must include at least one goal before publishing');
    }
    if (!config.matrix?.length) {
      throw new BadRequestException('Boundaries config must include matrix items before publishing');
    }
    if (!config.safety_block?.text?.trim()) {
      throw new BadRequestException('Boundaries config must include safety block text before publishing');
    }

    const scenarioIds = new Set(config.scenarios.map((scenario) => scenario.id));
    const toneIds = new Set(config.tones.map((tone) => tone.id));
    const goalIds = new Set(config.goals.map((goal) => goal.id));
    const variantIds = new Set<string>();

    for (const item of config.matrix) {
      if (!scenarioIds.has(item.scenario_id)) {
        throw new BadRequestException(`Matrix references unknown scenario_id: ${item.scenario_id}`);
      }
      if (!toneIds.has(item.tone_id)) {
        throw new BadRequestException(`Matrix references unknown tone_id: ${item.tone_id}`);
      }
      if (!goalIds.has(item.goal_id)) {
        throw new BadRequestException(`Matrix references unknown goal_id: ${item.goal_id}`);
      }
      if (!item.variants?.length) {
        throw new BadRequestException('Each matrix item must include at least one variant');
      }
      for (const variant of item.variants) {
        if (!variant.variant_id?.trim()) {
          throw new BadRequestException('Each boundary script variant must have a variant_id');
        }
        if (!variant.text?.trim()) {
          throw new BadRequestException('Each boundary script variant must have text');
        }
        if (variantIds.has(variant.variant_id)) {
          throw new BadRequestException(`Duplicate variant_id detected: ${variant.variant_id}`);
        }
        variantIds.add(variant.variant_id);
      }
    }
  }

  private validateRitualConfig(config: RitualConfig) {
    if (!config.why?.trim()) {
      throw new BadRequestException('Ritual config must include "why" text before publishing');
    }
    if (!config.steps?.length) {
      throw new BadRequestException('Ritual config must include at least one step before publishing');
    }
    for (const step of config.steps) {
      if (!step.id?.trim()) {
        throw new BadRequestException('Each ritual step must have an id');
      }
      if (!step.title?.trim()) {
        throw new BadRequestException('Each ritual step must have a title');
      }
      if (!step.content?.trim()) {
        throw new BadRequestException('Each ritual step must have content');
      }
    }
  }
}
