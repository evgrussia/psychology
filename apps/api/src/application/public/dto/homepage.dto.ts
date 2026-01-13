export interface TopicDto {
  code: string;
  title: string;
}

export interface InteractiveDto {
  id: string;
  type: string;
  slug: string;
  title: string;
  topicCode: string | null;
}

export interface TrustBlockDto {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface HomepageDto {
  topics: TopicDto[];
  featured_interactives: InteractiveDto[];
  trust_blocks: TrustBlockDto[];
}
