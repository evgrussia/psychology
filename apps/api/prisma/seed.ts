import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // --- Roles ---
  const roles = [
    { code: 'owner', scope: 'admin' },
    { code: 'assistant', scope: 'admin' },
    { code: 'editor', scope: 'admin' },
    { code: 'client', scope: 'product' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: {
        code: role.code,
        scope: role.scope as any,
      },
    });
  }
  console.log('Roles seeded.');

  // --- Initial Owner ---
  const ownerEmail = 'owner@psychology.test';
  const ownerPassword = 'password123'; // In a real app, this should be changed immediately
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      display_name: 'Владелец',
      password_hash: passwordHash,
      status: 'active',
      roles: {
        create: {
          role_code: 'owner',
        },
      },
    },
  });
  console.log(`Owner seeded: ${ownerEmail}`);

  // --- Topics ---
  const topics = [
    { code: 'anxiety', title: 'Тревога' },
    { code: 'burnout', title: 'Выгорание' },
    { code: 'relationships', title: 'Отношения' },
    { code: 'boundaries', title: 'Границы' },
    { code: 'selfesteem', title: 'Самооценка' },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { code: topic.code },
      update: {},
      create: {
        code: topic.code,
        title: topic.title,
        is_active: true,
      },
    });
  }
  console.log('Topics seeded.');

  // --- Interactive Definitions ---
  const anxietyConfig = {
    questions: [
      { id: 'q1', text: 'Как часто вас беспокоило чувство тревоги или напряжения?', options: [{ value: 0, text: 'совсем нет' }, { value: 1, text: 'несколько дней' }, { value: 2, text: 'больше половины дней' }, { value: 3, text: 'почти каждый день' }] },
      { id: 'q2', text: 'Как часто вы не могли перестать беспокоиться или контролировать тревогу?', options: [{ value: 0, text: 'совсем нет' }, { value: 1, text: 'несколько дней' }, { value: 2, text: 'больше половины дней' }, { value: 3, text: 'почти каждый день' }] },
      { id: 'q3', text: 'Как часто вы слишком много волновались по разным поводам?', options: [{ value: 0, text: 'совсем нет' }, { value: 1, text: 'несколько дней' }, { value: 2, text: 'больше половины дней' }, { value: 3, text: 'почти каждый день' }] },
      { id: 'q4', text: 'Как часто вам было трудно расслабиться?', options: [{ value: 0, text: 'совсем нет' }, { value: 1, text: 'несколько дней' }, { value: 2, text: 'больше половины дней' }, { value: 3, text: 'почти каждый день' }] },
      { id: 'q5', text: 'Как часто вы были настолько взвинчены, что не могли усидеть на месте?', options: [{ value: 0, text: 'совсем нет' }, { value: 1, text: 'несколько дней' }, { value: 2, text: 'больше половины дней' }, { value: 3, text: 'почти каждый день' }] },
      { id: 'q6', text: 'Как часто вы легко раздражались или злились?', options: [{ value: 0, text: 'совсем нет' }, { value: 1, text: 'несколько дней' }, { value: 2, text: 'больше половины дней' }, { value: 3, text: 'почти каждый день' }] },
      { id: 'q7', text: 'Как часто вы испытывали страх, что может случиться что-то ужасное?', options: [{ value: 0, text: 'совсем нет' }, { value: 1, text: 'несколько дней' }, { value: 2, text: 'больше половины дней' }, { value: 3, text: 'почти каждый день' }] },
    ],
    thresholds: [
      { level: 'low', minScore: 0, maxScore: 4 },
      { level: 'moderate', minScore: 5, maxScore: 9 },
      { level: 'high', minScore: 10, maxScore: 21 },
    ],
    results: [
      { level: 'low', title: 'Низкий уровень тревоги', description: 'Ваше состояние стабильно, признаки тревоги минимальны.', recommendations: { now: ['Продолжайте заботиться о себе', 'Попробуйте дыхательные упражнения для профилактики'], week: ['Следите за режимом сна', 'Выделяйте время на отдых'] } },
      { level: 'moderate', title: 'Умеренный уровень тревоги', description: 'У вас наблюдается умеренный уровень тревоги.', recommendations: { now: ['Дыхание 4-7-8', 'Техника заземления 5-4-3-2-1'], week: ['Снизьте потребление кофеина', 'Обратите внимание на то, что вызывает беспокойство'] } },
      { level: 'high', title: 'Высокий уровень тревоги', description: 'У вас высокий уровень тревоги. Это может существенно влиять на качество жизни.', recommendations: { now: ['Экстренное дыхание', 'Свяжитесь с кем-то, кому доверяете'], week: ['Рекомендуется консультация специалиста'], whenToSeekHelp: 'Если тревога не проходит более 2 недель или мешает работать/спать.' } },
    ],
  };

  const boundariesConfig = {
    scenarios: [
      { id: 'work', name: 'Работа', description: 'Ситуации на работе' },
      { id: 'family', name: 'Семья', description: 'Семейные ситуации' },
      { id: 'unsafe', name: 'Небезопасная ситуация', is_unsafe: true },
    ],
    tones: [
      { id: 'soft', name: 'Мягко' },
      { id: 'firm', name: 'Твёрдо' },
    ],
    goals: [
      { id: 'refuse', name: 'Отказать' },
      { id: 'ask', name: 'Попросить о помощи' },
    ],
    matrix: [
      {
        scenario_id: 'work',
        tone_id: 'soft',
        goal_id: 'refuse',
        variants: [
          { variant_id: 'script_work_refuse_soft_v1', text: 'Извините, но я не могу помочь с этим сейчас.' },
          { variant_id: 'script_work_refuse_soft_v2', text: 'К сожалению, сейчас у меня нет возможности.' },
        ],
      },
    ],
    safety_block: {
      text: 'Если вы в небезопасной ситуации, обратитесь за помощью.',
    },
  };

  const burnoutConfig = {
    questions: [
      { id: 'q1', text: 'Как часто вы чувствуете эмоциональное истощение от работы?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q2', text: 'Как часто вы чувствуете себя опустошённым(ой) к концу рабочего дня?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q3', text: 'Как часто вы чувствуете усталость, когда встаёте утром и нужно идти на работу?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q4', text: 'Как часто вам кажется, что вы работаете слишком усердно?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q5', text: 'Как часто вам трудно сосредоточиться на задачах?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q6', text: 'Как часто вы чувствуете дистанцированность от работы?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q7', text: 'Как часто вам кажется, что вы не справляетесь?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q8', text: 'Как часто вы чувствуете недостаток энергии для обычных дел?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q9', text: 'Как часто вы избегаете общения с коллегами/близкими?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
      { id: 'q10', text: 'Как часто вы чувствуете, что ваши усилия бесполезны?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'несколько раз' }, { value: 2, text: 'раз в неделю' }, { value: 3, text: 'несколько раз в неделю' }, { value: 4, text: 'каждый день' }] },
    ],
    thresholds: [
      { level: 'low', minScore: 0, maxScore: 12 },
      { level: 'moderate', minScore: 13, maxScore: 24 },
      { level: 'high', minScore: 25, maxScore: 40 },
    ],
    results: [
      { level: 'low', title: 'Низкий риск выгорания', description: 'Вы успешно справляетесь с нагрузкой.', recommendations: { now: ['Продолжайте в том же духе'], week: ['Следите за балансом работа-личная жизнь'] } },
      { level: 'moderate', title: 'Признаки выгорания', description: 'У вас наблюдаются некоторые признаки выгорания.', recommendations: { now: ['Возьмите паузу', 'Прогуляйтесь на свежем воздухе'], week: ['Пересмотрите свои обязанности', 'Поговорите с руководством о нагрузке'] } },
      { level: 'high', title: 'Высокий риск выгорания', description: 'Вы находитесь в состоянии сильного выгорания.', recommendations: { now: ['Немедленный отдых', 'Признайте, что вам нужна поддержка'], week: ['Запланируйте полноценный отпуск', 'Обратитесь за профессиональной помощью'], whenToSeekHelp: 'Если вы чувствуете полное безразличие к работе или хроническую усталость.' } },
    ],
  };

  const navigatorConfig = {
    initial_step_id: 'step_1',
    steps: [
      {
        step_id: 'step_1',
        question_text: 'Как вы себя чувствуете прямо сейчас?',
        choices: [
          { choice_id: 'c1', text: 'Мне очень плохо, нужна помощь', next_step_id: 'step_crisis' },
          { choice_id: 'c2', text: 'Чувствую тревогу или панику', next_step_id: 'step_anxiety' },
          { choice_id: 'c3', text: 'У меня нет сил, всё надоело', next_step_id: 'step_exhaustion' },
          { choice_id: 'c4', text: 'В целом нормально, хочу разобраться в себе', next_step_id: 'step_exploration' },
        ],
      },
      {
        step_id: 'step_crisis',
        question_text: 'Вы чувствуете, что не можете контролировать свои действия или боитесь причинить себе вред?',
        choices: [
          { choice_id: 'c5', text: 'Да', result_profile_id: 'support_contact', crisis_trigger: true },
          { choice_id: 'c6', text: 'Нет, но мне очень тяжело', next_step_id: 'step_anxiety' },
        ],
      },
      {
        step_id: 'step_anxiety',
        question_text: 'Ваша тревога связана с конкретным событием или она фоновая?',
        choices: [
          { choice_id: 'c7', text: 'Конкретное событие (работа, отношения)', result_profile_id: 'clarify' },
          { choice_id: 'c8', text: 'Фоновое чувство беспокойства', result_profile_id: 'stabilize_now' },
        ],
      },
      {
        step_id: 'step_exhaustion',
        question_text: 'Как долго вы чувствуете упадок сил?',
        choices: [
          { choice_id: 'c9', text: 'Несколько дней', result_profile_id: 'restore_energy' },
          { choice_id: 'c10', text: 'Больше двух недель', result_profile_id: 'clarify' },
        ],
      },
      {
        step_id: 'step_exploration',
        question_text: 'Какая сфера жизни сейчас волнует вас больше всего?',
        choices: [
          { choice_id: 'c11', text: 'Личные границы и отношения', result_profile_id: 'boundaries' },
          { choice_id: 'c12', text: 'Самореализация и работа', result_profile_id: 'clarify' },
          { choice_id: 'c13', text: 'Эмоциональное состояние', result_profile_id: 'stabilize_now' },
        ],
      },
    ],
    result_profiles: [
      {
        id: 'stabilize_now',
        title: 'Фокус на стабилизации',
        description: 'Сейчас ваша главная задача — вернуть себе чувство безопасности и спокойствия.',
        recommendations: {
          articles: ['Как справиться с паникой', 'Техники заземления'],
          exercises: ['Дыхание 4-7-8', 'Мышечная релаксация'],
        },
      },
      {
        id: 'restore_energy',
        title: 'Восстановление ресурса',
        description: 'Похоже, ваши батарейки на нуле. Вам нужно бережное восстановление.',
        recommendations: {
          articles: ['Почему нет сил?', 'Как разрешить себе отдыхать'],
          exercises: ['Аудит ресурсов', 'Дневник приятных событий'],
        },
      },
      {
        id: 'boundaries',
        title: 'Работа с границами',
        description: 'Ваш запрос связан с тем, как выстраивать отношения с собой и окружающими.',
        recommendations: {
          articles: ['Что такое личные границы?', 'Как говорить "нет" без вины'],
          exercises: ['Круги близости', 'Скрипты отказов'],
        },
      },
      {
        id: 'clarify',
        title: 'Прояснение запроса',
        description: 'Ваша ситуация требует более глубокого анализа. Консультация поможет расставить приоритеты.',
        recommendations: {
          articles: ['Как подготовиться к первой сессии', 'С какими запросами работает психолог'],
          resources: ['Чек-лист "Мой запрос"'],
        },
      },
      {
        id: 'support_contact',
        title: 'Экстренная поддержка',
        description: 'Пожалуйста, не оставайтесь наедине со своими переживаниями. Помощь рядом.',
        recommendations: {
          articles: ['Телефоны доверия', 'Куда обратиться в кризисе'],
        },
        cta: {
          text: 'Получить контакты помощи',
          link: '/emergency',
        },
      },
    ],
  };

  const interactives = [
    { id: '11111111-1111-1111-1111-111111111111', type: 'quiz', slug: 'anxiety', title: 'Тест на тревогу', topic_code: 'anxiety', config: anxietyConfig },
    { id: '22222222-2222-2222-2222-222222222222', type: 'quiz', slug: 'burnout', title: 'Проверка выгорания', topic_code: 'burnout', config: burnoutConfig },
    { id: '33333333-3333-3333-3333-333333333333', type: 'navigator', slug: 'state-navigator', title: 'Навигатор состояния', topic_code: null, config: navigatorConfig },
    { id: '44444444-4444-4444-4444-444444444444', type: 'thermometer', slug: 'resource-thermometer', title: 'Термометр ресурса', topic_code: null, config: null },
    { id: '55555555-5555-5555-5555-555555555555', type: 'boundaries', slug: 'default', title: 'Скрипты границ', topic_code: 'boundaries', config: boundariesConfig },
  ];

  for (const interactive of interactives) {
    await prisma.interactiveDefinition.upsert({
      where: { interactive_type_slug: { interactive_type: interactive.type as any, slug: interactive.slug } },
      update: { title: interactive.title, topic_code: interactive.topic_code, definition_json: interactive.config as any },
      create: {
        id: interactive.id,
        interactive_type: interactive.type as any,
        slug: interactive.slug,
        title: interactive.title,
        topic_code: interactive.topic_code,
        status: 'published',
        definition_json: interactive.config as any,
        published_at: new Date(),
      },
    });
  }
  console.log('Interactive Definitions seeded.');

  // --- Services ---
  const services = [
    {
      slug: 'intro-session',
      title: 'Ознакомительная сессия',
      description_markdown: 'Короткая встреча, чтобы прояснить запрос и понять, как я могу помочь.',
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
      slug: 'full-session',
      title: 'Полноценная консультация',
      description_markdown: 'Глубокая работа с запросом в бережном темпе и с опорой на ваши ресурсы.',
      format: 'hybrid',
      offline_address: 'Москва, м. Черкизовская (точный адрес уточняется после записи)',
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
      slug: 'offline-session',
      title: 'Офлайн-встреча',
      description_markdown: 'Личная встреча в кабинете в спокойной атмосфере и без спешки.',
      format: 'offline',
      offline_address: 'Москва, м. Черкизовская',
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
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service as any,
      create: service as any,
    });
  }
  console.log('Services seeded.');

  // --- Pages ---
  const pages = [
    { slug: 'about', title: 'О психологе', body: 'Я — профессиональный психолог. Помогаю справиться с тревогой и выгоранием. Мои услуги включают индивидуальные консультации.' },
    { slug: 'how-it-works', title: 'Как проходит работа', body: 'Процесс консультации выстроен максимально бережно и понятно. Вы можете ознакомиться с часто задаваемыми вопросами ниже.' },
    { slug: 'privacy', title: 'Политика конфиденциальности', body: 'Мы заботимся о ваших данных.' },
    { slug: 'personal-data-consent', title: 'Согласие на обработку персональных данных', body: 'Вы соглашаетесь на обработку данных.' },
    { slug: 'offer', title: 'Публичная оферта', body: 'Условия оказания услуг.' },
    { slug: 'disclaimer', title: 'Отказ от ответственности', body: 'Информация на сайте не является медицинской консультацией.' },
    { slug: 'cookies', title: 'Политика использования cookies', body: 'Мы используем cookies.' },
    { slug: 'emergency', title: 'Экстренная помощь', body: 'Внимание: наши услуги не являются службой экстренной помощи. Если вам нужна срочная помощь, позвоните по номеру 112 или на горячую линию: [8-800-2000-122](tel:88002000122).' },
  ];

  for (const page of pages) {
    await prisma.contentItem.upsert({
      where: { content_type_slug: { content_type: 'page', slug: page.slug } },
      update: { title: page.title, body_markdown: page.body },
      create: {
        content_type: 'page',
        slug: page.slug,
        title: page.title,
        body_markdown: page.body,
        status: 'published',
        published_at: new Date(),
        author_user_id: owner.id,
      },
    });
  }
  console.log('Pages seeded.');

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
