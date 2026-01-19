import { Metadata } from 'next';

export function resolveKeywords(value?: string | string[] | null): Metadata['keywords'] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  const keywords = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return keywords.length > 0 ? keywords : undefined;
}

export function resolveCanonical(canonicalUrl?: string | null): Metadata['alternates'] | undefined {
  if (!canonicalUrl) return undefined;
  return { canonical: canonicalUrl };
}
