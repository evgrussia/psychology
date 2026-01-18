'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAnonymousId, track } from './tracking';

export interface ExperimentAssignment {
  experimentId: string;
  variant: string;
  surface: string;
  assignedAt: string;
  expiresAt: string;
}

interface AssignmentResponse {
  experiment_id: string;
  variant: string | null;
  assigned_at: string | null;
  expires_at: string | null;
  is_new: boolean;
  status: 'active' | 'paused' | 'archived' | 'draft';
  surface: string | null;
}

const ASSIGNMENT_KEY_PREFIX = 'experiment_assignment:';
const EXPOSURE_KEY_PREFIX = 'experiment_exposed:';

function getAssignmentCacheKey(experimentId: string): string {
  return `${ASSIGNMENT_KEY_PREFIX}${experimentId}`;
}

function getExposureCacheKey(experimentId: string, variant: string): string {
  return `${EXPOSURE_KEY_PREFIX}${experimentId}:${variant}`;
}

function readCachedAssignment(experimentId: string): ExperimentAssignment | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(getAssignmentCacheKey(experimentId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ExperimentAssignment;
    if (!parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(getAssignmentCacheKey(experimentId));
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(getAssignmentCacheKey(experimentId));
    return null;
  }
}

function writeCachedAssignment(assignment: ExperimentAssignment): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getAssignmentCacheKey(assignment.experimentId), JSON.stringify(assignment));
}

export async function getExperimentAssignment(experimentId: string): Promise<ExperimentAssignment | null> {
  const cached = readCachedAssignment(experimentId);
  if (cached) return cached;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  const response = await fetch(`${apiUrl}/public/experiments/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      experiment_id: experimentId,
      anonymous_id: getAnonymousId(),
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AssignmentResponse;
  if (!data.variant || !data.assigned_at || !data.expires_at || !data.surface || data.status !== 'active') {
    return null;
  }

  const assignment: ExperimentAssignment = {
    experimentId: data.experiment_id,
    variant: data.variant,
    surface: data.surface,
    assignedAt: data.assigned_at,
    expiresAt: data.expires_at,
  };

  writeCachedAssignment(assignment);
  return assignment;
}

export function trackExperimentExposure(assignment: ExperimentAssignment | null): void {
  if (!assignment || typeof window === 'undefined') return;
  const key = getExposureCacheKey(assignment.experimentId, assignment.variant);
  if (sessionStorage.getItem(key)) return;

  track('experiment_exposed', {
    experiment_id: assignment.experimentId,
    variant: assignment.variant,
    surface: assignment.surface,
    page_path: window.location.pathname,
  });

  sessionStorage.setItem(key, '1');
}

export function getExperimentTrackingProperties(assignment: ExperimentAssignment | null): Record<string, string> {
  if (!assignment) return {};
  return {
    experiment_id: assignment.experimentId,
    variant: assignment.variant,
    surface: assignment.surface,
  };
}

export function useExperimentAssignment(experimentId: string): ExperimentAssignment | null {
  const [assignment, setAssignment] = useState<ExperimentAssignment | null>(null);

  useEffect(() => {
    let active = true;
    void getExperimentAssignment(experimentId).then((result) => {
      if (!active) return;
      setAssignment(result);
    });
    return () => {
      active = false;
    };
  }, [experimentId]);

  useEffect(() => {
    if (!assignment) return;
    trackExperimentExposure(assignment);
  }, [assignment]);

  return assignment;
}

export function useExperimentTrackingProperties(experimentId: string): Record<string, string> {
  const assignment = useExperimentAssignment(experimentId);
  return useMemo(() => getExperimentTrackingProperties(assignment), [assignment]);
}
