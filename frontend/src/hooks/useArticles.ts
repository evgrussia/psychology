import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/api/content';
import { ArticlesResponse } from '@/types/api';

export function useArticles(params?: Parameters<typeof contentService.getArticles>[0]) {
  return useQuery<ArticlesResponse>({
    queryKey: ['articles', params],
    queryFn: () => contentService.getArticles(params),
  });
}
