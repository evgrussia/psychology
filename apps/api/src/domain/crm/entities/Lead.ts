import { LeadSource, LeadStatus } from '../value-objects/LeadEnums';

export interface LeadProps {
  id: string;
  status: LeadStatus;
  source: LeadSource;
  topicCode?: string | null;
  utm?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Lead {
  constructor(private readonly props: LeadProps) {}

  static create(props: LeadProps): Lead {
    return new Lead(props);
  }

  static reconstitute(props: LeadProps): Lead {
    return new Lead(props);
  }

  get id(): string { return this.props.id; }
  get status(): LeadStatus { return this.props.status; }
  get source(): LeadSource { return this.props.source; }
  get topicCode(): string | null | undefined { return this.props.topicCode; }
  get utm(): Record<string, any> | null | undefined { return this.props.utm; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
