export type AnalyticsRangePreset = 'today' | '7d' | '30d' | 'custom';

export interface AnalyticsRangeQuery {
  range?: string;
  from?: string;
  to?: string;
}

export interface AnalyticsResolvedRange {
  preset: AnalyticsRangePreset;
  from: Date;
  to: Date;
  label: string;
}

export function resolveAnalyticsRange(query: AnalyticsRangeQuery = {}): AnalyticsResolvedRange {
  const now = new Date();
  const preset = normalizePreset(query.range);

  if (preset === 'custom') {
    const from = parseDate(query.from, 'start');
    const to = parseDate(query.to, 'end');
    if (from && to && from <= to) {
      return {
        preset,
        from,
        to,
        label: `custom ${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)}`,
      };
    }
  }

  if (preset === 'today') {
    const from = startOfUtcDay(now);
    return {
      preset,
      from,
      to: now,
      label: 'today',
    };
  }

  const days = preset === '30d' ? 30 : 7;
  const from = startOfUtcDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
  return {
    preset: preset === 'custom' ? '7d' : preset,
    from,
    to: now,
    label: preset === '30d' ? 'last_30_days' : 'last_7_days',
  };
}

function normalizePreset(preset?: string): AnalyticsRangePreset {
  if (preset === 'today' || preset === '7d' || preset === '30d' || preset === 'custom') {
    return preset;
  }
  return '7d';
}

function parseDate(value?: string, bound?: 'start' | 'end'): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  if (bound === 'start') {
    return startOfUtcDay(date);
  }
  if (bound === 'end') {
    return endOfUtcDay(date);
  }
  return date;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function endOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}
