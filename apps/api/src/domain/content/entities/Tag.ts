export interface TagProps {
  id: string;
  slug: string;
  title: string;
}

export class Tag {
  constructor(private readonly props: TagProps) {}

  get id(): string { return this.props.id; }
  get slug(): string { return this.props.slug; }
  get title(): string { return this.props.title; }

  static create(props: TagProps): Tag {
    return new Tag(props);
  }

  toObject(): TagProps {
    return { ...this.props };
  }
}
