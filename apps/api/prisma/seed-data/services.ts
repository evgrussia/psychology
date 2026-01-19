export type SeedService = {
  slug: string;
  title: string;
  description_markdown: string;
  format: 'online' | 'offline' | 'hybrid';
  offline_address?: string | null;
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  cancel_free_hours?: number | null;
  cancel_partial_hours?: number | null;
  reschedule_min_hours?: number | null;
  reschedule_max_count?: number | null;
  status: 'draft' | 'published' | 'archived';
  topic_code?: string | null;
};

export const seedServices: SeedService[] = [
  {
    slug: 'intro-session',
    title: 'Ознакомительная сессия',
    description_markdown: [
      'Короткая встреча, чтобы:',
      '- прояснить запрос',
      '- понять, как проходит работа',
      '- выбрать следующий шаг',
      '',
      'Без давления и “обязательных историй”.',
    ].join('\n'),
    format: 'online',
    duration_minutes: 50,
    price_amount: 4000,
    deposit_amount: 1000,
    cancel_free_hours: 24,
    cancel_partial_hours: 12,
    reschedule_min_hours: 24,
    reschedule_max_count: 1,
    status: 'published',
    topic_code: 'anxiety',
  },
  {
    slug: 'single-session',
    title: 'Разбор ситуации (1 встреча)',
    description_markdown: [
      'Одна встреча, если нужно:',
      '- быстро прояснить ситуацию',
      '- собрать план на 1–2 недели',
      '- определить, нужна ли дальнейшая работа',
      '',
      'Подходит, когда важно “разложить по полочкам”.',
    ].join('\n'),
    format: 'hybrid',
    offline_address: 'Москва, м. Черкизовская (точный адрес после записи)',
    duration_minutes: 60,
    price_amount: 6000,
    deposit_amount: 1500,
    cancel_free_hours: 24,
    cancel_partial_hours: 12,
    reschedule_min_hours: 24,
    reschedule_max_count: 1,
    status: 'published',
    topic_code: 'burnout',
  },
  {
    slug: 'therapy-session',
    title: 'Терапевтическая сессия',
    description_markdown: [
      'Регулярная работа, если хочется глубже:',
      '- устойчивые изменения',
      '- навыки саморегуляции и границ',
      '- бережная работа с паттернами',
      '',
      'Темп и формат обсуждаем вместе.',
    ].join('\n'),
    format: 'online',
    duration_minutes: 60,
    price_amount: 6500,
    deposit_amount: 1500,
    cancel_free_hours: 24,
    cancel_partial_hours: 12,
    reschedule_min_hours: 24,
    reschedule_max_count: 1,
    status: 'published',
    topic_code: 'relationships',
  },
  {
    slug: 'consultation-package',
    title: 'Пакет встреч (4 сессии)',
    description_markdown: [
      'Формат для тех, кому важна устойчивость и структура.',
      '',
      'Включает 4 встречи, между которыми вы можете делать маленькие практики.',
      'Пакет помогает не “срываться” в хаос и держать мягкий курс.',
    ].join('\n'),
    format: 'online',
    duration_minutes: 60,
    price_amount: 24000,
    deposit_amount: 4000,
    cancel_free_hours: 24,
    cancel_partial_hours: 12,
    reschedule_min_hours: 24,
    reschedule_max_count: 2,
    status: 'published',
    topic_code: 'selfesteem',
  },
];

