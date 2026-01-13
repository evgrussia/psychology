export interface AuditLogEntryProps {
  id: string;
  actorUserId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export class AuditLogEntry {
  private constructor(private props: AuditLogEntryProps) {}

  static create(props: AuditLogEntryProps): AuditLogEntry {
    return new AuditLogEntry(props);
  }

  static reconstitute(props: AuditLogEntryProps): AuditLogEntry {
    return new AuditLogEntry(props);
  }

  get id(): string {
    return this.props.id;
  }

  get actorUserId(): string | null {
    return this.props.actorUserId;
  }

  get actorRole(): string | null {
    return this.props.actorRole;
  }

  get action(): string {
    return this.props.action;
  }

  get entityType(): string {
    return this.props.entityType;
  }

  get entityId(): string | null {
    return this.props.entityId;
  }

  get oldValue(): Record<string, any> | null {
    return this.props.oldValue;
  }

  get newValue(): Record<string, any> | null {
    return this.props.newValue;
  }

  get ipAddress(): string | null {
    return this.props.ipAddress;
  }

  get userAgent(): string | null {
    return this.props.userAgent;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toObject(): AuditLogEntryProps {
    return { ...this.props };
  }
}
