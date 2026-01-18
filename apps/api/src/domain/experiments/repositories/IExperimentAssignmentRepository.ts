export interface ExperimentAssignmentInput {
  experimentId: string;
  variant: string;
  anonymousId?: string | null;
  userId?: string | null;
  assignedAt: Date;
  expiresAt: Date;
}

export interface ExperimentAssignmentRecord extends ExperimentAssignmentInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperimentAssignmentLookup {
  experimentId: string;
  anonymousId?: string | null;
  userId?: string | null;
  at: Date;
}

export interface IExperimentAssignmentRepository {
  findActiveAssignment(lookup: ExperimentAssignmentLookup): Promise<ExperimentAssignmentRecord | null>;
  create(input: ExperimentAssignmentInput): Promise<ExperimentAssignmentRecord>;
}
