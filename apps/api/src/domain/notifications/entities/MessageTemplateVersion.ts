export interface MessageTemplateVersionProps {
  id: string;
  templateId: string;
  version: number;
  subject?: string | null;
  bodyMarkdown: string;
  updatedByUserId: string;
  createdAt: Date;
}

export class MessageTemplateVersion {
  constructor(private readonly props: MessageTemplateVersionProps) {}

  get id(): string { return this.props.id; }
  get templateId(): string { return this.props.templateId; }
  get version(): number { return this.props.version; }
  get subject(): string | null | undefined { return this.props.subject; }
  get bodyMarkdown(): string { return this.props.bodyMarkdown; }
  get updatedByUserId(): string { return this.props.updatedByUserId; }
  get createdAt(): Date { return this.props.createdAt; }

  static create(props: MessageTemplateVersionProps): MessageTemplateVersion {
    return new MessageTemplateVersion(props);
  }
}
