# Tracking plan — «Эмоциональный баланс» (Release 1)

**Версия:** v0.1 (draft)  
**Дата:** 2026-01-07  
**Основано на:** `docs/PRD.md`, `docs/User-Stories-JTBD-Acceptance-Criteria.md`, `docs/user-flows-cjm.md`, `docs/research/01–13`

## 1) Цель и принципы

Tracking plan нужен, чтобы:
- измерять ключевые KPI/воронки (booking, Telegram, интерактивы, возвращаемость);
- строить CRM‑таймлайн лидов **без чувствительных текстов**;
- иметь единый словарь событий/параметров между Web / Backend / Telegram / Admin.

**Privacy by design (обязательные правила):**
- **Не трекаем и не отправляем в аналитику**: содержимое дневников, текст анкеты, текст “анонимного вопроса”, свободные текстовые ответы квизов.
- Также **не трекаем** свободный текст из интерактива «подготовка к первой консультации» (черновик запроса) — только факт экспорта/сохранения и агрегаты.
- В интерактивах фиксируем **только агрегаты**: `result_level` (low/moderate/high), длительность, факт старта/завершения.
- Для PII (email/телефон/Telegram) — только в продуктовой БД по назначению; в аналитике — только признаки/флаги (например, `has_contact=true`) и технические ID.

## 2) Область трекинга (что покрываем)

**Критичные воронки из PRD:**
- `visit → booking_start → booking_paid → booking_confirmed`
- `visit → tg_subscribe_confirmed`
- `start_quiz → complete_quiz` (и аналоги для других интерактивов: навигатор, термометр ресурса)
- `save_resource / export_pdf`

**Домены (bounded contexts трекинга):**
- **Acquisition & Navigation (Web)**: входы, UTM, просмотр ключевых страниц/экранов.
- **Engagement (Web)**: контент, ресурсы, доверие (FAQ/границы/как проходит).
- **Interactive (Web)**: квизы/первый шаг/навигатор состояния/термометр ресурса/скрипты границ/подготовка к консультации/мини‑ритуалы/избранное/анонимный вопрос/кризисный режим.
- **Booking & Payments (Backend/Web)**: шаги записи, оплата (ЮKassa), конфликты, нет слотов.
- **Telegram (Bot/Channel)**: deep links, онбординг, серии/челленджи, stop/unsubscribe.
- **Client Cabinet (Web)**: дневники, экспорт PDF, управление данными и согласиями.
- **Admin/CRM/Audit (Admin/Backend)**: действия админа, изменения цен/контента, аудит‑лог.

## 3) Идентификация: user_id / anonymous_id / lead_id

- **`anonymous_id`**: случайный стабильный идентификатор устройства/браузера (cookie/localStorage). Создаётся на первом визите.
- **`user_id`**: внутренний ID авторизованного пользователя (после логина).
- **`lead_id`**: ID CRM‑лида (создаётся при первом “контактном” событии: waitlist/booking/intake/telegram link).

**Правило связки:** при появлении `user_id` мы продолжаем отправлять `anonymous_id` как `previous_anonymous_id` (для склейки сессий), но не храним в сторонней аналитике PII.

## 4) Схемы именования (обязательный стандарт)

### 4.1 События (events)

- **Формат:** `snake_case`
- **Смысл:** простые глагольные события без “маркетинговых” имён
- **Источник:** единый нейминг для Web/Backend/TG/Admin
- **Стабильность:** событие переименовывать нельзя; только добавлять новое и депрекейтить старое

Примеры:
- `booking_start`, `booking_slot_selected`, `booking_paid`, `booking_confirmed`
- `start_quiz`, `complete_quiz`
- `cta_tg_click`, `tg_subscribe_confirmed`

### 4.2 Параметры событий (event params)

- **Формат:** `snake_case`
- **Флаги:** `is_*`, `has_*`, `*_enabled`
- **Идентификаторы:** `*_id` (только внутренние), `*_slug` (для SEO/контента)
- **Списки:** массивы, суффикс `*_tags` (например, `topic_tags`)

### 4.3 User properties

- **Формат:** `snake_case`
- **Только стабильные атрибуты пользователя**, не “каждосекундные” значения.
- **Запрещено:** хранить в user properties свободный текст, “диагнозы”, детали дневников/анкеты.

## 5) Общие параметры (прикладываются к большинству событий)

### 5.0 Базовая схема события (platform-agnostic)

Все события (web/backend/telegram/admin) приводим к единому payload (названия полей фиксируем):

```json
{
  "schema_version": "1.0",
  "event_name": "booking_start",
  "event_version": 1,
  "event_id": "uuid",
  "occurred_at": "2026-01-07T12:34:56.789Z",
  "source": "web",
  "environment": "prod",
  "session_id": "uuid",
  "anonymous_id": "anon_...",
  "user_id": "user_...", 
  "lead_id": "lead_...",
  "page": {
    "page_path": "/booking/",
    "page_title": "Запись",
    "referrer": "https://example.com/..."
  },
  "acquisition": {
    "entry_point": "seo",
    "utm_source": "telegram",
    "utm_medium": "post",
    "utm_campaign": "challenge_anxiety_7d",
    "utm_content": "post_03",
    "utm_term": null
  },
  "properties": {
    "topic": "anxiety",
    "service_slug": "primary_consultation"
  }
}
```

Примечания:
- `page` и `acquisition` применимы в первую очередь к web/admin; для backend/telegram могут быть пустыми или частичными.
- `properties` — **только** параметры конкретного события (без PII/текста).
- `event_version` увеличиваем, если меняется смысл события или обязательные поля (при этом имя события сохраняем).

### 5.1 Технический контекст

- **`event_id`**: UUID
- **`occurred_at`**: ISO‑datetime (UTC)
- **`source`**: `web` | `backend` | `telegram` | `admin`
- **`environment`**: `prod` | `stage` | `dev`
- **`session_id`**: UUID (30 мин неактивности = новая сессия)
- **`anonymous_id`**, **`user_id`** (если есть), **`lead_id`** (если есть)

### 5.2 Page / Screen контекст (для web/admin)

- **`page_path`**, **`page_title`**
- **`referrer`**
- **`entry_point`**: `seo` | `telegram` | `direct` | `referral` | `ads` | `internal`

### 5.3 UTM (если присутствуют)

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`

### 5.4 Таксономия продукта (сквозные измерения)

Словарь берём из `docs/research/01-IA-and-UserJourneys.md`:
- **`topic`** / **`topic_tags`**: `anxiety` | `burnout` | `relationships` | `boundaries` | `selfesteem` | …
- **`format`**: `article` | `note` | `resource` | `audio` | `checklist` | `quiz` | `navigator` | `resource_thermometer` | `boundaries_script` | `consultation_prep` | `ritual` | `favorites` | `first_step` | `diary` | `event`
- **`time_to_benefit`**: `1_3_min` | `7_10_min` | `20_30_min` | `series`
- **`support_level`**: `self_help` | `micro_support` | `consultation` | `therapy_package`

## 6) Каталог событий (Release 1)

Ниже — **основной** список. Минимальный набор должен быть реализован полностью (см. PRD `NFR-AN-1`).

### 6.0 Платформенные события (если доступны “из коробки”)

Если выбранная система аналитики автоматически собирает просмотры и клики, мы их **не дублируем** кастомными событиями. Если авто‑сбора нет — добавляем:

- `page_view` (Web): `page_path`, `page_title`, `referrer`, UTM.
- `cta_click` (Web): `cta_id`, `cta_label`, `cta_target` (например `booking|telegram`), `page_path`.

### 6.0.1 Эксперименты (A/B)

#### `experiment_exposed`
- **Когда**: первый показ варианта эксперимента пользователю (в рамках сессии/периода).
- **Обязательные**: `experiment_id`, `variant` (`A|B|C`), `surface`, `page_path`
- **Запрещено**: любые PII/свободный текст

### 6.1 Навигация и входы (Web)

#### `view_problem_card`
- **Когда**: клик по карточке состояния на главной/хабах.
- **Обязательные параметры**: `topic`, `card_id` (или `card_slug`), `page_path`
- **Опционально**: `position`, `entry_point`, UTM

#### `view_problem_landing`
- **Когда**: просмотр SEO‑лендинга темы.
- **Обязательные**: `topic`, `page_path`
- **Опционально**: `scroll_depth_bucket` (`0_25|25_50|50_75|75_100`)

### 6.2 Доверие и FAQ (Web)

#### `trust_block_viewed`
- **Когда**: пользователь видит ключевые блоки доверия (“как проходит”, “границы”, “конфиденциальность”, “образование”).
- **Обязательные**: `trust_block` (`how_it_works|boundaries|confidentiality|education|ethics|fit_not_fit`), `page_path`

#### `faq_opened`
- **Когда**: раскрыт вопрос в FAQ.
- **Обязательные**: `faq_id` (внутренний), `page_path`
- **Опционально**: `faq_group` (`booking|privacy|process|payment|online`)

### 6.3 Контент и ресурсы (Web)

#### `save_resource`
- **Когда**: пользователь нажал “сохранить” (в Telegram или внутри сайта, если появится избранное).
- **Обязательные**: `resource_id` или `resource_slug`, `format` (`resource|audio|checklist|exercise`), `topic` (если применимо)
- **Опционально**: `save_target` (`telegram|favorites|copy_link`)

### 6.3.1 Retention-оферы (Web)

#### `retention_offer_viewed`
- **Когда**: показана секция retention‑предложений.
- **Обязательные**: `offer_types` (array: `package_discount|gift_certificate|social_mission`), `offers_count`, `surface` (`home|services|booking_confirmation|other`)
- **Запрещено**: цены, контакты, свободный текст

#### `retention_offer_click`
- **Когда**: клик по одному из предложений.
- **Обязательные**: `offer_type` (`package_discount|gift_certificate|social_mission`), `cta_id`, `surface`
- **Запрещено**: цены, контакты, свободный текст

### 6.4 Интерактивы (Web)

#### `start_quiz`
- **Когда**: старт квиза/мини‑диагностики.
- **Обязательные**: `quiz_id` или `quiz_slug`, `topic` (если применимо)
- **Опционально**: `question_count`

#### `complete_quiz`
- **Когда**: завершение квиза.
- **Обязательные**: `quiz_id`/`quiz_slug`, `result_level` (`low|moderate|high`)
- **Опционально**: `duration_ms`, `question_count`, `abandoned_at_question` (если не завершил — не для этого события)
- **Запрещено**: сырые ответы/тексты

#### `quiz_question_completed`
- **Когда**: пользователь ответил на вопрос квиза.
- **Обязательные**: `quiz_id`/`quiz_slug`, `question_index`
- **Опционально**: `run_id`
- **Запрещено**: текст вопроса/ответа, сырые значения шкал

#### `quiz_abandoned`
- **Когда**: пользователь ушёл с квиза до завершения.
- **Обязательные**: `quiz_id`/`quiz_slug`, `abandoned_at_question`
- **Опционально**: `run_id`
- **Запрещено**: текст вопроса/ответа, сырые значения шкал

#### `navigator_start`
- **Когда**: старт интерактива “Навигатор состояния” (ветвящийся сценарий).
- **Обязательные**: `navigator_id` или `navigator_slug`, `topic` (если применимо)
- **Опционально**: `step_count_expected`

#### `navigator_step_completed`
- **Когда**: пользователь завершил шаг навигатора (по кнопке “Далее/Выбрать”).
- **Обязательные**: `navigator_id`/`navigator_slug`, `step_index`
- **Опционально**: `choice_id` (внутренний), `topic`
- **Запрещено**: любые тексты выбора, если они могут содержать чувствительные данные (используем только ID)

#### `navigator_complete`
- **Когда**: навигатор завершён и показан результат/план.
- **Обязательные**: `navigator_id`/`navigator_slug`
- **Опционально**:
  - `result_profile` (`stabilize_now|restore_energy|boundaries|clarify|support_contact|other`) — только заранее заданные категории
  - `duration_ms`

#### `resource_thermometer_start`
- **Когда**: старт “Термометра ресурса” (энергобюджет дня).
- **Обязательные**: `topic` (если применимо)

#### `resource_thermometer_complete`
- **Когда**: термометр завершён и показаны рекомендации/план.
- **Обязательные**: `resource_level` (`low|moderate|high`)
- **Опционально**: `duration_ms`, `topic`
- **Запрещено**: сырые значения шкал, если решим их не отправлять; по умолчанию — только агрегат `resource_level`

#### `boundaries_script_start`
- **Когда**: пользователь открыл генератор “скриптов границ”.
- **Обязательные**: `topic` (`boundaries`), `scenario` (`work|family|partner|friends|other`)
- **Опционально**: `tone` (`soft|short|firm`)

#### `boundaries_script_variant_viewed`
- **Когда**: показан конкретный вариант фразы/скрипта.
- **Обязательные**: `scenario`, `tone`, `variant_id`

#### `boundaries_script_copied`
- **Когда**: пользователь нажал “Скопировать”.
- **Обязательные**: `variant_id`
- **Запрещено**: текст фразы

#### `consultation_prep_start`
- **Когда**: старт интерактива “Подготовка к первой консультации”.
- **Обязательные**: `topic` (если применимо)

#### `consultation_prep_complete`
- **Когда**: интерактив завершён и показан итоговый “черновик/чек‑лист”.
- **Опционально**: `duration_ms`, `topic`

#### `consultation_prep_exported`
- **Когда**: пользователь экспортировал/скопировал результат подготовки (PDF/копия/Telegram).
- **Обязательные**: `export_target` (`pdf|copy|telegram`)
- **Запрещено**: содержание текста

#### `ritual_started`
- **Когда**: старт мини‑ритуала (2–5 минут).
- **Обязательные**: `ritual_id`/`ritual_slug`, `topic` (если применимо)

#### `ritual_completed`
- **Когда**: мини‑ритуал завершён.
- **Обязательные**: `ritual_id`/`ritual_slug`
- **Опционально**: `duration_ms`

#### `favorites_add`
- **Когда**: добавление материала/интерактива в “избранное/аптечку”.
- **Обязательные**: `entity_type` (`resource|exercise|ritual|quiz|navigator|script`), `entity_id` или `entity_slug`
- **Опционально**: `topic`

#### `favorites_remove`
- **Когда**: удаление из избранного.
- **Обязательные**: `entity_type`, `entity_id`/`entity_slug`

#### `favorites_open`
- **Когда**: пользователь открыл экран “моя аптечка/избранное”.
- **Опционально**: `items_count_bucket` (`0|1_3|4_10|10_plus`)

#### `first_step_started`
- **Когда**: старт упражнения в “Первом шаге”.
- **Обязательные**: `exercise_id`/`exercise_slug`, `topic`

#### `first_step_completed`
- **Когда**: завершение упражнения.
- **Обязательные**: `exercise_id`/`exercise_slug`, `topic`
- **Опционально**: `duration_ms`

#### `question_submitted`
- **Когда**: отправлен “анонимный вопрос”.
- **Обязательные**: `channel` (`web|telegram`)
- **Опционально**: `has_contact` (true/false)
- **Запрещено**: текст вопроса

### 6.5 Кризисный режим (Web/TG)

#### `crisis_banner_shown`
- **Когда**: показан блок экстренной помощи (триггеры из `docs/research/01-*`).
- **Обязательные**: `trigger_type` (`self_harm|suicidal_ideation|violence|minor_risk|panic_like`), `surface` (`quiz|question|agent|other`)
- **Запрещено**: текст/детали причины

#### `crisis_help_click`
- **Когда**: клик по действию внутри экстренной помощи.
- **Обязательные**: `action` (`call_112|hotline|tell_someone|back_to_resources`)

### 6.6 Запись (Booking) — Web + Backend

#### `booking_start`
- **Когда**: пользователь вошёл в флоу записи.
- **Обязательные**: `entry_point` (как пришёл), `page_path`
- **Опционально**: `topic` (если старт из лендинга/квиза), `service_slug` (если старт из страницы услуги)

#### `service_selected`
- **Когда**: выбран тип услуги.
- **Обязательные**: `service_id` или `service_slug`, `format` (`online|offline|hybrid`)
- **Опционально**: `price_bucket`, `deposit_bucket`

#### `booking_slot_selected`
- **Когда**: выбран слот в календаре.
- **Обязательные**: `slot_start_at` (UTC), `timezone`, `service_id`/`service_slug`
- **Опционально**: `slot_type` (`primary|single|package`), `is_public_slots` (true/false)

#### `show_no_slots`
- **Когда**: показано состояние “нет слотов”.
- **Обязательные**: `service_id`/`service_slug`, `date_range` (`next_7d|next_14d|month|custom`)

#### `waitlist_submitted`
- **Когда**: отправлен лист ожидания.
- **Обязательные**: `preferred_contact` (`email|phone|telegram`), `service_id`/`service_slug`
- **Опционально**: `preferred_time_window` (`weekday_morning|weekday_evening|weekend|any`)

#### `booking_conflict`
- **Когда**: конфликт бронирования (слот занят).
- **Обязательные**: `service_id`/`service_slug`

#### `intake_started`
- **Когда**: открыта анкета.
- **Обязательные**: `service_id`/`service_slug`

#### `intake_submitted`
- **Когда**: анкета отправлена.
- **Обязательные**: `service_id`/`service_slug`, `has_text_fields` (true/false)
- **Запрещено**: ответы анкеты (в т.ч. шкалы 0–10) в аналитику, если не согласовано отдельно

### 6.7 Оплата (ЮKassa) — Backend (истина статусов)

#### `payment_started`
- **Когда**: создан платёж/переход на оплату.
- **Обязательные**: `payment_provider` (`yookassa`), `amount`, `currency`, `service_id`/`service_slug`

#### `payment_failed`
- **Когда**: платёж завершился ошибкой.
- **Обязательные**: `payment_provider`, `failure_category` (`canceled|timeout|provider_error|insufficient_funds|unknown`)

#### `booking_paid`
- **Когда**: платёж подтверждён провайдером (webhook).
- **Обязательные**: `payment_provider`, `amount`, `currency`, `service_id`/`service_slug`

#### `booking_confirmed`
- **Когда**: запись подтверждена (бронь создана, встреча зафиксирована).
- **Обязательные**: `appointment_start_at` (UTC), `timezone`, `service_id`/`service_slug`, `format` (`online|offline`)

### 6.7.1 Исход встречи (no-show/явка) — Backend/Admin (истина исхода)

#### `appointment_outcome_recorded` (минимум для no-show rate)
- **Зачем**: PRD требует `no-show rate`, но без явного события исхода встречу нельзя корректно классифицировать (прокси даёт ошибки).
- **Когда**: исход встречи зафиксирован достоверным источником:
  - админ/психолог отметил исход в админке,
  - либо интеграция календаря/сервиса встреч вернула достоверный статус (если появится).
- **Обязательные**:
  - `appointment_id` (внутренний)
  - `scheduled_start_at` (UTC)
  - `service_id`/`service_slug`
  - `outcome`: `attended|no_show|canceled_by_client|canceled_by_provider|rescheduled`
- **Опционально**:
  - `recorded_by_role`: `owner|assistant|system`
  - `reason_category`: `late_cancel|tech_issue|illness|other|unknown` (без текста)
- **Запрещено**: любые подробные заметки/объяснения в свободном тексте.

### 6.8 Telegram (Bot/Channel)

> Эти события фиксируются на стороне TG‑бота/сервиса и присылаются в общую аналитику с `source=telegram`.

#### `cta_tg_click` (Web)
- **Когда**: клик по CTA “Telegram” на сайте.
- **Обязательные**: `tg_target` (`bot|channel`), `tg_flow` (`plan_7d|save_resource|challenge_7d|concierge|question`), `deep_link_id`
- **Опционально**: `topic`, UTM (как в `docs/research/06-*`)

#### `tg_subscribe_confirmed`
- **Когда**: подтверждена подписка/старт бота (насколько позволяет TG‑реализация).
- **Обязательные**: `tg_target`, `deep_link_id`
- **Опционально**: `topic`

#### `tg_onboarding_completed`
- **Когда**: завершён онбординг 30–60 сек.
- **Обязательные**: `segment` (`anxiety|burnout|...`), `frequency` (`weekly_1_2|weekly_3_4|on_demand`)

#### `tg_series_stopped`
- **Когда**: пользователь остановил серию/отписался от сообщений.
- **Обязательные**: `tg_flow`, `stop_method` (`command|button|unsubscribe`)

#### `tg_interaction` (минимум для измеримого retention)
- **Зачем**: без событий взаимодействия невозможно корректно считать D1/D7/D30 retention в Telegram (иначе мы видим только подписку/онбординг).
- **Когда**: пользователь совершил любое “осмысленное” действие в боте/канале, которое мы можем достоверно зафиксировать через Telegram Bot API:
  - нажал кнопку (callback query),
  - отправил сообщение/команду,
  - выбрал пункт меню/кнопку “День 1 / Следующий шаг / Стоп” и т.п.
- **Обязательные**:
  - `interaction_type`: `button_click|command|message|menu`
  - `tg_flow`: `plan_7d|save_resource|challenge_7d|concierge|question|other`
  - `deep_link_id` (если есть; для склейки с web)
- **Опционально**:
  - `button_id` (внутренний идентификатор кнопки)
  - `message_template_id` (если клик связан с конкретным шаблоном)
  - `topic`
- **Запрещено**: текст сообщений пользователя. Если нужно измерять факт текста — только флаг/агрегат (например `has_text=true`, `text_length_bucket`).

### 6.9 Личный кабинет (Web)

#### `lk_opened`
- **Когда**: открыт ЛК.
- **Обязательные**: `page_path`

#### `diary_entry_created`
- **Когда**: создана запись дневника.
- **Обязательные**: `diary_type` (`emotions|abc|sleep_energy|gratitude`)
- **Опционально**: `has_text` (true/false)
- **Запрещено**: содержание записи

#### `diary_entry_deleted`
- **Когда**: удалена запись дневника.
- **Обязательные**: `diary_type`

#### `pdf_exported`
- **Когда**: экспортирован PDF.
- **Обязательные**: `export_type` (`diary_pdf`), `period` (`7d|30d|custom`)

#### `consent_updated`
- **Когда**: пользователь обновил согласия/коммуникации.
- **Обязательные**: `consent_type` (`personal_data|communications|telegram`), `new_value` (true/false)

#### `account_deleted`
- **Когда**: пользователь удалил аккаунт.
- **Обязательные**: `method` (`self_service`)

### 6.10 Мероприятия (Web)

#### `event_viewed`
- **Когда**: просмотр лендинга мероприятия.
- **Обязательные**: `event_id`/`event_slug`

#### `event_registered`
- **Когда**: отправлена регистрация.
- **Обязательные**: `event_id`/`event_slug`, `preferred_contact` (`email|telegram`)

#### `event_attended` (если есть достоверный источник)
- **Когда**: подтверждён факт участия (например, по чек‑ину/платформе).
- **Обязательные**: `event_id`/`event_slug`

#### `event_materials_opened`
- **Когда**: открыты материалы после события.
- **Обязательные**: `event_id`/`event_slug`

### 6.11 Админка/CRM/Аудит (Admin/Backend)

> Эти события нужны для контроля качества и безопасности. Часть из них может оставаться только в "аудит‑логе" БД; но нейминг ниже единый.

#### `admin_login`
- **Когда**: вход в админку.
- **Обязательные**: `role` (`owner|assistant|editor`)

#### `admin_price_changed`
- **Когда**: изменена цена/депозит услуги.
- **Обязательные**: `service_id`/`service_slug`, `changed_fields` (array)

#### `admin_content_published`
- **Когда**: опубликован контент после QA‑чеклиста.
- **Обязательные**: `content_type` (`article|resource|landing|page`), `content_id`/`content_slug`
- **Опционально**: `qa_checklist_version`

#### `admin_data_exported`
- **Когда**: экспортированы данные пользователя/лидов.
- **Обязательные**: `export_type` (`user_data|leads|payments`), `role`

#### `ugc_moderated`
- **Зачем**: метрики модерации из `docs/UGC-Moderation-Rules.md` раздел 8.
- **Когда**: модератор одобрил/отклонил UGC (анонимный вопрос/отзыв).
- **Обязательные**:
  - `ugc_type`: `anonymous_question|review|comment`
  - `ugc_id`: внутренний идентификатор
  - `moderation_status`: `approved|rejected|flagged_crisis`
  - `moderator_role`: `owner|assistant`
  - `duration_ms`: время от отправки до модерации
- **Опционально**:
  - `rejection_reason`: `crisis|medical|out_of_scope|therapy_request|spam|pii` (категория, без текста)
  - `has_crisis_trigger`: true/false

#### `moderation_escalated`
- **Когда**: модератор эскалировал вопрос к owner (например, кризисный).
- **Обязательные**: `ugc_type`, `ugc_id`, `escalation_reason` (`crisis|complex|other`)

#### `ugc_answered`
- **Когда**: психолог опубликовал ответ на анонимный вопрос.
- **Обязательные**: `ugc_id`, `answer_length_bucket` (`short|medium|long`), `time_to_answer_hours`
- **Запрещено**: текст ответа

## 7) User properties (Release 1)

Минимальный набор:
- **`is_authenticated`**: true/false
- **`role`**: `guest|user|client|owner|assistant|editor`
- **`timezone`**: строка IANA (например, `Europe/Moscow`)
- **`language`**: `ru`
- **`age_verified_18plus`**: true/false/unknown (по факту реализации)
- **`consent_personal_data`**: true/false
- **`consent_communications`**: true/false
- **`consent_telegram`**: true/false
- **`tg_linked`**: true/false (если есть связка `tg_id ↔ user_id`, см. `docs/research/10-*`)

## 8) Словарь чувствительности данных (data classification)

Используем пометки для параметров/полей:
- **P0 (safe)**: технические и агрегированные данные (path, UTM, `result_level`).
- **P1 (PII)**: email, телефон, tg_id, имя — **не отправлять в аналитику**.
- **P2 (sensitive)**: дневники, анкеты, ответы квиза, “анонимный вопрос”, признаки насилия/самоповреждения — **не отправлять**, только агрегаты и флаги кризисного режима.

## 9) QA‑чеклист трекинга (перед релизом)

- **Полнота**: реализованы все события из PRD `NFR-AN-1` и CJM.
- **Дедупликация**: события не стреляют дважды (особенно `booking_paid`, `booking_confirmed`).
- **Источник истины**: статусы оплаты/подтверждения — только backend/webhooks.
- **PII/тексты**: в payload нет email/телефона/текстов дневников/анкеты/вопросов.
- **UTM/deep links**: `cta_tg_click` содержит `deep_link_id` и UTM; склейка TG↔Web возможна через `deep_link_id`.
- **Кризисный режим**: `crisis_banner_shown` фиксируется, но не содержит деталей.

## 10) Рекомендации по внедрению (чтобы трекинг был консистентным)

### 10.1 Web: единая точка отправки (dataLayer/track)

Рекомендуемый подход: одна функция/адаптер `track(event_name, properties)` (или `window.dataLayer.push(...)`), которая:
- добавляет общий контекст (`schema_version`, `event_id`, `occurred_at`, `session_id`, `anonymous_id`, `page`, `acquisition`);
- валидирует “запрещённые поля” (PII/тексты) и не отправляет событие при нарушении;
- нормализует значения (например, `result_level` только из `low|moderate|high`).

### 10.2 Backend: события “истины”

События статусов, которые нельзя доверять фронтенду:
- `booking_paid` (только по webhook провайдера),
- `booking_confirmed` (после атомарного создания брони/встречи),
- `payment_failed` (категоризация ошибок со стороны backend).

### 10.3 Telegram: склейка через deep_link_id

Для каждого TG‑CTA генерируем `deep_link_id` и передаём его:
- в `cta_tg_click` (web),
- в TG‑боте при старте/подписке (`tg_subscribe_confirmed`, `tg_onboarding_completed`),
чтобы связать источник на сайте и факт активации в Telegram без передачи PII.

## 11) Mapping на KPI/воронки (минимум для дашбордов)

### 11.1 Booking funnel

- **Step 1**: `booking_start`
- **Step 2**: `booking_slot_selected`
- **Step 3**: `booking_paid`
- **Step 4**: `booking_confirmed`

Срезы: `entry_point`, `topic`, `service_slug`, `format`, `timezone`.

### 11.2 Telegram funnel

- **Step 1**: `cta_tg_click`
- **Step 2**: `tg_subscribe_confirmed`
- **Step 3**: `tg_onboarding_completed`
- **Step 4** (опционально): `booking_start` (с `utm_source=telegram` или по `deep_link_id`)

### 11.3 Interactive funnel

- **Step 1**: `start_quiz` **или** `navigator_start` **или** `resource_thermometer_start`
- **Step 2**: `complete_quiz` **или** `navigator_complete` **или** `resource_thermometer_complete`
- **Step 3**: `cta_tg_click` и/или `booking_start`

