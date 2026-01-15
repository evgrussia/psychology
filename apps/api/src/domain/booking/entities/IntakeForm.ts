export interface IntakeFormProps {
  id: string;
  appointmentId: string;
  payloadEncrypted: string;
  submittedAt: Date | null;
}

export class IntakeForm {
  private constructor(private readonly props: IntakeFormProps) {}

  static create(props: IntakeFormProps): IntakeForm {
    if (!props.payloadEncrypted || props.payloadEncrypted.trim().length === 0) {
      throw new Error('Encrypted intake payload is required');
    }
    return new IntakeForm(props);
  }

  get id(): string { return this.props.id; }
  get appointmentId(): string { return this.props.appointmentId; }
  get payloadEncrypted(): string { return this.props.payloadEncrypted; }
  get submittedAt(): Date | null { return this.props.submittedAt; }
}
