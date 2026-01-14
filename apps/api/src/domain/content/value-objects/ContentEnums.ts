export enum ContentType {
  article = 'article',
  note = 'note',
  resource = 'resource',
  landing = 'landing',
  page = 'page',
}

export enum ContentStatus {
  draft = 'draft',
  review = 'review',
  published = 'published',
  archived = 'archived',
}

export enum ContentFormat {
  article = 'article',
  note = 'note',
  resource = 'resource',
  audio = 'audio',
  checklist = 'checklist',
}

export enum SupportLevel {
  self_help = 'self_help',
  micro_support = 'micro_support',
  consultation = 'consultation',
}

export enum TimeToBenefit {
  min_1_3 = 'min_1_3',
  min_7_10 = 'min_7_10',
  min_20_30 = 'min_20_30',
  series = 'series',
}

export enum CollectionType {
  problem = 'problem',
  format = 'format',
  goal = 'goal',
  context = 'context',
}

export enum CuratedItemType {
  content = 'content',
  interactive = 'interactive',
}

export enum GlossaryTermCategory {
  approach = 'approach',
  state = 'state',
  concept = 'concept',
}
