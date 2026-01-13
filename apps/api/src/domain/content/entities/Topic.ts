export class Topic {
  constructor(
    public readonly code: string,
    public readonly title: string,
    public readonly isActive: boolean,
  ) {}

  static reconstitute(params: {
    code: string;
    title: string;
    isActive: boolean;
  }): Topic {
    return new Topic(params.code, params.title, params.isActive);
  }

  toObject() {
    return {
      code: this.code,
      title: this.title,
      isActive: this.isActive,
    };
  }
}
