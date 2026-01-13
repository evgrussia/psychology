import { InteractiveRun } from '../aggregates/InteractiveRun';

export interface IInteractiveRunRepository {
  save(run: InteractiveRun): Promise<void>;
  findById(id: string): Promise<InteractiveRun | null>;
}
