import { apiClient } from './client';
import { Quiz, QuizStartResponse, QuizSubmitRequest, QuizSubmitResponse, DiaryEntry, CreateDiaryEntryRequest } from '@/types/api';

export const interactiveService = {
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await apiClient.get<{ data: Quiz[] }>('/interactive/quizzes');
    return response.data.data;
  },

  startQuiz: async (slug: string): Promise<QuizStartResponse> => {
    const response = await apiClient.post<QuizStartResponse>(
      `/interactive/quizzes/${slug}/start`
    );
    return response.data;
  },

  submitQuiz: async (slug: string, data: QuizSubmitRequest): Promise<QuizSubmitResponse> => {
    const response = await apiClient.post<QuizSubmitResponse>(
      `/interactive/quizzes/${slug}/submit`,
      data
    );
    return response.data;
  },

  getDiaries: async (): Promise<DiaryEntry[]> => {
    const response = await apiClient.get<{ data: DiaryEntry[] }>('/interactive/diaries');
    return response.data.data;
  },

  createDiaryEntry: async (data: CreateDiaryEntryRequest): Promise<DiaryEntry> => {
    const response = await apiClient.post<{ data: DiaryEntry }>('/interactive/diaries', data);
    return response.data.data;
  },
};
