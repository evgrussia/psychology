import Head from 'next/head';

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterHandle?: string;
}

export function SeoHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  twitterHandle = '@balance_psy',
}: SeoHeadProps) {
  const siteName = 'Эмоциональный баланс';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Психологическая помощь онлайн. Первый шаг к эмоциональному балансу.';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Head>
  );
}

