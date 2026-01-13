# Telegram Deep Links Schema — «Эмоциональный баланс»

**Версия:** v1.0  
**Дата:** 2026-01-07  
**Основано на:** `docs/PRD.md`, `docs/research/06-Telegram-Ecosystem.md`, `docs/research/13-Competitive-Research-Psychology-Portals.md`, `docs/Tracking-Plan.md`

---

## 1) Зачем этот документ

Deep links обеспечивают:
- **контекстную навигацию** из сайта в Telegram (сразу к конкретному действию)
- **склейку аналитики** (сайт ↔ Telegram) через `deep_link_id`
- **персонализацию** онбординга и контента без передачи чувствительных данных

**Принцип:** каждый CTA "Telegram" на сайте ведёт на **конкретное действие**, а не на "главную" бота/канала.

---

## 2) Архитектура deep links

### 2.1 Базовая схема

```
https://t.me/BOTNAME?start=<ENCODED_PAYLOAD>
```

или (для каналов):
```
https://t.me/CHANNELNAME?<UTM_PARAMS>
```

### 2.2 Структура `ENCODED_PAYLOAD`

Payload кодируется в **base64url** (без `=` padding) для безопасности и компактности:

```json
{
  "dl": "unique_deep_link_id",
  "f": "flow_type",
  "t": "topic",
  "e": "entity_id",
  "s": "source_page"
}
```

**Поля (все опциональные, кроме `dl` и `f`):**
- `dl` (deep_link_id): UUID или короткий уникальный идентификатор (для склейки аналитики)
- `f` (flow): тип флоу (`plan_7d|save_resource|challenge_7d|concierge|question|prep|ritual|boundaries|favorites`)
- `t` (topic): тема (`anxiety|burnout|relationships|boundaries|selfesteem`)
- `e` (entity_id): ID ресурса/интерактива/квиза (опционально)
- `s` (source): откуда переход (`home|quiz|navigator|landing|article`)

**Пример payload:**
```json
{"dl":"abc123","f":"plan_7d","t":"anxiety","s":"quiz"}
```

Кодируется в: `eyJkbCI6ImFiYzEyMyIsImYiOiJwbGFuXzdkIiwidCI6ImFueGlldHkiLCJzIjoicXVpeiJ9`

Итоговая ссылка:
```
https://t.me/emotional_balance_bot?start=eyJkbCI6ImFiYzEyMyIsImYiOiJwbGFuXzdkIiwidCI6ImFueGlldHkiLCJzIjoicXVpeiJ9
```

---

## 3) Типы флоу (flow_type)

### 3.1 `plan_7d` — План на 7 дней

**Триггер:** результат квиза/навигатора/термометра ресурса → "получить план в Telegram"

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "plan_7d",
  "t": "anxiety",
  "e": "quiz_anxiety_gad7",
  "s": "quiz"
}
```

**Что делает бот:**
1. Приветствие с контекстом: "Вы завершили тест на тревогу"
2. Онбординг (30–60 сек): частота сообщений
3. Выдача первого шага плана (День 1)
4. Серия 7 дней с CTA записи в финале

**События аналитики:**
- Web: `cta_tg_click` (с `deep_link_id`, `tg_flow=plan_7d`, `topic=anxiety`)
- TG: `tg_subscribe_confirmed` (с `deep_link_id`, `tg_flow=plan_7d`)
- TG: `tg_onboarding_completed` (с `segment=anxiety`, `frequency`)

---

### 3.2 `save_resource` — Сохранить ресурс/упражнение

**Триггер:** кнопка "сохранить" на статье/ресурсе/упражнении

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "save_resource",
  "t": "boundaries",
  "e": "exercise_grounding_5_4_3_2_1",
  "s": "article"
}
```

**Что делает бот:**
1. Подтверждение: "Сохранил упражнение «5-4-3-2-1»"
2. Карточка ресурса с кнопкой "открыть на сайте"
3. Напоминание через 24 часа (если включено в настройках)
4. Кнопка "не подходит → другой вариант"

**События:**
- Web: `cta_tg_click` (с `deep_link_id`, `tg_flow=save_resource`)
- TG: `tg_subscribe_confirmed` + `favorites_add` (агрегат)

---

### 3.3 `challenge_7d` — Челлендж 7 дней

**Триггер:** лендинг челленджа / CTA "присоединиться к челленджу"

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "challenge_7d",
  "t": "burnout",
  "s": "landing"
}
```

**Что делает бот:**
1. Приветствие челленджа
2. Выбор времени (утро/вечер)
3. Ежедневные задания (5–7 минут)
4. Мягкий CTA записи в финале

**События:**
- Web: `cta_tg_click` (с `deep_link_id`, `tg_flow=challenge_7d`, `topic=burnout`)
- TG: `tg_subscribe_confirmed`, `tg_onboarding_completed`

---

### 3.4 `concierge` — Консьерж записи

**Триггер:** "нет слотов" / "не знаю как выбрать" / кнопка "помочь с записью"

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "concierge",
  "s": "booking_no_slots"
}
```

**Что делает бот:**
1. Короткие вопросы (3–5): формат, доступность, цель
2. Предложение 2–3 слотов или ссылка на календарь
3. **Важно:** не обсуждает "терапию", только сервис

**События:**
- Web: `cta_tg_click` (с `deep_link_id`, `tg_flow=concierge`)
- TG: `tg_subscribe_confirmed`

---

### 3.5 `question` — Анонимный вопрос

**Триггер:** форма "анонимный вопрос" → "получить ответ в Telegram"

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "question",
  "s": "question_form"
}
```

**Что делает бот:**
1. Подтверждение: "Вопрос принят, отвечу в течение 48 часов"
2. Дисклеймеры: "не экстренная помощь", "не медназначения"
3. Ответ психолога (только с human-in-the-loop)

**События:**
- Web: `question_submitted` (без текста), `cta_tg_click`
- TG: `tg_subscribe_confirmed`

---

### 3.6 `prep` — Подготовка к первой консультации

**Триггер:** завершение интерактива "Подготовка к первой консультации" → "получить в Telegram"

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "prep",
  "s": "consultation_prep"
}
```

**Что делает бот:**
1. Чек-лист "как проходит первая встреча"
2. "3 вопроса, чтобы мягко начать" (без требования отвечать)
3. Кнопка "записаться"

**Важно:** бот **не просит подробности запроса** и не собирает свободный текст.

**События:**
- Web: `consultation_prep_exported` (с `export_target=telegram`), `cta_tg_click`
- TG: `tg_subscribe_confirmed`

---

### 3.7 `ritual` — Мини-ритуал

**Триггер:** "сохранить ритуал" / "получить напоминание"

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "ritual",
  "t": "anxiety",
  "e": "ritual_breathing_478",
  "s": "rituals"
}
```

**Что делает бот:**
1. Карточка ритуала: название, длительность, "зачем"
2. Кнопка "открыть таймер на сайте"
3. Напоминание через 24 часа (если включено)

**События:**
- Web: `cta_tg_click` (с `deep_link_id`, `tg_flow=ritual`)
- TG: `tg_subscribe_confirmed`

---

### 3.8 `boundaries` — Скрипты границ

**Триггер:** генератор "скриптов границ" → "сохранить в Telegram"

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "boundaries",
  "t": "boundaries",
  "e": "script_work_refuse_soft",
  "s": "boundaries_script"
}
```

**Что делает бот:**
1. Карточка "сценарий/стиль/цель"
2. Кнопка "показать варианты" (ссылка на сайт или встроенные шаблоны)
3. Кнопки: "ещё варианты", "напомнить завтра", "записаться"

**Важно:** не хранить и не пересылать чувствительный контекст пользователя.

**События:**
- Web: `boundaries_script_copied`, `cta_tg_click`
- TG: `tg_subscribe_confirmed`

---

### 3.9 `favorites` — Моя аптечка

**Триггер:** "открыть избранное в Telegram"

**Payload:**
```json
{
  "dl": "unique_id",
  "f": "favorites",
  "s": "favorites"
}
```

**Что делает бот:**

**Вариант A (web-first, рекомендуемый):**
- Кнопка "открыть мою аптечку на сайте" (deep link обратно)

**Вариант B (tg-first):**
- Список сохранённых ссылок/ID (без текстов дневников/анкеты)

**События:**
- Web: `favorites_open`, `cta_tg_click`
- TG: `tg_subscribe_confirmed`

---

## 4) UTM-параметры (обязательные)

Все deep links **должны** содержать UTM для трассировки источника:

```
https://t.me/BOTNAME?start=<PAYLOAD>&utm_source=telegram&utm_medium=bot&utm_campaign=<CAMPAIGN>&utm_content=<CONTENT>
```

**Стандартные значения:**
- `utm_source`: всегда `telegram`
- `utm_medium`: `bot` | `channel` | `post` | `story`
- `utm_campaign`: название кампании (`challenge_anxiety_7d`, `plan_burnout`, `save_resources`)
- `utm_content`: вариант контента (`quiz_result`, `landing_hero`, `article_cta`, `post_03`)

**Пример полной ссылки:**
```
https://t.me/emotional_balance_bot?start=eyJkbCI6ImFiYzEyMyIsImYiOiJwbGFuXzdkIiwidCI6ImFueGlldHkifQ&utm_source=telegram&utm_medium=bot&utm_campaign=plan_anxiety_7d&utm_content=quiz_result
```

---

## 5) Обратная навигация: Telegram → Сайт

### 5.1 Принцип

Из Telegram **всегда** ведём на **конкретную страницу сайта**, а не на главную.

### 5.2 Типовые deep links (сайт)

```
https://site.com/booking/?utm_source=telegram&utm_medium=bot&utm_campaign=<CAMPAIGN>&dl=<DEEP_LINK_ID>
```

**Примеры:**

| Назначение | URL |
|---|---|
| Запись | `/booking/?utm_source=telegram&utm_medium=bot&utm_campaign=concierge&dl=abc123` |
| Квиз | `/start/quizzes/anxiety/?utm_source=telegram&utm_medium=bot&utm_campaign=plan_7d&dl=abc123` |
| Навигатор | `/start/navigator/?utm_source=telegram&utm_medium=bot&utm_campaign=series_step3&dl=abc123` |
| Ресурс | `/resources/grounding-5-4-3-2-1/?utm_source=telegram&utm_medium=bot&utm_campaign=save_resource&dl=abc123` |
| Скрипты границ | `/start/boundaries-scripts/?utm_source=telegram&utm_medium=bot&utm_campaign=boundaries_reminder&dl=abc123` |
| Подготовка | `/start/consultation-prep/?utm_source=telegram&utm_medium=bot&utm_campaign=prep_checklist&dl=abc123` |
| Ритуалы | `/start/rituals/?utm_source=telegram&utm_medium=bot&utm_campaign=ritual_reminder&dl=abc123` |
| Избранное | `/start/favorites/?utm_source=telegram&utm_medium=bot&utm_campaign=favorites&dl=abc123` |
| Статья | `/blog/<slug>/?utm_source=telegram&utm_medium=post&utm_campaign=content_series&dl=abc123` |

---

## 6) Генерация `deep_link_id`

### 6.1 Требования
- **Уникальный** для каждого перехода (UUID или короткий ID)
- **Короткий** (если не UUID): 8–12 символов, base62 (a-zA-Z0-9)
- **Стабильный** на время сессии (пользователь может вернуться по той же ссылке)

### 6.2 Пример генерации (псевдокод)

```javascript
// Web (при рендере CTA)
const deepLinkId = generateShortId(); // или UUID
const payload = {
  dl: deepLinkId,
  f: 'plan_7d',
  t: 'anxiety',
  s: 'quiz'
};
const encodedPayload = base64url(JSON.stringify(payload));
const telegramUrl = `https://t.me/emotional_balance_bot?start=${encodedPayload}&utm_source=telegram&utm_medium=bot&utm_campaign=plan_anxiety_7d&utm_content=quiz_result`;

// При клике
track('cta_tg_click', {
  deep_link_id: deepLinkId,
  tg_flow: 'plan_7d',
  topic: 'anxiety',
  tg_target: 'bot'
});
```

### 6.3 Хранение (опционально)

Для склейки и дебага можно кратковременно хранить связку `deep_link_id ↔ anonymous_id ↔ topic ↔ flow` (без PII):

```json
{
  "deep_link_id": "abc123",
  "anonymous_id": "anon_xyz",
  "topic": "anxiety",
  "flow": "plan_7d",
  "created_at": "2026-01-07T12:34:56Z",
  "source_page": "/interactive/quizzes/anxiety/"
}
```

**TTL:** 30 дней (для аналитики), не содержит чувствительных данных.

---

## 7) Склейка аналитики: Web ↔ Telegram

### 7.1 События на сайте (при клике CTA)

```javascript
track('cta_tg_click', {
  deep_link_id: 'abc123',
  tg_target: 'bot',
  tg_flow: 'plan_7d',
  topic: 'anxiety',
  page_path: '/interactive/quizzes/anxiety/',
  utm_source: 'telegram',
  utm_medium: 'bot',
  utm_campaign: 'plan_anxiety_7d'
});
```

### 7.2 События в Telegram (при старте бота)

Бот декодирует payload и отправляет:

```javascript
track('tg_subscribe_confirmed', {
  source: 'telegram',
  deep_link_id: 'abc123',  // КЛЮЧ СКЛЕЙКИ
  tg_target: 'bot',
  tg_flow: 'plan_7d',
  topic: 'anxiety'
});
```

### 7.3 Последующие события в Telegram

```javascript
track('tg_onboarding_completed', {
  source: 'telegram',
  deep_link_id: 'abc123',
  segment: 'anxiety',
  frequency: 'weekly_3_4'
});

track('tg_interaction', {
  source: 'telegram',
  deep_link_id: 'abc123',
  interaction_type: 'button_click',
  tg_flow: 'plan_7d',
  button_id: 'day_1_start'
});
```

### 7.4 Возврат на сайт (из Telegram)

Если пользователь кликает "записаться" в боте и возвращается на сайт:

```javascript
// URL: /booking/?utm_source=telegram&utm_medium=bot&utm_campaign=plan_7d&dl=abc123

track('booking_start', {
  entry_point: 'telegram',
  deep_link_id: 'abc123',  // СКЛЕЙКА
  topic: 'anxiety',
  utm_source: 'telegram',
  utm_medium: 'bot',
  utm_campaign: 'plan_7d'
});
```

**Результат:** полная трассировка `quiz → telegram → booking` через `deep_link_id=abc123`.

---

## 8) Примеры полных сценариев

### 8.1 Сценарий: Квиз → План в Telegram → Запись

**Шаг 1 (Web):** Пользователь завершает квиз на тревогу
```javascript
track('complete_quiz', {
  quiz_slug: 'anxiety_gad7',
  result_level: 'moderate',
  topic: 'anxiety'
});
```

**Шаг 2 (Web):** Нажимает "получить план в Telegram"
```javascript
const deepLinkId = 'dl_abc123';
const telegramUrl = `https://t.me/emotional_balance_bot?start=eyJkbCI6ImRsX2FiYzEyMyIsImYiOiJwbGFuXzdkIiwidCI6ImFueGlldHkiLCJlIjoicXVpel9hbnhpZXR5X2dhZDciLCJzIjoicXVpeiJ9&utm_source=telegram&utm_medium=bot&utm_campaign=plan_anxiety_7d&utm_content=quiz_result`;

track('cta_tg_click', {
  deep_link_id: deepLinkId,
  tg_target: 'bot',
  tg_flow: 'plan_7d',
  topic: 'anxiety'
});
```

**Шаг 3 (TG):** Бот получает старт, декодирует payload
```javascript
const payload = {
  dl: 'dl_abc123',
  f: 'plan_7d',
  t: 'anxiety',
  e: 'quiz_anxiety_gad7',
  s: 'quiz'
};

track('tg_subscribe_confirmed', {
  source: 'telegram',
  deep_link_id: 'dl_abc123',
  tg_flow: 'plan_7d',
  topic: 'anxiety'
});
```

**Шаг 4 (TG):** Онбординг
```javascript
track('tg_onboarding_completed', {
  source: 'telegram',
  deep_link_id: 'dl_abc123',
  segment: 'anxiety',
  frequency: 'weekly_3_4'
});
```

**Шаг 5 (TG → Web):** Через 7 дней пользователь нажимает "записаться"
```javascript
// URL: /booking/?utm_source=telegram&utm_medium=bot&utm_campaign=plan_anxiety_7d&dl=dl_abc123

track('booking_start', {
  entry_point: 'telegram',
  deep_link_id: 'dl_abc123',
  topic: 'anxiety',
  utm_source: 'telegram',
  utm_medium: 'bot',
  utm_campaign: 'plan_anxiety_7d'
});
```

**Результат:** полная воронка `quiz → telegram_plan → booking` с единым `deep_link_id`.

---

### 8.2 Сценарий: Скрипты границ → Сохранить → Напоминание

**Шаг 1 (Web):** Пользователь генерирует скрипт
```javascript
track('boundaries_script_start', {
  topic: 'boundaries',
  scenario: 'work',
  tone: 'firm'
});

track('boundaries_script_copied', {
  variant_id: 'script_work_refuse_firm_v2'
});
```

**Шаг 2 (Web):** Нажимает "сохранить в Telegram"
```javascript
const deepLinkId = 'dl_xyz789';
const telegramUrl = `https://t.me/emotional_balance_bot?start=eyJkbCI6ImRsX3h5ejc4OSIsImYiOiJib3VuZGFyaWVzIiwidCI6ImJvdW5kYXJpZXMiLCJlIjoic2NyaXB0X3dvcmtfcmVmdXNlX2Zpcm1fdjIiLCJzIjoiYm91bmRhcmllc19zY3JpcHQifQ&utm_source=telegram&utm_medium=bot&utm_campaign=boundaries_save&utm_content=script_work`;

track('cta_tg_click', {
  deep_link_id: deepLinkId,
  tg_target: 'bot',
  tg_flow: 'boundaries',
  topic: 'boundaries'
});
```

**Шаг 3 (TG):** Бот подтверждает сохранение
```javascript
track('tg_subscribe_confirmed', {
  source: 'telegram',
  deep_link_id: 'dl_xyz789',
  tg_flow: 'boundaries',
  topic: 'boundaries'
});

track('favorites_add', {
  entity_type: 'script',
  entity_id: 'script_work_refuse_firm_v2',
  topic: 'boundaries'
});
```

**Шаг 4 (TG):** Напоминание через 24 часа
```javascript
// Бот отправляет карточку + кнопку "открыть на сайте"
// URL: /start/boundaries-scripts/?utm_source=telegram&utm_medium=bot&utm_campaign=boundaries_reminder&dl=dl_xyz789
```

---

## 9) Безопасность и приватность

### 9.1 Что **НЕ передаём** в deep links
- ❌ Email, телефон, имя
- ❌ Текст дневников, анкеты, вопросов
- ❌ Сырые ответы квизов (только `result_level`)
- ❌ Чувствительные маркеры (кризисные триггеры, диагнозы)

### 9.2 Что **передаём** (безопасно)
- ✅ `deep_link_id` (технический идентификатор)
- ✅ `flow` (тип флоу)
- ✅ `topic` (категория: anxiety/burnout/...)
- ✅ `entity_id` (ID ресурса/интерактива, не чувствительный)
- ✅ `source` (откуда переход)

### 9.3 Хранение и TTL
- `deep_link_id ↔ anonymous_id` хранится **30 дней** для аналитики
- **Не хранится:** связка с user_id/email/телефоном (только в продуктовой БД для сервиса, не в аналитике)

---

## 10) Чеклист внедрения

### Перед релизом:
- [ ] Все CTA "Telegram" генерируют `deep_link_id` и передают его в payload
- [ ] Payload кодируется в base64url
- [ ] UTM-параметры добавляются ко всем ссылкам
- [ ] События `cta_tg_click` содержат `deep_link_id`, `tg_flow`, `topic`
- [ ] Telegram-бот декодирует payload и отправляет `tg_subscribe_confirmed` с `deep_link_id`
- [ ] Обратные ссылки (TG → Web) содержат `dl=<deep_link_id>` и UTM
- [ ] Аналитика склеивает события по `deep_link_id`
- [ ] Payload **не содержит** PII/текстов/чувствительных данных
- [ ] Документированы все типы флоу и их payload-схемы

---

## 11) Открытые вопросы (для финализации перед кодом)

- [ ] Точное название бота/канала в Telegram (для генерации ссылок)
- [ ] Формат Telegram: **бот/канал/гибрид** (влияет на схему deep links)
- [ ] Хранение `deep_link_id ↔ anonymous_id`: в какой БД, какой TTL
- [ ] Валидация payload на стороне бота: как обрабатываем некорректные/старые ссылки
- [ ] Поддержка нескольких языков в payload (если планируется) — сейчас только `ru`

---

**Версия документа:** 1.0  
**Последнее обновление:** 7 января 2026  
**Ответственный:** Product / Backend / Telegram Integration Team

**Связанные документы:**
- [PRD](./PRD.md) — FR-TG-1..5
- [Telegram Ecosystem Research](./research/06-Telegram-Ecosystem.md)
- [Tracking Plan](./Tracking-Plan.md) — раздел 6.8
- [User Flows](./user-flows-cjm.md) — флоу 10
