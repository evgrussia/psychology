import { apiClient } from './client';
import { Article, ArticlesResponse, Topic } from '@/types/api';

export const contentService = {
  getArticles: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    tag?: string;
    search?: string;
  }): Promise<ArticlesResponse> => {
    const response = await apiClient.get<ArticlesResponse>('/content/articles', {
      params,
    });
    return response.data;
  },

  getArticle: async (slug: string): Promise<Article> => {
    const response = await apiClient.get<Article>(`/content/articles/${slug}`);
    return response.data;
  },

  getTopics: async (): Promise<Topic[]> => {
    const response = await apiClient.get<{ data: Topic[] }>('/content/topics');
    return response.data.data;
  },
};
