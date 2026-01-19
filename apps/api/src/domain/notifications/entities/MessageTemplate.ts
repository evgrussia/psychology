export interface MessageTemplateProps {
  id: string;
  channel: string;
  category: string;
  name: string;
  status: string;
  language: string;
  activeVersionId?: string | null;
  activatedAt?: Date | null;
  createdAt: Date;
}

export class MessageTemplate {
  constructor(private readonly props: MessageTemplateProps) {}

  get id(): string { return this.props.id; }
  get channel(): string { return this.props.channel; }
  get category(): string { return this.props.category; }
  get name(): string { return this.props.name; }
  get status(): string { return this.props.status; }
  get language(): string { return this.props.language; }
  get activeVersionId(): string | null | undefined { return this.props.activeVersionId; }
  get activatedAt(): Date | null | undefined { return this.props.activatedAt; }
  get createdAt(): Date { return this.props.createdAt; }

  static create(props: MessageTemplateProps): MessageTemplate {
    return new MessageTemplate(props);
  }
}
