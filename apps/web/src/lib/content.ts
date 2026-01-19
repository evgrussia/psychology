import { getApiUrl } from './api';

export class ContentPlatform {
  static async listContent(type: string, limit?: number, offset?: number): Promise<any> {
    const baseUrl = getApiUrl();
    const url = new URL(`${baseUrl}/public/content/${type}`);
    if (limit) url.searchParams.append('limit', limit.toString());
    if (offset) url.searchParams.append('offset', offset.toString());

    try {
      const res = await fetch(url.toString(), {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      } as any);
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error(`[ContentPlatform] Error listing ${type}:`, error);
      return { items: [], total: 0 };
    }
  }

  static async getContent(type: string, slug: string): Promise<any> {
    const baseUrl = getApiUrl();
    try {
      const res = await fetch(`${baseUrl}/public/content/${type}/${slug}`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(5000),
      } as any);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`API responded with status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`[ContentPlatform] Error getting ${type} ${slug}:`, error);
      return null;
    }
  }

  static async getPage(slug: string): Promise<any> {
    const baseUrl = getApiUrl();
    try {
      const res = await fetch(`${baseUrl}/public/pages/${slug}`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      } as any);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`API responded with status ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`[ContentPlatform] Error getting page ${slug}:`, error);
      return null;
    }
  }

  static async getTopicLanding(slug: string): Promise<any> {
    const baseUrl = getApiUrl();
    try {
      const res = await fetch(`${baseUrl}/public/topic-landings/${slug}`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      } as any);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      
      return await res.json();
    } catch (error) {
      console.error(`[ContentPlatform] Error getting topic landing ${slug}:`, error);
      // Fallback data for critical topics if API is down
      const fallbacks: Record<string, any> = {
        'anxiety': {
          topic: { code: 'anxiety', title: 'Тревога' },
          relatedContent: [],
          relatedInteractives: [],
          relatedServices: []
        },
        'burnout': {
          topic: { code: 'burnout', title: 'Выгорание' },
          relatedContent: [],
          relatedInteractives: [],
          relatedServices: []
        }
      };
      return fallbacks[slug] || null;
    }
  }

  static async listServices(): Promise<any[]> {
    const baseUrl = getApiUrl();
    try {
      const res = await fetch(`${baseUrl}/public/services`, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(5000),
      } as any);
      if (!res.ok) return [];
      return await res.json();
    } catch (error) {
      console.error('[ContentPlatform] Error listing services:', error);
      return [];
    }
  }

  static async getService(slug: string): Promise<any | null> {
    const baseUrl = getApiUrl();
    try {
      const res = await fetch(`${baseUrl}/public/services/${slug}`, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(5000),
      } as any);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error(`[ContentPlatform] Error getting service ${slug}:`, error);
      return null;
    }
  }

  static async listTopics(): Promise<any[]> {
    const baseUrl = getApiUrl();
    try {
      const res = await fetch(`${baseUrl}/public/topics`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      } as any);
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error('[ContentPlatform] Error listing topics:', error);
      return [
        { code: 'anxiety', title: 'Тревога', isActive: true },
        { code: 'burnout', title: 'Выгорание', isActive: true },
        { code: 'relationships', title: 'Отношения', isActive: true },
        { code: 'boundaries', title: 'Границы', isActive: true },
        { code: 'self-esteem', title: 'Самооценка', isActive: true },
      ];
    }
  }
}
