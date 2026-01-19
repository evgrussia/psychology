import { track } from './tracking';
import { getApiUrl } from './api';

export enum ResultLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

export type CrisisTriggerType = 'self_harm' | 'suicidal_ideation' | 'violence' | 'minor_risk' | 'panic_like';

export const CRISIS_KEYWORDS: Record<CrisisTriggerType, string[]> = {
  suicidal_ideation: [
    'суицид', 'убить себя', 'покончить', 'не хочу жить', 'умереть', 'конец', 
    'прыгнуть', 'повеситься', 'самоубийство'
  ],
  self_harm: [
    'таблетки все', 'передозировка', 'резать вены', 'порезать', 'бритва'
  ],
  violence: [
    'бьёт меня', 'ударил', 'избил', 'насилие', 'изнасилование', 
    'не могу уйти', 'боюсь за жизнь', 'угрожает убить', 'держит силой'
  ],
  panic_like: [
    'паника', 'задыхаюсь', 'страх смерти', 'сердце выпрыгивает'
  ],
  minor_risk: [
    'тяжело', 'не справляюсь', 'одиноко'
  ]
};

export function evaluateCrisisTrigger(text: string): CrisisTriggerType | null {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // High priority categories first
  const highPriority: CrisisTriggerType[] = ['suicidal_ideation', 'self_harm', 'violence'];
  for (const category of highPriority) {
    if (CRISIS_KEYWORDS[category].some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  // Lower priority
  const lowPriority: CrisisTriggerType[] = ['panic_like', 'minor_risk'];
  for (const category of lowPriority) {
    if (CRISIS_KEYWORDS[category].some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return null;
}

export interface StartInteractiveRunParams {
  interactive_type: string;
  interactive_slug: string;
  topic?: string;
  userId?: string;
  anonymousId?: string;
  deepLinkId?: string;
}

export interface CompleteInteractiveRunParams {
  runId: string;
  resultLevel?: ResultLevel;
  resultProfile?: string;
  durationMs: number;
  crisisTriggered?: boolean;
  crisisTriggerType?: string;
}

const getBaseUrl = () => getApiUrl();

export class InteractivePlatform {
  static async startRun(params: StartInteractiveRunParams): Promise<string> {
    const anonymousId = typeof window !== 'undefined' ? localStorage.getItem('anonymous_id') : undefined;
    const baseUrl = getBaseUrl();
    
    try {
      const response = await fetch(`${baseUrl}/public/interactive/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          anonymousId: params.anonymousId || anonymousId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start interactive run');
      }

      const { runId } = await response.json();
      return runId;
    } catch (error) {
      console.error('[InteractivePlatform] Error starting run:', error);
      // Fallback for offline/error: return a temporary local ID
      return `local_${Date.now()}`;
    }
  }

  static async completeRun(params: CompleteInteractiveRunParams): Promise<void> {
    const baseUrl = getBaseUrl();
    try {
      if (params.runId.startsWith('local_')) {
        console.warn('[InteractivePlatform] Skipping backend completion for local run');
        return;
      }

      const response = await fetch(`${baseUrl}/public/interactive/runs/${params.runId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to complete interactive run');
      }
    } catch (error) {
      console.error('[InteractivePlatform] Error completing run:', error);
    }
  }

  static trackStart(type: string, slug: string, properties: any = {}) {
    track(`start_${type}`, {
      [`${type}_slug`]: slug,
      ...properties,
    });
  }

  static trackComplete(type: string, slug: string, properties: any = {}) {
    track(`complete_${type}`, {
      [`${type}_slug`]: slug,
      ...properties,
    });
  }

  static trackCrisisTriggered(triggerType: string, surface: string) {
    track('crisis_banner_shown', {
      trigger_type: triggerType,
      surface,
    });
  }

  static trackNavigatorStart(slug: string, runId?: string) {
    track('navigator_start', {
      navigator_slug: slug,
      run_id: runId,
    });
  }

  static trackNavigatorStepCompleted(slug: string, stepIndex: number, choiceId: string, runId?: string) {
    track('navigator_step_completed', {
      navigator_slug: slug,
      step_index: stepIndex,
      choice_id: choiceId,
      run_id: runId,
    });
  }

  static trackNavigatorComplete(slug: string, resultProfileId: string, durationMs: number, runId?: string) {
    track('navigator_complete', {
      navigator_slug: slug,
      result_profile: resultProfileId,
      duration_ms: durationMs,
      run_id: runId,
    });
  }

  static trackQuizQuestionCompleted(slug: string, questionIndex: number, runId?: string) {
    track('quiz_question_completed', {
      quiz_slug: slug,
      question_index: questionIndex,
      run_id: runId,
    });
  }

  static trackQuizAbandoned(slug: string, abandonedAtQuestion: number, runId?: string) {
    track('quiz_abandoned', {
      quiz_slug: slug,
      abandoned_at_question: abandonedAtQuestion,
      run_id: runId,
    });
  }

  static trackBoundariesStart(scenario: string, tone: string) {
    track('boundaries_script_start', {
      topic: 'boundaries',
      scenario,
      tone,
    });
  }

  static trackBoundariesVariantViewed(variant_id: string, scenario: string, tone: string) {
    track('boundaries_script_variant_viewed', {
      scenario,
      tone,
      variant_id,
    });
  }

  static trackBoundariesCopied(variant_id: string) {
    track('boundaries_script_copied', {
      variant_id,
    });
  }

  static trackRitualStart(slug: string, topic?: string) {
    track('ritual_started', {
      ritual_slug: slug,
      topic,
    });
  }

  static trackRitualComplete(slug: string, durationMs: number) {
    track('ritual_completed', {
      ritual_slug: slug,
      duration_ms: durationMs,
    });
  }

  static async listRituals(topic?: string): Promise<any> {
    const baseUrl = getBaseUrl();
    const url = new URL(`${baseUrl}/public/interactive/rituals`);
    if (topic) url.searchParams.append('topic', topic);
    
    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch rituals');
      return await response.json();
    } catch (error) {
      console.error('[InteractivePlatform] Error listing rituals:', error);
      return { items: [], total: 0 };
    }
  }

  static async getRitual(slug: string): Promise<any> {
    const baseUrl = getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/public/interactive/rituals/${slug}`, {
        cache: 'no-store', // Always fetch fresh data
      });
      if (!response.ok) throw new Error('Failed to fetch ritual');
      return await response.json();
    } catch (error) {
      console.error('[InteractivePlatform] Error getting ritual:', error);
      return null;
    }
  }

  static async getQuiz(slug: string): Promise<any> {
    const baseUrl = getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/public/interactive/quizzes/${slug}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        console.error(`[InteractivePlatform] Failed to fetch quiz ${slug}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch quiz: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[InteractivePlatform] Error getting quiz:', error);
      return null;
    }
  }

  static async getThermometer(slug: string): Promise<any> {
    const baseUrl = getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/public/interactive/thermometers/${slug}`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch thermometer');
      return await response.json();
    } catch (error) {
      console.error('[InteractivePlatform] Error getting thermometer:', error);
      return null;
    }
  }

  static async getPrep(slug: string): Promise<any> {
    const baseUrl = getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/public/interactive/prep/${slug}`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch prep');
      return await response.json();
    } catch (error) {
      console.error('[InteractivePlatform] Error getting prep:', error);
      return null;
    }
  }

  static async getBoundaryScripts(slug: string): Promise<any> {
    const baseUrl = getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/public/interactive/boundaries-scripts/${slug}`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch boundary scripts');
      return await response.json();
    } catch (error) {
      console.error('[InteractivePlatform] Error getting boundary scripts:', error);
      return null;
    }
  }

  static async getNavigator(slug: string): Promise<any> {
    const baseUrl = getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/public/interactive/navigators/${slug}`, {
        next: { revalidate: 3600 },
      } as any);
      if (!response.ok) throw new Error('Failed to fetch navigator');
      return await response.json();
    } catch (error) {
      console.error('[InteractivePlatform] Error getting navigator:', error);
      return null;
    }
  }

  static async getHomepageData(): Promise<any> {
    const baseUrl = getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/public/homepage`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      } as any);
      if (!response.ok) throw new Error('Failed to fetch homepage data');
      return await response.json();
    } catch (error) {
      console.error('[InteractivePlatform] Error getting homepage data:', error);
      return {
        topics: [
          { code: 'anxiety', title: 'Тревога' },
          { code: 'burnout', title: 'Выгорание' },
          { code: 'relationships', title: 'Отношения' },
        ],
        featured_interactives: [],
        trust_blocks: [
          { id: 'confidentiality', title: 'Конфиденциальность', description: 'Ваши данные под защитой.' },
          { id: 'how_it_works', title: 'Как это работает', description: '3 шага к балансу.' },
        ],
      };
    }
  }
}
