import { ValidateNavigatorDefinitionUseCase } from './ValidateNavigatorDefinitionUseCase';
import { NavigatorConfig } from '@domain/interactive/types/InteractiveConfig';

describe('ValidateNavigatorDefinitionUseCase', () => {
  let useCase: ValidateNavigatorDefinitionUseCase;

  beforeEach(() => {
    useCase = new ValidateNavigatorDefinitionUseCase();
  });

  const validConfig: NavigatorConfig = {
    initial_step_id: 'step_1',
    steps: [
      {
        step_id: 'step_1',
        question_text: 'Q1',
        choices: [
          { choice_id: 'c1', text: 'To step 2', next_step_id: 'step_2' },
          { choice_id: 'c2', text: 'To result', next_step_id: null, result_profile_id: 'res_1' },
        ],
      },
      {
        step_id: 'step_2',
        question_text: 'Q2',
        choices: [
          { choice_id: 'c3', text: 'Back to 1', next_step_id: 'step_1' }, // Cycle for test
        ],
      },
    ],
    result_profiles: [
      { id: 'res_1', title: 'R1', description: 'D1', recommendations: {} },
    ],
  };

  it('should validate a valid config without cycles', async () => {
    const config: NavigatorConfig = {
      ...validConfig,
      steps: [
        {
          step_id: 'step_1',
          question_text: 'Q1',
          choices: [
            { choice_id: 'c1', text: 'To result', next_step_id: null, result_profile_id: 'res_1' },
          ],
        },
      ],
    };
    const result = await useCase.execute(config);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail if initial_step_id is missing', async () => {
    const config: NavigatorConfig = {
      ...validConfig,
      initial_step_id: 'non_existent',
    };
    const result = await useCase.execute(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Initial step ID "non_existent" not found in steps');
  });

  it('should fail if choice leads to non-existent step', async () => {
    const config: NavigatorConfig = {
      ...validConfig,
      steps: [
        {
          step_id: 'step_1',
          question_text: 'Q1',
          choices: [
            { choice_id: 'c1', text: 'Broken', next_step_id: 'missing' },
          ],
        },
      ],
    };
    const result = await useCase.execute(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Step "step_1", choice "c1" leads to non-existent next_step_id "missing"');
  });

  it('should fail if choice leads to non-existent result profile', async () => {
    const config: NavigatorConfig = {
      ...validConfig,
      steps: [
        {
          step_id: 'step_1',
          question_text: 'Q1',
          choices: [
            { choice_id: 'c1', text: 'Broken', next_step_id: null, result_profile_id: 'missing' },
          ],
        },
      ],
    };
    const result = await useCase.execute(config);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Step "step_1", choice "c1" leads to non-existent result_profile_id "missing"');
  });

  it('should detect cycles', async () => {
    const result = await useCase.execute(validConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Navigator structure contains cycles');
  });

  it('should detect unreachable steps', async () => {
    const config: NavigatorConfig = {
      ...validConfig,
      steps: [
        ...validConfig.steps,
        {
          step_id: 'unreachable',
          question_text: 'Q3',
          choices: [{ choice_id: 'c4', text: 'X', next_step_id: 'step_1' }],
        },
      ],
    };
    // Fix step_2 to not have cycle for this test
    config.steps[1].choices = [{ choice_id: 'c3', text: 'To res', next_step_id: null, result_profile_id: 'res_1' }];
    
    const result = await useCase.execute(config);
    expect(result.errors).toContain('Step "unreachable" is not reachable from the initial step');
  });
});
