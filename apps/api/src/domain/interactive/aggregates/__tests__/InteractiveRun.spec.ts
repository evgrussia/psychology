import { InteractiveRun } from '../InteractiveRun';
import { ResultLevel } from '../../value-objects/ResultLevel';

describe('InteractiveRun', () => {
  const definitionId = 'test-definition-id';
  const runId = 'test-run-id';

  it('should be created in progress state', () => {
    const run = InteractiveRun.create({
      id: runId,
      interactiveDefinitionId: definitionId,
      anonymousId: 'anon-123',
    });

    expect(run.id).toBe(runId);
    expect(run.interactiveDefinitionId).toBe(definitionId);
    expect(run.completedAt).toBeNull();
    expect(run.resultLevel).toBeNull();
    expect(run.durationMs).toBeNull();
    expect(run.crisisTriggered).toBe(false);
  });

  it('should be completed correctly', () => {
    const run = InteractiveRun.create({
      id: runId,
      interactiveDefinitionId: definitionId,
    });

    run.complete({
      resultLevel: ResultLevel.HIGH,
      durationMs: 120000,
      crisisTriggered: true,
      crisisTriggerType: 'high_anxiety',
    });

    expect(run.completedAt).toBeInstanceOf(Date);
    expect(run.resultLevel).toBe(ResultLevel.HIGH);
    expect(run.durationMs).toBe(120000);
    expect(run.crisisTriggered).toBe(true);
    expect(run.crisisTriggerType).toBe('high_anxiety');
  });

  it('should be idempotent on completion', () => {
    const run = InteractiveRun.create({
      id: runId,
      interactiveDefinitionId: definitionId,
    });

    run.complete({
      resultLevel: ResultLevel.LOW,
      durationMs: 60000,
    });

    const firstCompletedAt = run.completedAt;

    // Second completion should do nothing
    run.complete({
      resultLevel: ResultLevel.HIGH,
      durationMs: 120000,
    });

    expect(run.completedAt).toBe(firstCompletedAt);
    expect(run.resultLevel).toBe(ResultLevel.LOW);
    expect(run.durationMs).toBe(60000);
  });
});
