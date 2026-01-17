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
      await this.validateNavigatorConfig(data.config as NavigatorConfig, definition.config as NavigatorConfig);
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

    await this.definitionRepository.save(updatedDefinition);

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

  private async validateNavigatorConfig(newConfig: NavigatorConfig, existingConfig: NavigatorConfig): Promise<void> {
    // Validate structure (graph integrity)
    const validationResult = await this.validateNavigatorUseCase.execute(newConfig);
    if (!validationResult.isValid) {
      throw new BadRequestException(`Navigator validation failed: ${validationResult.errors.join(', ')}`);
    }

    // In Release 1, structure (step_ids, choice_ids, next_step_ids, result_profile_ids) cannot be changed
    // Only texts (question_text, choice.text, result_profile titles/descriptions) can be edited
    if (existingConfig) {
      // Check that step structure is unchanged
      if (newConfig.initial_step_id !== existingConfig.initial_step_id) {
        throw new BadRequestException('Cannot change initial_step_id in Release 1. Structure editing is not allowed.');
      }

      // Check that step IDs are unchanged
      const existingStepIds = new Set(existingConfig.steps.map(s => s.step_id));
      const newStepIds = new Set(newConfig.steps.map(s => s.step_id));
      if (existingStepIds.size !== newStepIds.size || 
          [...existingStepIds].some(id => !newStepIds.has(id))) {
        throw new BadRequestException('Cannot add or remove steps in Release 1. Structure editing is not allowed.');
      }

      // Check that choice structure is unchanged (choice_ids and next_step_ids/result_profile_ids)
      for (const existingStep of existingConfig.steps) {
        const newStep = newConfig.steps.find(s => s.step_id === existingStep.step_id);
        if (!newStep) continue;

        const existingChoiceIds = new Set(existingStep.choices.map(c => c.choice_id));
        const newChoiceIds = new Set(newStep.choices.map(c => c.choice_id));
        if (existingChoiceIds.size !== newChoiceIds.size ||
            [...existingChoiceIds].some(id => !newChoiceIds.has(id))) {
          throw new BadRequestException(`Cannot add or remove choices in step ${existingStep.step_id} in Release 1. Structure editing is not allowed.`);
        }

        // Check that next_step_id and result_profile_id are unchanged
        for (const existingChoice of existingStep.choices) {
          const newChoice = newStep.choices.find(c => c.choice_id === existingChoice.choice_id);
          if (!newChoice) continue;

          if (existingChoice.next_step_id !== newChoice.next_step_id ||
              existingChoice.result_profile_id !== newChoice.result_profile_id) {
            throw new BadRequestException(`Cannot change navigation structure (next_step_id/result_profile_id) in Release 1. Only texts can be edited.`);
          }
        }
      }

      // Check that result profile IDs are unchanged
      const existingProfileIds = new Set(existingConfig.result_profiles.map(rp => rp.id));
      const newProfileIds = new Set(newConfig.result_profiles.map(rp => rp.id));
      if (existingProfileIds.size !== newProfileIds.size ||
          [...existingProfileIds].some(id => !newProfileIds.has(id))) {
        throw new BadRequestException('Cannot add or remove result profiles in Release 1. Structure editing is not allowed.');
      }
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
