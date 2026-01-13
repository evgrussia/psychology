import { track } from './tracking';

export enum ResultLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

export interface StartInteractiveRunParams {
  interactiveDefinitionId: string;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class InteractivePlatform {
  static async startRun(params: StartInteractiveRunParams): Promise<string> {
    const anonymousId = typeof window !== 'undefined' ? localStorage.getItem('anonymous_id') : undefined;
    
    try {
      const response = await fetch(`${API_BASE_URL}/public/interactive/runs`, {
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
    try {
      if (params.runId.startsWith('local_')) {
        console.warn('[InteractivePlatform] Skipping backend completion for local run');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/public/interactive/runs/${params.runId}/complete`, {
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
}
