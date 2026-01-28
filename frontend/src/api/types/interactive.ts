/**
 * Типы для интерактивов (квизы) по контракту docs/api/api-contracts.md
 */

// Квиз в списке
export interface QuizListItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  estimated_time_minutes?: number;
  category?: string;
}

export interface QuizzesResponse {
  data: QuizListItem[];
}

// Вопрос квиза (ответ start)
export interface QuizQuestionOption {
  value: string | number;
  label?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: string; // multiple_choice, scale, etc.
  options?: string[] | QuizQuestionOption[];
}

// Краткие данные квиза в ответе start
export interface QuizInfo {
  id: string;
  slug: string;
  title: string;
}

// Ответ POST .../start/ (бэкенд может отдавать { data: { run_id, quiz_slug, started_at } } или { data: { run_id, quiz, questions, started_at } })
export interface QuizRunStartResponse {
  data: {
    run_id: string;
    quiz_slug?: string;
    quiz?: QuizInfo;
    questions?: QuizQuestion[];
    started_at?: string;
  };
}

// Запрос POST .../submit/
export interface QuizAnswerItem {
  question_id: string;
  value: string | number;
}

export interface QuizSubmitRequest {
  run_id: string;
  answers: QuizAnswerItem[];
}

// Результат квиза (ответ submit)
export interface QuizResultData {
  level: string;
  profile?: string;
  recommendations?: string[];
}

export interface QuizSubmitResponse {
  data: {
    run_id: string;
    result: QuizResultData;
    deep_link_id?: string | null;
  };
}

/** Встроенные вопросы PHQ-9, если бэкенд не отдаёт questions в start */
export const PHQ9_FALLBACK_QUESTIONS: QuizQuestion[] = [
  { id: 'phq9-1', text: 'Слабый интерес или удовольствие от того, чем вы занимаетесь', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
  { id: 'phq9-2', text: 'Подавленность, депрессия или чувство безнадёжности', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
  { id: 'phq9-3', text: 'Проблемы с засыпанием, сном или слишком долгий сон', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
  { id: 'phq9-4', text: 'Чувство усталости или упадок сил', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
  { id: 'phq9-5', text: 'Плохой аппетит или переедание', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
  { id: 'phq9-6', text: 'Плохое мнение о себе, ощущение, что вы неудачник/неудачница или подвели себя или свою семью', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
  { id: 'phq9-7', text: 'Проблемы с концентрацией внимания, например, при чтении газет или просмотре телевизора', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
  { id: 'phq9-8', text: 'Замедленные движения или речь настолько, что это заметно другим. Или наоборот, вы настолько возбуждены или беспокойны, что двигаетесь намного больше обычного', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
  { id: 'phq9-9', text: 'Мысли о том, что было бы лучше умереть или как-то причинить себе вред', type: 'multiple_choice', options: ['0', '1', '2', '3'] },
];
