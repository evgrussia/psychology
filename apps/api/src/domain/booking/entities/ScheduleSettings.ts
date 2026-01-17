export interface ScheduleSettingsProps {
  id: string;
  timezone: string;
  bufferMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ScheduleSettings {
  constructor(private readonly props: ScheduleSettingsProps) {}

  get id(): string { return this.props.id; }
  get timezone(): string { return this.props.timezone; }
  get bufferMinutes(): number { return this.props.bufferMinutes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  static create(props: ScheduleSettingsProps): ScheduleSettings {
    if (props.bufferMinutes < 0) {
      throw new Error('Buffer minutes cannot be negative');
    }
    return new ScheduleSettings(props);
  }
}
