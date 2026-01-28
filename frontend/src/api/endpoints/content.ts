/**
 * API эндпоинты для контента: topics, articles, resources
 */

import { request } from '@/api/client';
import type {
  TopicsResponse,
  ArticlesResponse,
  ArticleResponse,
  ResourcesResponse,
  ResourceResponse,
  ListArticlesParams,
  ListResourcesParams,
} from '@/api/types/content';

// Topics
export async function getTopics(): Promise<TopicsResponse> {
  return request<TopicsResponse>('GET', 'content/topics/');
}

// Articles
export async function getArticles(params?: ListArticlesParams): Promise<ArticlesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const path = query ? `content/articles/?${query}` : 'content/articles/';
  return request<ArticlesResponse>('GET', path);
}

export async function getArticleBySlug(slug: string): Promise<ArticleResponse> {
  return request<ArticleResponse>('GET', `content/articles/${slug}/`);
}

// Resources
export async function getResources(params?: ListResourcesParams): Promise<ResourcesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.type) searchParams.set('type', params.type);
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const path = query ? `content/resources/?${query}` : 'content/resources/';
  return request<ResourcesResponse>('GET', path);
}

export async function getResourceBySlug(slug: string): Promise<ResourceResponse> {
  return request<ResourceResponse>('GET', `content/resources/${slug}/`);
}
