import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveConfig, QuizConfig, NavigatorConfig, BoundariesConfig, RitualConfig } from '@domain/interactive/types/InteractiveConfig';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { ValidateNavigatorDefinitionUseCase } from '../../../interactive/use-cases/ValidateNavigatorDefinitionUseCase';
import { AuditLogHelper } from '../../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../../audit/dto/audit-log.dto';

@Injectable()
export class UpdateInteractiveDefinitionUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
    private readonly validateNavigatorUseCase: ValidateNavigatorDefinitionUseCase,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(id: string, data: {
    title?: string;
    topicCode?: string | null;
    status?: InteractiveStatus;
    config?: InteractiveConfig;
  }, actor?: { userId: string; role: string; ipAddress?: string | null; userAgent?: string | null }): Promise<void> {
    const definition = await this.definitionRepository.findById(id);

    if (!definition) {
      throw new NotFoundException(`Interactive definition with ID ${id} not found`);
    }

    // Validation for Quiz
    if (definition.type === InteractiveType.QUIZ && data.config) {
      this.validateQuizConfig(data.config as QuizConfig);
    }

    // Validation for Navigator (only texts can be updated, structure is fixed in Release 1)
    if (definition.type === InteractiveType.NAVIGATOR && data.config) {
      await this.validateNavigatorConfig(data.config as NavigatorConfig);
    }

    // Validation for Boundaries scripts
    if (definition.type === InteractiveType.BOUNDARIES && data.config) {
      this.validateBoundariesConfig(data.config as BoundariesConfig);
    }

    // Validation for Rituals
    if (definition.type === InteractiveType.RITUAL && data.config) {
      this.validateRitualConfig(data.config as RitualConfig);
    }

    const updatedDefinition = InteractiveDefinition.reconstitute({
      id: definition.id,
      type: definition.type,
      slug: definition.slug,
      title: data.title ?? definition.title,
      topicCode: data.topicCode !== undefined ? data.topicCode : definition.topicCode,
      status: data.status ?? definition.status,
      config: data.config ?? definition.config,
      publishedAt: data.status === InteractiveStatus.PUBLISHED ? new Date() : definition.publishedAt,
    });

    await this.definitionRepository.saveDraft(updatedDefinition);

    if (actor) {
      const oldSnapshot = this.buildAuditSnapshot(definition);
      const newSnapshot = this.buildAuditSnapshot(updatedDefinition);
      await this.auditLogHelper.logAction(
        actor.userId,
        actor.role,
        AuditLogAction.ADMIN_INTERACTIVE_UPDATED,
        'interactive_definition',
        definition.id,
        oldSnapshot,
        newSnapshot,
        actor.ipAddress ?? null,
        actor.userAgent ?? null,
      );
    }
  }

  private validateQuizConfig(config: QuizConfig) {
    if (!config.questions || config.questions.length === 0) {
      throw new BadRequestException('Quiz must have at least one question');
    }

    if (!config.thresholds || config.thresholds.length === 0) {
      throw new BadRequestException('Quiz must have thresholds defined');
    }

    if (!config.results || config.results.length === 0) {
      throw new BadRequestException('Quiz must have results defined');
    }

    // Check for threshold overlaps or gaps
    const sortedThresholds = [...config.thresholds].sort((a, b) => a.minScore - b.minScore);
    for (let i = 0; i < sortedThresholds.length - 1; i++) {
      if (sortedThresholds[i].maxScore >= sortedThresholds[i + 1].minScore) {
        throw new BadRequestException(`Threshold overlap detected between ${sortedThresholds[i].level} and ${sortedThresholds[i + 1].level}`);
      }
      if (sortedThresholds[i].maxScore < sortedThresholds[i + 1].minScore - 1) {
        // We allow 1 unit gap if scores are integers, but better to be strict or explicit
        // For simplicity, let's just warn or allow it for now.
      }
    }
  }

  private async validateNavigatorConfig(newConfig: NavigatorConfig): Promise<void> {
    const validationResult = await this.validateNavigatorUseCase.execute(newConfig);
    if (!validationResult.isValid) {
      throw new BadRequestException(`Navigator validation failed: ${validationResult.errors.join(', ')}`);
    }
  }

  private validateBoundariesConfig(config: BoundariesConfig) {
    if (!config.scenarios?.length) {
      throw new BadRequestException('Boundaries config must include at least one scenario');
    }
    if (!config.tones?.length) {
      throw new BadRequestException('Boundaries config must include at least one tone');
    }
    if (!config.goals?.length) {
      throw new BadRequestException('Boundaries config must include at least one goal');
    }
    if (!config.matrix?.length) {
      throw new BadRequestException('Boundaries config must include matrix items');
    }
    if (!config.safety_block?.text?.trim()) {
      throw new BadRequestException('Boundaries config must include safety block text');
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
      throw new BadRequestException('Ritual config must include "why" text');
    }
    if (!config.steps?.length) {
      throw new BadRequestException('Ritual config must include at least one step');
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

  private buildAuditSnapshot(definition: InteractiveDefinition): Record<string, any> {
    const base = {
      id: definition.id,
      type: definition.type,
      slug: definition.slug,
      title: definition.title,
      topicCode: definition.topicCode,
      status: definition.status,
    };

    if (!definition.config) {
      return base;
    }

    const config = definition.config as InteractiveConfig;
    if ('questions' in config && 'thresholds' in config) {
      const quizConfig = config as QuizConfig;
      return {
        ...base,
        config_summary: {
          question_count: quizConfig.questions.length,
          threshold_count: quizConfig.thresholds.length,
          result_count: quizConfig.results.length,
          thresholds: quizConfig.thresholds.map((threshold) => ({
            level: threshold.level,
            minScore: threshold.minScore,
            maxScore: threshold.maxScore,
          })),
          crisis_trigger: quizConfig.crisisTrigger ?? null,
        },
      };
    }

    if ('steps' in config && 'result_profiles' in config) {
      const navigatorConfig = config as NavigatorConfig;
      return {
        ...base,
        config_summary: {
          step_count: navigatorConfig.steps.length,
          result_profile_count: navigatorConfig.result_profiles.length,
        },
      };
    }

    if ('matrix' in config && 'scenarios' in config) {
      const boundariesConfig = config as BoundariesConfig;
      return {
        ...base,
        config_summary: {
          scenario_count: boundariesConfig.scenarios.length,
          tone_count: boundariesConfig.tones.length,
          goal_count: boundariesConfig.goals.length,
          matrix_count: boundariesConfig.matrix.length,
          variant_count: boundariesConfig.matrix.reduce((acc, item) => acc + item.variants.length, 0),
        },
      };
    }

    if ('steps' in config && 'why' in config) {
      const ritualConfig = config as RitualConfig;
      return {
        ...base,
        config_summary: {
          step_count: ritualConfig.steps.length,
          total_duration_seconds: ritualConfig.totalDurationSeconds ?? null,
          has_audio: Boolean(ritualConfig.audioMediaAssetId),
        },
      };
    }

    return base;
  }
}
