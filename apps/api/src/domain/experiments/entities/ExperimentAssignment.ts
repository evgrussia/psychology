export interface ExperimentAssignmentProps {
  id: string;
  experimentId: string;
  variant: string;
  anonymousId?: string | null;
  userId?: string | null;
  assignedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ExperimentAssignment {
  constructor(private readonly props: ExperimentAssignmentProps) {}

  get id(): string { return this.props.id; }
  get experimentId(): string { return this.props.experimentId; }
  get variant(): string { return this.props.variant; }
  get anonymousId(): string | null | undefined { return this.props.anonymousId; }
  get userId(): string | null | undefined { return this.props.userId; }
  get assignedAt(): Date { return this.props.assignedAt; }
  get expiresAt(): Date { return this.props.expiresAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  static create(props: ExperimentAssignmentProps): ExperimentAssignment {
    return new ExperimentAssignment(props);
  }
}
