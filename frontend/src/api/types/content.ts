/**
 * Типы контента по API контракту docs/api/api-contracts.md
 */

// Topics
export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
}

export interface TopicsResponse {
  data: Topic[];
}

// Articles
export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  category: string;
  tags: string[];
}

export interface Article extends ArticleListItem {
  content: string; // Markdown
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ArticlesResponse {
  data: ArticleListItem[];
  pagination: Pagination;
}

export interface ArticleResponse {
  data: Article;
}

// Resources
export interface ResourceListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string; // meditation, exercise, video, checklist
  duration?: string;
}

export interface Resource extends ResourceListItem {
  content: string;
}

export interface ResourcesResponse {
  data: ResourceListItem[];
  pagination: Pagination;
}

export interface ResourceResponse {
  data: Resource;
}

// Query params
export interface ListArticlesParams {
  page?: number;
  per_page?: number;
  category?: string;
  tag?: string;
  search?: string;
}

export interface ListResourcesParams {
  page?: number;
  per_page?: number;
  type?: string;
  search?: string;
}
