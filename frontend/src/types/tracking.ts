export interface PageViewProperties {
  page_path: string;
  page_title?: string;
}

export interface QuizStartedProperties {
  quiz_id: string;
  run_id: string;
}

export interface QuizQuestionAnsweredProperties {
  quiz_id: string;
  run_id: string;
  question_index: number;
}

export interface QuizCompletedProperties {
  quiz_id: string;
  run_id: string;
  level: string;
}

export interface QuizCrisisDetectedProperties {
  quiz_id: string;
  run_id: string;
}

export interface TopicSelectedProperties {
  topic_id: string;
  topic_slug: string;
}
