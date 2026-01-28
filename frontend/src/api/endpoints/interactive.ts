/**
 * API эндпоинты для интерактивов (квизы)
 */

import { request } from '@/api/client';
import type {
  QuizzesResponse,
  QuizRunStartResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
} from '@/api/types/interactive';

/** GET /interactive/quizzes/ — список квизов */
export async function getQuizzes(): Promise<QuizzesResponse> {
  return request<QuizzesResponse>('GET', 'interactive/quizzes/');
}

/** POST /interactive/quizzes/:slug/start/ — начать квиз */
export async function startQuiz(slug: string): Promise<QuizRunStartResponse['data']> {
  const res = await request<QuizRunStartResponse>('POST', `interactive/quizzes/${slug}/start/`);
  return res.data;
}

/** POST /interactive/quizzes/:slug/submit/ — отправить ответы */
export async function submitQuiz(
  slug: string,
  body: QuizSubmitRequest
): Promise<QuizSubmitResponse['data']> {
  const res = await request<QuizSubmitResponse>('POST', `interactive/quizzes/${slug}/submit/`, body);
  return res.data;
}
