import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Heart, ArrowRight, BookOpen, Play, FileText, ChevronLeft, Cloud, Zap, Shield, Sparkles, Target, TrendingUp, Smile, type LucideIcon } from 'lucide-react';

interface TopicDetailPageProps {
  slug?: string | null;
  onBack?: () => void;
}

// Полные данные тем хранятся локально до появления API endpoint GET /content/topics/:slug
interface TopicData {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  normalizingText: string;
  signs: Array<{ title: string; description: string }>;
  exercises: Array<{ type: string; title: string; description: string; duration: string; icon: LucideIcon }>;
  approach: {
    description: string;
    methods: Array<{ title: string; subtitle: string }>;
  };
  firstMeeting: string[];
  resources: Array<{ title: string; type: string; time: string }>;
}

const topicsData: Record<string, TopicData> = {
  'anxiety': {
    title: 'Тревога',
    subtitle: 'Тревога — это нормальная реакция на неопределённость',
    icon: AlertCircle,
    gradient: 'from-[#A8B5FF] to-[#C8F5E8]',
    normalizingText: 'Тревога — это естественная защитная реакция организма на потенциальную опасность. Она помогала нашим предкам выживать. Но иногда тревога становится слишком сильной или появляется без реальной угрозы, мешая жить полноценной жизнью. Это не значит, что с вами что-то не так — это значит, что ваша система тревоги стала слишком чувствительной, и мы можем научиться её регулировать.',
    signs: [
      { title: 'Постоянное беспокойство', description: 'Сложно переключиться с тревожных мыслей, они возвращаются снова и снова' },
      { title: 'Физические симптомы', description: 'Учащённое сердцебиение, потливость, напряжение в теле, проблемы со сном' },
      { title: 'Избегание ситуаций', description: 'Желание избегать людей, мест или действий, которые вызывают тревогу' },
      { title: 'Сложности с концентрацией', description: 'Трудно сосредоточиться на работе или повседневных делах' },
      { title: 'Ожидание худшего', description: 'Постоянное предчувствие, что что-то плохое вот-вот произойдёт' },
    ],
    exercises: [
      { type: 'Упражнение', title: 'Дыхание 4-7-8', description: 'Простая техника для быстрого снижения тревоги', duration: '5 мин', icon: Play },
      { type: 'Чек-лист', title: 'Триггеры тревоги', description: 'Отследите, что запускает вашу тревогу', duration: '10 мин', icon: FileText },
      { type: 'Статья', title: 'Понимание тревоги', description: 'Как работает тревога и почему она возникает', duration: '7 мин чтения', icon: BookOpen },
    ],
    approach: {
      description: 'Я использую интегративный подход, объединяя техники когнитивно-поведенческой терапии (КПТ), практики осознанности и телесно-ориентированные методы. Мы не будем просто «бороться» с тревогой — мы научимся её понимать, регулировать и использовать как сигнал для заботы о себе.',
      methods: [
        { title: 'Техники быстрой помощи', subtitle: 'Для моментов острой тревоги' },
        { title: 'Работа с мыслями', subtitle: 'Изменение тревожных паттернов' },
        { title: 'Телесные практики', subtitle: 'Работа с физическими проявлениями' },
        { title: 'Долгосрочные изменения', subtitle: 'Создание устойчивости к стрессу' },
      ],
    },
    firstMeeting: [
      'Познакомимся и создадим безопасное пространство для разговора',
      'Обсудим, как проявляется ваша тревога и что вас больше всего беспокоит',
      'Начнём с простой техники, которую вы сможете использовать сразу после сессии',
      'Наметим план работы, который подходит именно вам',
    ],
    resources: [
      { title: 'Как справиться с паническими атаками', type: 'Статья', time: '5 мин' },
      { title: 'Техники заземления при тревоге', type: 'Видео', time: '8 мин' },
      { title: 'Дневник тревожных мыслей', type: 'Чек-лист', time: '—' },
    ],
  },
  'depression': {
    title: 'Депрессия',
    subtitle: 'Депрессия — это не слабость характера, а состояние, требующее внимания',
    icon: Cloud,
    gradient: 'from-[#C8F5E8] to-[#7FD99A]',
    normalizingText: 'Депрессия — это серьёзное состояние, которое затрагивает миллионы людей. Она не является признаком слабости или недостатка силы воли. Депрессия имеет биологические, психологические и социальные причины, и с ней можно успешно работать при правильном подходе.',
    signs: [
      { title: 'Постоянная усталость', description: 'Ощущение истощения даже после отдыха, всё требует огромных усилий' },
      { title: 'Потеря интереса', description: 'То, что раньше радовало, теперь не вызывает никаких эмоций' },
      { title: 'Изменения сна', description: 'Бессонница или, наоборот, постоянное желание спать' },
      { title: 'Негативные мысли', description: 'Самокритика, чувство вины, ощущение безнадёжности' },
      { title: 'Изоляция', description: 'Желание избегать общения, трудно поддерживать контакты' },
    ],
    exercises: [
      { type: 'Упражнение', title: 'Поведенческая активация', description: 'Маленькие шаги для возвращения энергии', duration: '10 мин', icon: Play },
      { type: 'Чек-лист', title: 'Трекер настроения', description: 'Отслеживайте своё состояние день за днём', duration: '5 мин', icon: FileText },
      { type: 'Статья', title: 'Как устроена депрессия', description: 'Понимание механизмов депрессии', duration: '8 мин чтения', icon: BookOpen },
    ],
    approach: {
      description: 'При работе с депрессией я использую когнитивно-поведенческую терапию, поведенческую активацию и элементы межличностной терапии. Мы будем работать постепенно, уважая ваш темп и ресурсы.',
      methods: [
        { title: 'Поведенческая активация', subtitle: 'Возвращение к приятным делам' },
        { title: 'Работа с мыслями', subtitle: 'Изменение негативных паттернов' },
        { title: 'Самосострадание', subtitle: 'Развитие доброты к себе' },
        { title: 'Восстановление связей', subtitle: 'Работа с изоляцией' },
      ],
    },
    firstMeeting: [
      'Познакомимся в безопасной обстановке',
      'Поговорим о том, как депрессия проявляется в вашей жизни',
      'Оценим вместе, какая поддержка вам нужна',
      'Составим план маленьких шагов',
    ],
    resources: [
      { title: 'Когда всё кажется бессмысленным', type: 'Статья', time: '6 мин' },
      { title: 'Практика благодарности', type: 'Упражнение', time: '5 мин' },
      { title: 'План на плохой день', type: 'Чек-лист', time: '—' },
    ],
  },
  'stress': {
    title: 'Стресс',
    subtitle: 'Стресс можно научиться регулировать',
    icon: Zap,
    gradient: 'from-[#FFD4B5] to-[#FFC97F]',
    normalizingText: 'Стресс — это естественная реакция организма на требования окружающей среды. Небольшой стресс может быть полезен и мотивирует нас действовать. Но хронический стресс истощает ресурсы организма и негативно влияет на здоровье. Хорошая новость — управлению стрессом можно научиться.',
    signs: [
      { title: 'Физическое напряжение', description: 'Головные боли, напряжение в мышцах, проблемы с пищеварением' },
      { title: 'Раздражительность', description: 'Вспышки гнева, нетерпимость к мелочам' },
      { title: 'Проблемы со сном', description: 'Трудно заснуть, частые пробуждения, усталость утром' },
      { title: 'Ощущение перегрузки', description: 'Чувство, что всё слишком много, невозможно всё успеть' },
      { title: 'Снижение продуктивности', description: 'Трудно сосредоточиться, забывчивость' },
    ],
    exercises: [
      { type: 'Упражнение', title: 'Быстрая релаксация', description: 'Снятие напряжения за 5 минут', duration: '5 мин', icon: Play },
      { type: 'Чек-лист', title: 'Аудит стрессоров', description: 'Найдите источники стресса', duration: '15 мин', icon: FileText },
      { type: 'Статья', title: 'Стресс и тело', description: 'Как стресс влияет на здоровье', duration: '6 мин чтения', icon: BookOpen },
    ],
    approach: {
      description: 'Я помогаю клиентам развивать навыки стресс-менеджмента: техники релаксации, тайм-менеджмент, установление границ. Мы также работаем над изменением отношения к стрессовым ситуациям.',
      methods: [
        { title: 'Техники релаксации', subtitle: 'Быстрое снятие напряжения' },
        { title: 'Управление временем', subtitle: 'Приоритизация и границы' },
        { title: 'Когнитивная переоценка', subtitle: 'Изменение отношения к стрессу' },
        { title: 'Восстановление', subtitle: 'Создание ресурсов' },
      ],
    },
    firstMeeting: [
      'Обсудим ваши источники стресса',
      'Оценим текущий уровень стресса',
      'Изучим одну технику быстрой помощи',
      'Определим приоритеты для работы',
    ],
    resources: [
      { title: 'Стресс-менеджмент на каждый день', type: 'Статья', time: '7 мин' },
      { title: 'Прогрессивная мышечная релаксация', type: 'Аудио', time: '15 мин' },
      { title: 'Еженедельный обзор', type: 'Чек-лист', time: '—' },
    ],
  },
  'burnout': {
    title: 'Выгорание',
    subtitle: 'Выгорание — это сигнал о необходимости изменений',
    icon: Zap,
    gradient: 'from-[#FFC97F] to-[#FFD4B5]',
    normalizingText: 'Профессиональное и эмоциональное выгорание — это состояние физического и эмоционального истощения, вызванное длительным стрессом. Это не лень и не слабость — это серьёзный сигнал о том, что баланс между расходом и восполнением ресурсов нарушен.',
    signs: [
      { title: 'Хроническая усталость', description: 'Истощение, которое не проходит после отдыха' },
      { title: 'Цинизм и отстранённость', description: 'Потеря смысла в работе, негативное отношение' },
      { title: 'Снижение эффективности', description: 'Всё занимает больше времени, результаты хуже' },
      { title: 'Физические симптомы', description: 'Частые болезни, головные боли, бессонница' },
      { title: 'Эмоциональная опустошённость', description: 'Чувство, что нечего дать другим' },
    ],
    exercises: [
      { type: 'Упражнение', title: 'Аудит энергии', description: 'Что забирает и что даёт энергию', duration: '15 мин', icon: Play },
      { type: 'Чек-лист', title: 'Признаки выгорания', description: 'Определите стадию выгорания', duration: '10 мин', icon: FileText },
      { type: 'Статья', title: 'Восстановление после выгорания', description: 'Путь к балансу', duration: '9 мин чтения', icon: BookOpen },
    ],
    approach: {
      description: 'Работа с выгоранием включает восстановление ресурсов, пересмотр приоритетов, установление границ и создание устойчивых паттернов работы и отдыха.',
      methods: [
        { title: 'Восстановление ресурсов', subtitle: 'Первоочередные меры' },
        { title: 'Границы и приоритеты', subtitle: 'Защита времени и энергии' },
        { title: 'Смысл и мотивация', subtitle: 'Возвращение интереса' },
        { title: 'Профилактика', subtitle: 'Устойчивые привычки' },
      ],
    },
    firstMeeting: [
      'Оценим степень выгорания',
      'Определим срочные меры поддержки',
      'Найдём источники восстановления',
      'Составим план возвращения баланса',
    ],
    resources: [
      { title: 'Первые шаги при выгорании', type: 'Статья', time: '6 мин' },
      { title: 'Медитация восстановления', type: 'Аудио', time: '12 мин' },
      { title: 'Баланс работы и отдыха', type: 'Чек-лист', time: '—' },
    ],
  },
  'relationships': {
    title: 'Отношения',
    subtitle: 'Здоровые отношения строятся на понимании и уважении',
    icon: Heart,
    gradient: 'from-[#FFB5C5] to-[#FFD4B5]',
    normalizingText: 'Отношения — это одна из важнейших сфер нашей жизни, и трудности в них абсолютно нормальны. Конфликты, недопонимание, изменения в отношениях — всё это часть человеческого опыта. С правильной поддержкой можно научиться строить более глубокие и гармоничные связи.',
    signs: [
      { title: 'Частые конфликты', description: 'Ссоры по одним и тем же поводам, невозможность договориться' },
      { title: 'Эмоциональная дистанция', description: 'Ощущение отдалённости, недостаток близости' },
      { title: 'Проблемы с доверием', description: 'Трудно открыться, страх уязвимости' },
      { title: 'Созависимость', description: 'Потеря себя в отношениях, чрезмерная фокусировка на партнёре' },
      { title: 'Сложности с коммуникацией', description: 'Трудно выразить свои чувства и потребности' },
    ],
    exercises: [
      { type: 'Упражнение', title: 'Активное слушание', description: 'Техники для лучшего понимания', duration: '10 мин', icon: Play },
      { type: 'Чек-лист', title: 'Языки любви', description: 'Как вы выражаете любовь', duration: '15 мин', icon: FileText },
      { type: 'Статья', title: 'Привязанность и отношения', description: 'Как детский опыт влияет на отношения', duration: '8 мин чтения', icon: BookOpen },
    ],
    approach: {
      description: 'В работе над отношениями я помогаю развивать навыки коммуникации, понимать паттерны привязанности и создавать более глубокую эмоциональную связь.',
      methods: [
        { title: 'Коммуникация', subtitle: 'Как говорить и слушать' },
        { title: 'Паттерны привязанности', subtitle: 'Понимание своего стиля' },
        { title: 'Разрешение конфликтов', subtitle: 'Конструктивные способы' },
        { title: 'Интимность', subtitle: 'Эмоциональная близость' },
      ],
    },
    firstMeeting: [
      'Поговорим о ваших отношениях и трудностях',
      'Определим паттерны, которые хотите изменить',
      'Обсудим ваши потребности в отношениях',
      'Наметим направление работы',
    ],
    resources: [
      { title: 'Как говорить о сложном', type: 'Статья', time: '7 мин' },
      { title: 'Я-высказывания', type: 'Упражнение', time: '10 мин' },
      { title: 'Что важно в отношениях', type: 'Чек-лист', time: '—' },
    ],
  },
  'boundaries': {
    title: 'Границы',
    subtitle: 'Здоровые границы — основа уважения к себе и другим',
    icon: Shield,
    gradient: 'from-[#7FD99A] to-[#C8F5E8]',
    normalizingText: 'Умение устанавливать границы — это навык, который можно развить. Границы защищают нашу энергию, время и эмоциональное благополучие. Говорить «нет» — это не эгоизм, а забота о себе, которая в конечном счёте делает нас лучшими партнёрами, друзьями и коллегами.',
    signs: [
      { title: 'Трудно говорить "нет"', description: 'Соглашаетесь на то, что не хотите, из страха отказать' },
      { title: 'Чувство вины', description: 'Вина за то, что заботитесь о своих потребностях' },
      { title: 'Истощение', description: 'Постоянно отдаёте больше, чем получаете' },
      { title: 'Обида', description: 'Накапливается обида на других за нарушение границ' },
      { title: 'Потеря себя', description: 'Не знаете, чего хотите, живёте для других' },
    ],
    exercises: [
      { type: 'Упражнение', title: 'Мои границы', description: 'Определите свои границы', duration: '20 мин', icon: Play },
      { type: 'Чек-лист', title: 'Когда говорить нет', description: 'Ситуации для практики', duration: '10 мин', icon: FileText },
      { type: 'Статья', title: 'Границы без вины', description: 'Как устанавливать границы мягко', duration: '6 мин чтения', icon: BookOpen },
    ],
    approach: {
      description: 'Я помогаю клиентам понять свои границы, научиться их формулировать и отстаивать, справляться с чувством вины и строить более здоровые отношения.',
      methods: [
        { title: 'Осознание границ', subtitle: 'Понять, где мои границы' },
        { title: 'Формулировка', subtitle: 'Как говорить о границах' },
        { title: 'Работа с виной', subtitle: 'Право заботиться о себе' },
        { title: 'Практика', subtitle: 'Постепенное внедрение' },
      ],
    },
    firstMeeting: [
      'Обсудим ситуации, где границы нарушаются',
      'Определим, какие границы для вас важны',
      'Поработаем с чувством вины',
      'Составим план практики',
    ],
    resources: [
      { title: 'Почему границы — это любовь', type: 'Статья', time: '5 мин' },
      { title: 'Скрипты для сложных разговоров', type: 'Упражнение', time: '15 мин' },
      { title: 'Мой список границ', type: 'Чек-лист', time: '—' },
    ],
  },
  'self-esteem': {
    title: 'Самооценка',
    subtitle: 'Принятие себя — это процесс, а не результат',
    icon: Sparkles,
    gradient: 'from-[#FFD4B5] to-[#C8F5E8]',
    normalizingText: 'Самооценка формируется на протяжении всей жизни и может меняться. Низкая самооценка — это не приговор, а паттерн мышления, который можно изменить. Работа над самооценкой — это путь к более аутентичной и удовлетворяющей жизни.',
    signs: [
      { title: 'Самокритика', description: 'Жёсткий внутренний критик, постоянная неудовлетворённость собой' },
      { title: 'Сравнение с другими', description: 'Всегда проигрываете в сравнении с окружающими' },
      { title: 'Страх оценки', description: 'Избегание ситуаций, где можете быть оценены' },
      { title: 'Трудности с решениями', description: 'Не доверяете своему мнению и выбору' },
      { title: 'Перфекционизм', description: 'Ничто не достаточно хорошо, постоянная неудовлетворённость' },
    ],
    exercises: [
      { type: 'Упражнение', title: 'Работа с критиком', description: 'Укрощение внутреннего критика', duration: '15 мин', icon: Play },
      { type: 'Чек-лист', title: 'Мои сильные стороны', description: 'Исследование своих достоинств', duration: '20 мин', icon: FileText },
      { type: 'Статья', title: 'Откуда берётся самооценка', description: 'Как формируется отношение к себе', duration: '7 мин чтения', icon: BookOpen },
    ],
    approach: {
      description: 'Я работаю с самооценкой через изменение негативных убеждений о себе, развитие самосострадания и создание более реалистичного и доброго отношения к себе.',
      methods: [
        { title: 'Негативные убеждения', subtitle: 'Выявление и изменение' },
        { title: 'Самосострадание', subtitle: 'Развитие доброты к себе' },
        { title: 'Внутренний критик', subtitle: 'Работа с самокритикой' },
        { title: 'Аутентичность', subtitle: 'Возвращение к себе' },
      ],
    },
    firstMeeting: [
      'Поговорим о вашем отношении к себе',
      'Определим главные негативные убеждения',
      'Познакомимся с практикой самосострадания',
      'Наметим шаги к изменениям',
    ],
    resources: [
      { title: 'Самосострадание vs самокритика', type: 'Статья', time: '6 мин' },
      { title: 'Письмо себе', type: 'Упражнение', time: '15 мин' },
      { title: 'Ежедневная благодарность себе', type: 'Чек-лист', time: '—' },
    ],
  },
};

// Дефолтные данные для неизвестных тем
const defaultTopicData: TopicData = {
  title: 'Тема',
  subtitle: 'Информация о теме',
  icon: Heart,
  gradient: 'from-[#A8B5FF] to-[#C8F5E8]',
  normalizingText: 'Каждая ситуация уникальна. Обратитесь за профессиональной помощью, чтобы найти подходящее решение.',
  signs: [],
  exercises: [],
  approach: { description: '', methods: [] },
  firstMeeting: [],
  resources: [],
};

export default function TopicDetailPage({ slug, onBack }: TopicDetailPageProps) {
  // Получаем данные темы по slug
  const topic = slug ? topicsData[slug] || defaultTopicData : defaultTopicData;
  const IconComponent = topic.icon;

  return (
    <>
      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm sm:text-base text-[#718096] hover:text-[#A8B5FF] transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Все темы
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${topic.gradient} flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)]`}>
              <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              {topic.title}
            </h1>
            
            <p className="text-lg sm:text-xl text-[#718096] max-w-2xl mx-auto leading-relaxed">
              {topic.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Normalizing Text */}
      {topic.normalizingText && (
        <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 rounded-2xl p-6 sm:p-8 border border-[#C8F5E8]/20"
            >
              <p className="text-base sm:text-lg text-[#2D3748] leading-relaxed">
                {topic.normalizingText}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Signs Section */}
      {topic.signs.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gradient-to-b from-white to-[#FFD4B5]/5">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-3 text-center">
                Признаки {topic.title.toLowerCase()}
              </h2>
              <p className="text-base sm:text-lg text-[#718096] text-center mb-8 sm:mb-12">
                Вы можете узнать себя в одном или нескольких из этих признаков
              </p>

              <div className="space-y-4">
                {topic.signs.map((sign, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:border-[#A8B5FF]/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1">
                          {sign.title}
                        </h3>
                        <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                          {sign.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Try Now Section */}
      {topic.exercises.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-3 text-center">
                Что попробовать прямо сейчас
              </h2>
              <p className="text-base sm:text-lg text-[#718096] text-center mb-8 sm:mb-12">
                Эти инструменты помогут вам начать работу уже сегодня
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {topic.exercises.map((exercise, index) => {
                  const ExerciseIcon = exercise.icon;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-white border-2 border-gray-100 rounded-2xl p-6 text-left hover:border-[#A8B5FF]/30 hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.15)] transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8B5FF]/10 to-[#C8F5E8]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ExerciseIcon className="w-6 h-6 text-[#A8B5FF]" />
                      </div>
                      
                      <div className="text-xs font-medium text-[#A8B5FF] mb-2 uppercase tracking-wide">
                        {exercise.type}
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        {exercise.title}
                      </h3>
                      
                      <p className="text-sm text-[#718096] mb-3 leading-relaxed">
                        {exercise.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#718096]">{exercise.duration}</span>
                        <ArrowRight className="w-4 h-4 text-[#A8B5FF] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* How I Work Section */}
      {topic.approach.description && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gradient-to-b from-[#A8B5FF]/5 to-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-8 sm:mb-12 text-center">
                Как я работаю с темой «{topic.title}»
              </h2>

              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                    Мой подход
                  </h3>
                  <p className="text-base text-[#718096] leading-relaxed mb-4">
                    {topic.approach.description}
                  </p>
                  {topic.approach.methods.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {topic.approach.methods.map((method, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-[#7FD99A]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#2D3748]">{method.title}</p>
                            <p className="text-sm text-[#718096]">{method.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {topic.firstMeeting.length > 0 && (
                  <div className="bg-gradient-to-r from-[#FFD4B5]/10 to-[#FFC97F]/10 border border-[#FFD4B5]/20 rounded-2xl p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Что будет на первой встрече
                    </h3>
                    <ul className="space-y-3 text-base text-[#718096]">
                      {topic.firstMeeting.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#FFD4B5]/30 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-[#2D3748] mt-0.5">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Resources Section */}
      {topic.resources.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-3 text-center">
                Материалы по теме
              </h2>
              <p className="text-base sm:text-lg text-[#718096] text-center mb-8 sm:mb-12">
                Дополнительные ресурсы для углубления в тему
              </p>

              <div className="space-y-3">
                {topic.resources.map((resource, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group w-full bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-[#A8B5FF]/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#C8F5E8]/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#7FD99A]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-semibold text-[#2D3748] mb-1">
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[#718096]">
                          <span>{resource.type}</span>
                          {resource.time !== '—' && (
                            <>
                              <span>•</span>
                              <span>{resource.time}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#718096] group-hover:text-[#A8B5FF] group-hover:translate-x-1 transition-all" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#A8B5FF]/10 via-[#FFD4B5]/10 to-[#C8F5E8]/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#A8B5FF]/20"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)]">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
              Готовы начать работу?
            </h2>
            
            <p className="text-base sm:text-lg text-[#718096] mb-8 max-w-2xl mx-auto leading-relaxed">
              Запишитесь на первую консультацию, и мы вместе найдём способы справиться 
              с трудностями и вернуть спокойствие в вашу жизнь.
            </p>
            
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all">
              Записаться на консультацию
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
