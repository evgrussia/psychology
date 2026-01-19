export type SeedInteractiveDefinition = {
  id: string;
  interactive_type: 'quiz' | 'navigator' | 'thermometer' | 'boundaries' | 'prep' | 'ritual';
  slug: string;
  title: string;
  topic_code?: string | null;
  config: any;
};

const anxietyConfig = {
  disclaimer:
    'Результат носит информационный характер и не является медицинским диагнозом. Если вам сейчас небезопасно — обратитесь за экстренной помощью.',
  questions: [
    {
      id: 'q1',
      text: 'Как часто вас беспокоило чувство тревоги или напряжения?',
      options: [
        { value: 0, text: 'совсем нет' },
        { value: 1, text: 'несколько дней' },
        { value: 2, text: 'больше половины дней' },
        { value: 3, text: 'почти каждый день' },
      ],
    },
    {
      id: 'q2',
      text: 'Как часто вы не могли перестать беспокоиться или контролировать тревогу?',
      options: [
        { value: 0, text: 'совсем нет' },
        { value: 1, text: 'несколько дней' },
        { value: 2, text: 'больше половины дней' },
        { value: 3, text: 'почти каждый день' },
      ],
    },
    {
      id: 'q3',
      text: 'Как часто вы слишком много волновались по разным поводам?',
      options: [
        { value: 0, text: 'совсем нет' },
        { value: 1, text: 'несколько дней' },
        { value: 2, text: 'больше половины дней' },
        { value: 3, text: 'почти каждый день' },
      ],
    },
    {
      id: 'q4',
      text: 'Как часто вам было трудно расслабиться?',
      options: [
        { value: 0, text: 'совсем нет' },
        { value: 1, text: 'несколько дней' },
        { value: 2, text: 'больше половины дней' },
        { value: 3, text: 'почти каждый день' },
      ],
    },
    {
      id: 'q5',
      text: 'Как часто вы легко раздражались или злились?',
      options: [
        { value: 0, text: 'совсем нет' },
        { value: 1, text: 'несколько дней' },
        { value: 2, text: 'больше половины дней' },
        { value: 3, text: 'почти каждый день' },
      ],
    },
    {
      id: 'q6',
      text: 'Как часто вы испытывали страх, что может случиться что-то ужасное?',
      options: [
        { value: 0, text: 'совсем нет' },
        { value: 1, text: 'несколько дней' },
        { value: 2, text: 'больше половины дней' },
        { value: 3, text: 'почти каждый день' },
      ],
    },
    {
      id: 'q7',
      text: 'Как часто вам было трудно концентрироваться из-за тревоги?',
      options: [
        { value: 0, text: 'совсем нет' },
        { value: 1, text: 'несколько дней' },
        { value: 2, text: 'больше половины дней' },
        { value: 3, text: 'почти каждый день' },
      ],
    },
  ],
  thresholds: [
    { level: 'low', minScore: 0, maxScore: 6 },
    { level: 'moderate', minScore: 7, maxScore: 13 },
    { level: 'high', minScore: 14, maxScore: 21 },
  ],
  results: [
    {
      level: 'low',
      title: 'Низкий уровень признаков тревоги',
      description:
        'Похоже, сейчас у вас есть опоры. Если тревога возвращается — это нормально: можно собрать “набор поддержки”.',
      recommendations: {
        now: ['2 минуты дыхания 4–6', 'Заземление 5‑4‑3‑2‑1'],
        week: ['1 короткая запись в дневник эмоций в день', '2 паузы в день по 2 минуты'],
      },
    },
    {
      level: 'moderate',
      title: 'Умеренный уровень признаков тревоги',
      description:
        'Похоже, тревожных сигналов достаточно, чтобы это мешало. Хорошая новость: часто помогают короткие регулярные шаги.',
      recommendations: {
        now: ['Дыхание 4–6', 'Контейнер для мыслей (2 минуты)'],
        week: ['Снизить перегруз на 1 маленький шаг', '1 ABC‑разбор мысли 1–2 раза в неделю'],
      },
    },
    {
      level: 'high',
      title: 'Высокий уровень признаков тревоги',
      description:
        'Похоже, тревога заметно влияет на самочувствие. Это не означает “с вами что-то не так” — просто сейчас может быть нужна дополнительная поддержка.',
      recommendations: {
        now: ['Заземление', 'Связаться с близким, если возможно'],
        week: ['Обсудить поддержку со специалистом', 'Собрать план восстановления на неделю'],
        whenToSeekHelp:
          'Если тревога держится долго, усиливается или есть риск причинить себе вред — пожалуйста, обратитесь за помощью.',
      },
    },
  ],
};

const burnoutConfig = {
  disclaimer:
    'Результат носит информационный характер и не является медицинской диагностикой. В кризисе — экстренная помощь.',
  questions: [
    { id: 'q1', text: 'Как часто вы чувствуете эмоциональное истощение?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
    { id: 'q2', text: 'Как часто вам трудно восстановиться после дня?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
    { id: 'q3', text: 'Как часто вы чувствуете раздражительность/цинизм?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
    { id: 'q4', text: 'Как часто вам сложно начать даже простые задачи?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
    { id: 'q5', text: 'Как часто отдых “не помогает”?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
    { id: 'q6', text: 'Как часто вы избегаете людей, чтобы “не тратить энергию”?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
    { id: 'q7', text: 'Как часто вы чувствуете вину за “недостаточно”?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
    { id: 'q8', text: 'Как часто тело сигналит усталостью (сон/болит/простуды)?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
    { id: 'q9', text: 'Как часто вы чувствуете “бессмысленность”?', options: [{ value: 0, text: 'никогда' }, { value: 1, text: 'иногда' }, { value: 2, text: 'часто' }, { value: 3, text: 'почти постоянно' }] },
  ],
  thresholds: [
    { level: 'low', minScore: 0, maxScore: 8 },
    { level: 'moderate', minScore: 9, maxScore: 17 },
    { level: 'high', minScore: 18, maxScore: 27 },
  ],
  results: [
    {
      level: 'low',
      title: 'Низкий уровень признаков выгорания',
      description: 'Похоже, ресурс есть. Важно поддерживать баланс и паузы.',
      recommendations: { now: ['Сделайте 1 паузу на 2 минуты'], week: ['Запланируйте 1 восстановительный слот'] },
    },
    {
      level: 'moderate',
      title: 'Умеренный уровень признаков выгорания',
      description: 'Есть сигналы перегруза. Помогают маленькие шаги восстановления и границ.',
      recommendations: { now: ['Снизьте одну маленькую нагрузку сегодня'], week: ['Чек‑лист границ на неделю', 'Сон: ритуал 10 минут'] },
    },
    {
      level: 'high',
      title: 'Высокий уровень признаков выгорания',
      description: 'Похоже, вы в сильном перегрузе. Возможно, нужна дополнительная поддержка и пересборка нагрузки.',
      recommendations: {
        now: ['Пауза и вода', 'Связаться с поддерживающим человеком'],
        week: ['План восстановления на 7 дней', 'Обсудить ситуацию со специалистом'],
        whenToSeekHelp: 'Если состояние ухудшается или появляются опасные мысли — используйте экстренную помощь.',
      },
    },
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
        { choice_id: 'c4', text: 'В целом нормально, хочу разобраться', next_step_id: 'step_exploration' },
      ],
    },
    {
      step_id: 'step_crisis',
      question_text: 'Есть ли риск причинить себе вред или вы в опасности?',
      choices: [
        { choice_id: 'c5', text: 'Да', result_profile_id: 'support_contact', crisis_trigger: true, crisis_trigger_type: 'risk' },
        { choice_id: 'c6', text: 'Нет, но очень тяжело', next_step_id: 'step_anxiety' },
      ],
    },
    {
      step_id: 'step_anxiety',
      question_text: 'Тревога больше про мысли или про тело?',
      choices: [
        { choice_id: 'c7', text: 'Про мысли', result_profile_id: 'stabilize_now' },
        { choice_id: 'c8', text: 'Про тело', result_profile_id: 'stabilize_now' },
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
      question_text: 'Какая сфера волнует больше всего?',
      choices: [
        { choice_id: 'c11', text: 'Границы и отношения', result_profile_id: 'boundaries' },
        { choice_id: 'c12', text: 'Работа и нагрузка', result_profile_id: 'clarify' },
        { choice_id: 'c13', text: 'Эмоции и состояние', result_profile_id: 'stabilize_now' },
      ],
    },
  ],
  result_profiles: [
    {
      id: 'stabilize_now',
      title: 'Стабилизация сейчас',
      description: 'Сейчас важно вернуть себе чувство опоры и снизить напряжение.',
      recommendations: { exercises: ['Дыхание 4–6', 'Заземление 5‑4‑3‑2‑1'] },
    },
    {
      id: 'restore_energy',
      title: 'Восстановление ресурса',
      description: 'Похоже, вы устали. Подойдёт мягкий темп и паузы.',
      recommendations: { exercises: ['Термометр ресурса', 'Один слот отдыха'] },
    },
    {
      id: 'boundaries',
      title: 'Границы и контакт',
      description: 'Можно начать с небольших скриптов и паузы перед ответом.',
      recommendations: { exercises: ['Скрипты границ', 'Чек‑лист “границы на неделю”'] },
    },
    {
      id: 'clarify',
      title: 'Прояснение запроса',
      description: 'Похоже, полезно глубже разобрать контекст. На встрече можно собрать персональный план.',
      recommendations: { resources: ['Подготовка к первой консультации'] },
    },
    {
      id: 'support_contact',
      title: 'Экстренная поддержка',
      description: 'Пожалуйста, не оставайтесь с этим в одиночку. Помощь рядом.',
      recommendations: { resources: ['Экстренная помощь'] },
      cta: { text: 'Открыть экстренную помощь', link: '/emergency' },
    },
  ],
};

const thermometerConfig = {
  intro: 'Быстрая проверка: как вы сейчас по энергии, напряжению и опоре.',
  scales: [
    { id: 'energy', title: 'Энергия', minLabel: '0', maxLabel: '10', minValue: 0, maxValue: 10 },
    { id: 'tension', title: 'Напряжение', minLabel: '0', maxLabel: '10', minValue: 0, maxValue: 10 },
    { id: 'support', title: 'Опора', minLabel: '0', maxLabel: '10', minValue: 0, maxValue: 10 },
  ],
  thresholds: [
    { level: 'low', minScore: 0, maxScore: 12 },
    { level: 'moderate', minScore: 13, maxScore: 20 },
    { level: 'high', minScore: 21, maxScore: 30 },
  ],
  results: [
    {
      level: 'low',
      title: 'Ресурс на минимуме',
      description: 'Сейчас важно снизить нагрузку и найти маленькие точки опоры.',
      recommendations: {
        now: ['2–3 медленных вдоха', 'Вода', 'Снять одну не срочную задачу'],
        nextDays: ['10 минут “тихого времени”', 'Попросить о помощи'],
        whenToSeekHelp: 'Если состояние держится больше 2 недель — обсудите со специалистом.',
      },
      ctaText: 'Получить план в Telegram',
    },
    {
      level: 'moderate',
      title: 'Ресурс есть, но нужна забота',
      description: 'Вы держитесь, но психике и телу полезен более мягкий темп.',
      recommendations: { now: ['Пауза 2–5 минут', 'Один маленький шаг'], nextDays: ['Одна восстановительная активность'] },
      ctaText: 'Сохранить в Telegram',
    },
    {
      level: 'high',
      title: 'Ресурс относительно устойчив',
      description: 'Похоже, сейчас у вас есть опора. Можно аккуратно укреплять поддержку.',
      recommendations: { now: ['Отметьте, что помогает'], nextDays: ['Короткий ритуал восстановления 2–5 минут'] },
      ctaText: 'План на 7 дней в Telegram',
    },
  ],
};

const boundariesConfig = {
  scenarios: [
    { id: 'work', name: 'Работа', description: 'Ситуации на работе' },
    { id: 'family', name: 'Семья', description: 'Семейные ситуации' },
    { id: 'partner', name: 'Партнёр', description: 'Разговор в отношениях' },
    { id: 'unsafe', name: 'Небезопасная ситуация', is_unsafe: true },
  ],
  tones: [
    { id: 'soft', name: 'Мягко' },
    { id: 'firm', name: 'Твёрдо' },
  ],
  goals: [
    { id: 'refuse', name: 'Отказать' },
    { id: 'ask', name: 'Попросить о помощи' },
    { id: 'pause', name: 'Взять паузу' },
  ],
  matrix: [
    {
      scenario_id: 'work',
      tone_id: 'soft',
      goal_id: 'refuse',
      variants: [
        { variant_id: 'script_work_refuse_soft_v1', text: 'Сейчас у меня не получится, спасибо, что спросили.' },
        { variant_id: 'script_work_refuse_soft_v2', text: 'Я понимаю важность, но сейчас не могу взять это на себя.' },
      ],
    },
    {
      scenario_id: 'work',
      tone_id: 'firm',
      goal_id: 'refuse',
      variants: [
        { variant_id: 'script_work_refuse_firm_v1', text: 'Не смогу. У меня другие приоритеты на сегодня.' },
        { variant_id: 'script_work_refuse_firm_v2', text: 'Я не беру эту задачу. Давайте обсудим альтернативы.' },
      ],
    },
    {
      scenario_id: 'family',
      tone_id: 'soft',
      goal_id: 'pause',
      variants: [
        { variant_id: 'script_family_pause_soft_v1', text: 'Мне нужно время подумать. Я вернусь с ответом чуть позже.' },
        { variant_id: 'script_family_pause_soft_v2', text: 'Давай обсудим это позже, когда я немного выдохну.' },
      ],
    },
    {
      scenario_id: 'partner',
      tone_id: 'soft',
      goal_id: 'ask',
      variants: [
        { variant_id: 'script_partner_ask_soft_v1', text: 'Мне сейчас нужна поддержка. Можешь просто побыть рядом 10 минут?' },
        { variant_id: 'script_partner_ask_soft_v2', text: 'Я устал(а). Можешь взять на себя одну вещь сегодня?' },
      ],
    },
  ],
  safety_block: {
    text: 'Если продолжают давить: повторите коротко, предложите вернуться позже, завершите разговор. Если ситуация небезопасна — приоритет безопасность и внешняя поддержка.',
  },
};

const prepConfig = {
  intro:
    'Короткий мастер, который поможет мягко сформулировать запрос и подготовиться к первой встрече. Без обязательного текста.',
  steps: [
    {
      id: 's1',
      title: 'С чем вы приходите?',
      description: 'Выберите один или несколько вариантов.',
      options: [
        { id: 'anxiety', text: 'Тревога, паника' },
        { id: 'burnout', text: 'Усталость, выгорание' },
        { id: 'relationships', text: 'Отношения, конфликты' },
        { id: 'boundaries', text: 'Границы, “не могу отказать”' },
        { id: 'selfesteem', text: 'Самооценка, самокритика' },
      ],
    },
    {
      id: 's2',
      title: 'Что вы хотите получить от встречи?',
      options: [
        { id: 'clarity', text: 'Прояснить, что со мной происходит' },
        { id: 'plan', text: 'Собрать план действий' },
        { id: 'support', text: 'Поддержку и опору' },
        { id: 'skills', text: 'Навыки и техники' },
      ],
    },
    {
      id: 's3',
      title: 'Какой темп вам комфортен?',
      options: [
        { id: 'slow', text: 'Мягко и без спешки' },
        { id: 'structured', text: 'Структурно и по шагам' },
        { id: 'mixed', text: 'Смешанный' },
      ],
    },
    {
      id: 's4',
      title: 'Есть ли важные ограничения?',
      options: [
        { id: 'time', text: 'Ограничено время/ресурс' },
        { id: 'privacy', text: 'Важно про конфиденциальность' },
        { id: 'online', text: 'Только онлайн' },
        { id: 'offline', text: 'Хочу офлайн (если возможно)' },
      ],
    },
    {
      id: 's5',
      title: 'Что поможет вам почувствовать себя безопаснее?',
      options: [
        { id: 'rules', text: 'Понять правила и границы' },
        { id: 'process', text: 'Понимать план встречи' },
        { id: 'questions', text: 'Задать пару вопросов заранее' },
      ],
      optionalNoteLabel: 'Можно добавить заметку для себя (не обязательно)',
    },
  ],
  result: {
    title: 'Ваш черновик подготовки',
    description: 'Можно использовать как подсказку для первой встречи. Если хочется — сохраним план в Telegram.',
    checklist: [
      'Сформулировать 1–2 главные темы (можно коротко)',
      'Подумать, какой результат вы хотите (прояснение / план / поддержка)',
      'Подготовить 1–2 вопроса про процесс и конфиденциальность',
      'Выбрать комфортный формат (онлайн/офлайн) и время',
    ],
    ctaText: 'Сохранить в Telegram',
  },
};

function ritualConfig(params: { why: string; totalSeconds: number; steps: Array<{ id: string; title: string; content: string; durationSeconds?: number }> }) {
  return {
    why: params.why,
    totalDurationSeconds: params.totalSeconds,
    steps: params.steps,
  };
}

export const seedInteractives: SeedInteractiveDefinition[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    interactive_type: 'quiz',
    slug: 'anxiety',
    title: 'Тест на тревогу',
    topic_code: 'anxiety',
    config: anxietyConfig,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    interactive_type: 'quiz',
    slug: 'burnout',
    title: 'Проверка выгорания',
    topic_code: 'burnout',
    config: burnoutConfig,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    interactive_type: 'navigator',
    slug: 'state-navigator',
    title: 'Навигатор состояния',
    topic_code: null,
    config: navigatorConfig,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    interactive_type: 'thermometer',
    slug: 'resource-thermometer',
    title: 'Термометр ресурса',
    topic_code: null,
    config: thermometerConfig,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    interactive_type: 'boundaries',
    slug: 'default',
    title: 'Скрипты границ',
    topic_code: 'boundaries',
    config: boundariesConfig,
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    interactive_type: 'prep',
    slug: 'consultation-prep',
    title: 'Подготовка к первой консультации',
    topic_code: null,
    config: prepConfig,
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    interactive_type: 'ritual',
    slug: 'breathing-ritual',
    title: 'Мини‑ритуал: дыхание 4–7–8',
    topic_code: 'anxiety',
    config: ritualConfig({
      why: 'Помогает снизить напряжение и вернуть фокус в тело.',
      totalSeconds: 180,
      steps: [
        { id: 'step_1', title: 'Поза', content: 'Сядьте удобно. Почувствуйте опору стоп о пол.', durationSeconds: 45 },
        { id: 'step_2', title: 'Дыхание 4–7–8', content: 'Вдох 4 → задержка 7 → выдох 8. Повторите 4 раза.', durationSeconds: 90 },
        { id: 'step_3', title: 'Завершение', content: 'Отметьте: “я сделал(а) маленький шаг” и сделайте ещё один спокойный вдох.', durationSeconds: 45 },
      ],
    }),
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    interactive_type: 'ritual',
    slug: 'grounding-ritual',
    title: 'Мини‑ритуал: заземление 5‑4‑3‑2‑1',
    topic_code: 'panic',
    config: ritualConfig({
      why: 'Помогает вернуть внимание в настоящий момент через органы чувств.',
      totalSeconds: 180,
      steps: [
        { id: 's1', title: 'Оглядеться', content: 'Назовите 5 предметов, которые видите.', durationSeconds: 60 },
        { id: 's2', title: 'Тело', content: 'Отметьте 4 ощущения тела (стопы, спина, руки).', durationSeconds: 60 },
        { id: 's3', title: 'Звуки', content: 'Найдите 3 звука вокруг и назовите их.', durationSeconds: 60 },
      ],
    }),
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    interactive_type: 'ritual',
    slug: 'sleep-ritual',
    title: 'Мини‑ритуал: выдох перед сном',
    topic_code: 'stress',
    config: ritualConfig({
      why: 'Помогает телу переключиться в более спокойный режим перед сном.',
      totalSeconds: 240,
      steps: [
        { id: 's1', title: 'Свет и экран', content: 'Снизьте яркость экрана. Сделайте один маленький шаг к тишине.', durationSeconds: 60 },
        { id: 's2', title: 'Длинный выдох', content: 'Сделайте 8 длинных выдохов. Вдох естественный, выдох чуть длиннее.', durationSeconds: 120 },
        { id: 's3', title: 'Опора', content: 'Назовите 1 вещь, за которую вы можете поблагодарить себя сегодня.', durationSeconds: 60 },
      ],
    }),
  },
];

