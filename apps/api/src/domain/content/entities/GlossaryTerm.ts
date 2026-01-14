import { GlossaryTermCategory, ContentStatus } from '../value-objects/ContentEnums';

export interface GlossaryTermProps {
  id: string;
  slug: string;
  title: string;
  category: GlossaryTermCategory;
  shortDefinition: string;
  bodyMarkdown: string;
  metaDescription?: string;
  keywords?: string;
  status: ContentStatus;
  publishedAt?: Date;
  synonyms?: string[];
  relatedContentIds?: string[];
}

export class GlossaryTerm {
  constructor(private readonly props: GlossaryTermProps) {}

  get id(): string { return this.props.id; }
  get slug(): string { return this.props.slug; }
  get title(): string { return this.props.title; }
  get category(): GlossaryTermCategory { return this.props.category; }
  get shortDefinition(): string { return this.props.shortDefinition; }
  get bodyMarkdown(): string { return this.props.bodyMarkdown; }
  get metaDescription(): string | undefined { return this.props.metaDescription; }
  get keywords(): string | undefined { return this.props.keywords; }
  get status(): ContentStatus { return this.props.status; }
  get publishedAt(): Date | undefined { return this.props.publishedAt; }
  get synonyms(): string[] { return this.props.synonyms || []; }
  get relatedContentIds(): string[] { return this.props.relatedContentIds || []; }

  static create(props: GlossaryTermProps): GlossaryTerm {
    return new GlossaryTerm(props);
  }

  update(updates: Partial<Omit<GlossaryTermProps, 'id'>>): GlossaryTerm {
    Object.assign(this.props, updates);
    return this;
  }

  publish(): GlossaryTerm {
    this.props.status = ContentStatus.published;
    this.props.publishedAt = new Date();
    return this;
  }

  toObject() {
    return { ...this.props };
  }
}
