import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contentService } from '@/services/api/content';
import { apiClient } from '@/services/api/client';

// Mock apiClient
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('contentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getArticles', () => {
    it('fetches articles with default params', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              slug: 'article-1',
              title: 'Article 1',
              excerpt: 'Excerpt 1',
              published_at: '2026-01-01',
              category: 'category1',
              tags: ['tag1'],
            },
          ],
          pagination: {
            page: 1,
            per_page: 10,
            total: 1,
            total_pages: 1,
          },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await contentService.getArticles();

      expect(apiClient.get).toHaveBeenCalledWith('/content/articles', {
        params: undefined,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('fetches articles with custom params', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: {
            page: 2,
            per_page: 20,
            total: 0,
            total_pages: 0,
          },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const params = {
        page: 2,
        per_page: 20,
        category: 'test',
        tag: 'tag1',
        search: 'query',
      };

      const result = await contentService.getArticles(params);

      expect(apiClient.get).toHaveBeenCalledWith('/content/articles', {
        params,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors', async () => {
      const error = {
        response: {
          status: 500,
          data: {
            error: {
              message: 'Internal server error',
            },
          },
        },
      };

      (apiClient.get as any).mockRejectedValue(error);

      await expect(contentService.getArticles()).rejects.toEqual(error);
    });
  });

  describe('getArticle', () => {
    it('fetches single article by slug', async () => {
      const mockResponse = {
        data: {
          id: '1',
          slug: 'article-1',
          title: 'Article 1',
          content: 'Full content',
          published_at: '2026-01-01',
          category: 'category1',
          tags: ['tag1'],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await contentService.getArticle('article-1');

      expect(apiClient.get).toHaveBeenCalledWith('/content/articles/article-1');
      expect(result).toEqual(mockResponse.data);
    });

    it('handles 404 error for non-existent article', async () => {
      const error = {
        response: {
          status: 404,
          data: {
            error: {
              message: 'Article not found',
            },
          },
        },
      };

      (apiClient.get as any).mockRejectedValue(error);

      await expect(contentService.getArticle('non-existent')).rejects.toEqual(error);
    });
  });
});
