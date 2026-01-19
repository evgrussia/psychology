const LEGAL_SLUGS = new Set([
  'privacy',
  'personal-data-consent',
  'offer',
  'disclaimer',
  'cookies',
]);

const LEGAL_SLUG_ALIASES = new Map<string, string>([
  ['privacy-policy', 'privacy'],
]);

export function resolveContentHref(contentType: string | undefined, slug: string): string {
  switch (contentType) {
    case 'article':
      return `/blog/${slug}`;
    case 'resource':
      return `/resources/${slug}`;
    case 'landing':
      return `/s-chem-ya-pomogayu/${slug}`;
    case 'page': {
      const legalSlug = LEGAL_SLUG_ALIASES.get(slug) ?? (LEGAL_SLUGS.has(slug) ? slug : null);
      if (legalSlug) {
        return `/legal/${legalSlug}`;
      }
      return `/${slug}`;
    }
    default:
      return '/';
  }
}
