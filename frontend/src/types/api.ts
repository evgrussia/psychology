import { Article, User, QuizQuestion, QuizAnswer, QuizResult } from './domain';
export * from './domain';

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiError).error === 'object'
  );
}

export interface ArticlesResponse {
  data: Article[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface AuthResponse {
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
  consents?: {
    personal_data: boolean;
    communications?: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  // Access token is now in cookies
}

export interface QuizStartResponse {
  run_id: string;
  quiz: {
    id: string;
    slug: string;
    title: string;
  };
  questions: QuizQuestion[];
}

export interface QuizSubmitRequest {
  run_id: string;
  answers: QuizAnswer[];
}

export interface QuizSubmitResponse {
  run_id: string;
  result: QuizResult;
  deep_link_id?: string;
}

export interface CreateDiaryEntryRequest {
  type: 'emotion' | 'gratitude' | 'reflection';
  content: string;
}

export interface ExportRequest {
  date_from?: string;
  date_to?: string;
  format?: 'pdf' | 'json';
}

export interface ExportResponse {
  export_id: string;
  status: 'processing' | 'completed' | 'failed';
  download_url?: string;
}
