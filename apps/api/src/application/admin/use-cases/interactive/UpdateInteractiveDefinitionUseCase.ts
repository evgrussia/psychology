import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveConfig, QuizConfig, NavigatorConfig } from '@domain/interactive/types/InteractiveConfig';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { ValidateNavigatorDefinitionUseCase } from '../../../interactive/use-cases/ValidateNavigatorDefinitionUseCase';

@Injectable()
export class UpdateInteractiveDefinitionUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
    private readonly validateNavigatorUseCase: ValidateNavigatorDefinitionUseCase,
  ) {}

  async execute(id: string, data: {
    title?: string;
    topicCode?: string | null;
    status?: InteractiveStatus;
    config?: InteractiveConfig;
  }): Promise<void> {
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
}
