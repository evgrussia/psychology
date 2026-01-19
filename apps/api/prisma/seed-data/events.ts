export type SeedEvent = {
  slug: string;
  title: string;
  description_markdown: string;
  starts_at: Date;
  ends_at?: Date | null;
  format: 'online' | 'offline' | 'hybrid';
  location_text?: string | null;
  status: 'draft' | 'published' | 'archived';
  capacity?: number | null;
  registration_open: boolean;
  published_at?: Date | null;
};

function daysFromNow(days: number, hourUtc: number, minuteUtc = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hourUtc, minuteUtc, 0, 0);
  return d;
}

export const seedEvents: SeedEvent[] = [
  {
    slug: 'webinar-anxiety-basics',
    title: 'Вебинар: как бережно справляться с тревогой',
    description_markdown: [
      '60–90 минут: нормализация, 3 идеи и 1 практика.',
      '',
      '**Важно:** это не диагноз и не экстренная помощь.',
      '',
      '### Программа',
      '- 10 мин: рамка и безопасность',
      '- 35 мин: 3 ключевые идеи про тревогу',
      '- 10 мин: практика (дыхание/заземление)',
      '- 10 мин: вопросы (общие, без личных деталей)',
      '',
      'После вебинара: подборка материалов и следующий шаг (по желанию).',
    ].join('\n'),
    starts_at: daysFromNow(7, 16, 0), // 16:00 UTC
    ends_at: daysFromNow(7, 17, 30),
    format: 'online',
    status: 'published',
    capacity: 50,
    registration_open: true,
    published_at: new Date(),
  },
  {
    slug: 'qa-burnout',
    title: 'Q&A: выгорание и границы нагрузки',
    description_markdown: [
      'Эфир вопросов и ответов (30–45 минут).',
      '',
      '**Правила:** вопросы общие/обезличенные, без индивидуальной терапии в прямом эфире.',
      '',
      'Можно прийти просто послушать.',
    ].join('\n'),
    starts_at: daysFromNow(12, 16, 0),
    ends_at: daysFromNow(12, 16, 45),
    format: 'online',
    status: 'published',
    capacity: 100,
    registration_open: true,
    published_at: new Date(),
  },
  {
    slug: 'practice-selfcompassion',
    title: 'Встреча‑практика: самосострадание вместо самокритики',
    description_markdown: [
      '45–60 минут: одна практика + обсуждение опыта.',
      '',
      'Подойдёт, если вы часто “пилите” себя и хочется больше опоры.',
      '',
      '**Важно:** это не медицинская помощь.',
    ].join('\n'),
    starts_at: daysFromNow(18, 16, 0),
    ends_at: daysFromNow(18, 17, 0),
    format: 'online',
    status: 'published',
    capacity: 30,
    registration_open: true,
    published_at: new Date(),
  },
];

