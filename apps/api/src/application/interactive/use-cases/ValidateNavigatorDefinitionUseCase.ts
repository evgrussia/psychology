import { NavigatorConfig } from '@domain/interactive/types/InteractiveConfig';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidateNavigatorDefinitionUseCase {
  async execute(config: NavigatorConfig): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const steps = config.steps;
    const stepIds = new Set(steps.map((s) => s.step_id));
    const resultProfileIds = new Set(config.result_profiles.map((rp) => rp.id));

    // 1. Check if initial_step_id exists
    if (!stepIds.has(config.initial_step_id)) {
      errors.push(`Initial step ID "${config.initial_step_id}" not found in steps`);
    }

    // 2. Check all choices
    for (const step of steps) {
      if (step.choices.length === 0) {
        errors.push(`Step "${step.step_id}" has no choices`);
      }

      for (const choice of step.choices) {
        if (choice.next_step_id) {
          if (!stepIds.has(choice.next_step_id)) {
            errors.push(
              `Step "${step.step_id}", choice "${choice.choice_id}" leads to non-existent next_step_id "${choice.next_step_id}"`,
            );
          }
        } else if (choice.result_profile_id) {
          if (!resultProfileIds.has(choice.result_profile_id)) {
            errors.push(
              `Step "${step.step_id}", choice "${choice.choice_id}" leads to non-existent result_profile_id "${choice.result_profile_id}"`,
            );
          }
        } else {
          errors.push(
            `Step "${step.step_id}", choice "${choice.choice_id}" must have either next_step_id or result_profile_id`,
          );
        }
      }
    }

    // 3. Check for cycles and reachability (DFS)
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      visited.add(stepId);
      recStack.add(stepId);

      const step = steps.find((s) => s.step_id === stepId);
      if (step) {
        for (const choice of step.choices) {
          if (choice.next_step_id) {
            if (!visited.has(choice.next_step_id)) {
              if (hasCycle(choice.next_step_id)) return true;
            } else if (recStack.has(choice.next_step_id)) {
              return true;
            }
          }
        }
      }

      recStack.delete(stepId);
      return false;
    };

    if (stepIds.has(config.initial_step_id)) {
      if (hasCycle(config.initial_step_id)) {
        errors.push('Navigator structure contains cycles');
      }
    }

    // 4. Check if all result profiles are reachable (optional but good)
    // Actually, it's more important that all steps are reachable from the initial step
    const reachableSteps = new Set<string>();
    const queue = [config.initial_step_id];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (reachableSteps.has(currentId)) continue;
      reachableSteps.add(currentId);
      const step = steps.find((s) => s.step_id === currentId);
      if (step) {
        for (const choice of step.choices) {
          if (choice.next_step_id) {
            queue.push(choice.next_step_id);
          }
        }
      }
    }

    for (const stepId of stepIds) {
      if (!reachableSteps.has(stepId)) {
        // This is a warning, not necessarily an error that breaks the app
        // but for Release 1 let's keep it strict
        errors.push(`Step "${stepId}" is not reachable from the initial step`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
