export type SeedCuratedItem =
  | { item_type: 'content'; content_type: 'article' | 'resource' | 'note' | 'landing' | 'page'; content_slug: string; note?: string }
  | { item_type: 'interactive'; interactive_type: 'quiz' | 'navigator' | 'thermometer' | 'boundaries' | 'prep' | 'ritual'; interactive_slug: string; note?: string };

export type SeedCuratedCollection = {
  slug: string;
  title: string;
  collection_type: 'problem' | 'format' | 'goal' | 'context';
  topic_code?: string | null;
  items: SeedCuratedItem[];
};

export const seedCuratedCollections: SeedCuratedCollection[] = [
  {
    slug: 'start-anxiety',
    title: 'Старт: тревога — 3 шага без давления',
    collection_type: 'problem',
    topic_code: 'anxiety',
    items: [
      { item_type: 'interactive', interactive_type: 'quiz', interactive_slug: 'anxiety', note: 'Ориентир (не диагноз)' },
      { item_type: 'content', content_type: 'resource', content_slug: 'dyhanie-4-6' },
      { item_type: 'content', content_type: 'resource', content_slug: 'zazemlenie-5-4-3-2-1' },
      { item_type: 'content', content_type: 'article', content_slug: 'trevoga-utrom-3-myagkih-shaga' },
    ],
  },
  {
    slug: 'start-burnout',
    title: 'Старт: выгорание — мягкое восстановление',
    collection_type: 'problem',
    topic_code: 'burnout',
    items: [
      { item_type: 'interactive', interactive_type: 'quiz', interactive_slug: 'burnout' },
      { item_type: 'interactive', interactive_type: 'thermometer', interactive_slug: 'resource-thermometer' },
      { item_type: 'content', content_type: 'article', content_slug: '10-priznakov-vygoraniya-kotorye-chasto-ignoriruyut' },
      { item_type: 'content', content_type: 'resource', content_slug: 'cheklist-granicy-na-nedelyu' },
    ],
  },
  {
    slug: 'quick-first-step',
    title: 'Быстрый первый шаг (1–3 минуты)',
    collection_type: 'format',
    topic_code: null,
    items: [
      { item_type: 'interactive', interactive_type: 'thermometer', interactive_slug: 'resource-thermometer' },
      { item_type: 'content', content_type: 'resource', content_slug: 'dyhanie-4-6' },
      { item_type: 'content', content_type: 'resource', content_slug: 'konteiner-dlya-myslei-2-minuty' },
    ],
  },
  {
    slug: 'prepare-first-session',
    title: 'Подготовиться к первой встрече',
    collection_type: 'context',
    topic_code: null,
    items: [
      { item_type: 'interactive', interactive_type: 'prep', interactive_slug: 'consultation-prep' },
      { item_type: 'content', content_type: 'article', content_slug: 'kak-podgotovitsya-k-pervoi-vstreche-s-psihologom' },
    ],
  },
  {
    slug: 'boundaries-scripts-pack',
    title: 'Границы: скрипты фраз и опоры',
    collection_type: 'goal',
    topic_code: 'boundaries',
    items: [
      { item_type: 'interactive', interactive_type: 'boundaries', interactive_slug: 'default' },
      { item_type: 'content', content_type: 'article', content_slug: 'kak-govorit-net-bez-viny' },
      { item_type: 'content', content_type: 'resource', content_slug: 'cheklist-granicy-na-nedelyu' },
    ],
  },
];

