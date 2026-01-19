# Tech Spec: Полное доведение проекта до подтверждения реализации решений из `docs/research/README.md`

## Контекст и цель
`docs/research/README.md` — индекс исследовательской базы проекта «Эмоциональный баланс». Цель этой техспеки — описать, **как довести продукт до состояния, где можно формально подтвердить**, что **все решения** из исследовательских документов реализованы (или осознанно помечены как out-of-scope) и проверяемы.

Документ описывает:
- **критерии “подтверждения реализации”** (Definition of Done на уровне всего проекта),
- **coverage‑матрицу** (трассировка “решение → реализация → тест/метрика”),
- **workstreams** по каждому исследовательскому документу,
- **план внедрения** (по фазам),
- **тест‑план и контроль качества**,
- **риски/миграции/контроль изменений**.

## Scope
### In scope
- Полное покрытие решений из:
  - `docs/research/01-IA-and-UserJourneys.md`
  - `docs/research/02-Audience-Personas-JTBD.md`
  - `docs/research/03-Content-SEO-and-Editorial.md`
  - `docs/research/04-Interactive-Modules.md`
  - `docs/research/05-Booking-Payment-ClientCabinet.md`
  - `docs/research/06-Telegram-Ecosystem.md`
  - `docs/research/07-Trust-SocialProof-Profile.md`
  - `docs/research/08-Admin-CRM-Analytics.md`
  - `docs/research/09-AI-Agents-Safety.md`
  - `docs/research/10-Legal-Privacy-Compliance-RU.md`
  - `docs/research/11-Component-Library-and-Copy.md`
  - `docs/research/12-Community-and-Events.md`
  - `docs/research/13-Competitive-Research-*.md` (как input для решений/бэклога)
- Подтверждение соответствия через:
  - страницы/маршруты в `apps/web`,
  - эндпоинты и use-cases в `apps/api`,
  - админ‑инструменты в `apps/admin`,
  - тесты (unit/integration/e2e),
  - события аналитики и отчёты воронок.

### Out of scope (если явно не включаем в продукт)
Любой пункт из исследований может быть помечен как out-of-scope, но только при наличии:
- ссылки на решение в `docs/Technical-Decisions.md` или отдельной ADR,
- обоснования (риски, бюджет/время, стратегия),
- альтернативы/план возврата.

## Архитектурные принципы и ограничения
- Следовать **Clean Architecture** и **DDD** (см. `.cursor/rules/architecture-rules.mdc`).
- “Dependencies point inward”: presentation → application → domain.
- **Безопасность и приватность** — обязательные: минимизация данных, согласия, шифрование PII, audit log.
- UI в web/admin не содержит бизнес‑логики — только orchestration/validation.

## Definition of Done (DoD) проекта “соответствует исследованиям”
Считаем проект “доведённым”, когда выполнены все пункты ниже:

### 1) Coverage‑матрица 100%
- Для каждого решения/требования из исследований есть запись:
  - **источник** (файл/секция/цитата),
  - **артефакт реализации** (route/page/api/use-case/admin),
  - **проверка** (тест/метрика/ручной чек),
  - **статус**: implemented / partial / planned / out-of-scope.

### 2) Нет “битых” маршрутов и CTA
- Все ссылки/CTA ведут на существующие роуты или осознанные редиректы.
- Все Telegram‑CTA используют `createTelegramDeepLink()` и пишут `cta_tg_click` с корректными `flow/source/utm`.

### 3) Публичные сценарии покрыты e2e
Минимум e2e покрывают:
- `/start/*` интерактивы (quiz/navigator/boundaries/rituals/thermometer/prep),
- booking + payment + confirmation,
- cabinet (экспорт/удаление/согласия),
- events (листинг/страница/регистрация),
- TG deep links (создание и атрибуция).

### 4) Админ‑контур полный (операционка без прямой БД)
Для сущностей “контент/интерактивы/услуги/события/модерация/лиды”:
- list/get/create/update/publish (или archive) доступны из админки,
- критичные операции попадают в audit log.

### 5) Privacy & Safety подтверждены
- PII хранится/передаётся согласно `10-Legal-Privacy-Compliance-RU.md`,
- кризис‑сигналы обрабатываются безопасно (crisis-mode, emergency page, запрет “давящих” CTA),
- AI‑функции соответствуют `09-AI-Agents-Safety.md` (ограничения, human-in-the-loop, логи).

## Coverage‑матрица (шаблон)
Создать отдельный файл (или таблицу) и поддерживать его как “единую правду”.

Рекомендуемая форма: `docs/Research-Coverage-Matrix.md`

Пример строки:
- **Source**: `docs/research/04-Interactive-Modules.md` → “Thermometer”
- **Decision**: “Resource thermometer: 3 шкалы, быстрый результат”
- **Implementation**:
  - web: `apps/web/src/app/start/thermometer/[slug]/*`
  - api: `apps/api/src/presentation/controllers/interactive.controller.ts` (`/public/interactive/thermometers/:slug`)
  - admin: `apps/admin/src/app/interactive/thermometer/*`
- **Verification**:
  - e2e: `apps/web/e2e/...`
  - analytics: `thermometer_start`, `thermometer_complete`, `cta_tg_click`
- **Status**: implemented

## Текущее состояние (фикс “минимального набора”)
Это не часть DoD, но фиксирует уже выполненное, чтобы матрица и план не теряли контекст:
- `/start/navigator` индекс‑редирект на дефолтный slug.
- THERMOMETER и PREP реализованы end‑to‑end: доменные config‑типы + public endpoints + web pages + admin editors.
- Telegram CTA унифицированы через `createTelegramDeepLink()`.
- Events: добавлены публичные страницы `/events/*` и админ‑управление (включая registrations), а также админ‑CRUD по services.

## Workstreams по исследованиям

### WS‑01: IA и пользовательские пути (`01-IA-and-UserJourneys.md`)
- **Deliverables**
  - Полная карта роутов web (сопоставление IA → `apps/web/src/app/**`).
  - Навигация (header/footer), breadcrumbs, понятные entry points.
- **Tasks**
  - Проверить и закрыть отсутствующие публичные разделы (например, `contacts` если он в IA).
  - Нормализовать редиректы со старых/маркетинговых URL.
- **Acceptance**
  - 0 “битых” ссылок по всему web.
  - Sitemap/robots актуальны.

### WS‑02: Аудитория/JTBD (`02-Audience-Personas-JTBD.md`)
- **Deliverables**
  - Сегментация и позиционирование отражены в copy, CTA, фичах.
  - Маппинг JTBD → страницы/интерактивы/воронки.
- **Tasks**
  - Для каждого сегмента: “first value” путь (start hub + topic landing + TG/booking).
- **Acceptance**
  - По каждому JTBD есть “минимальный маршрут” и измеримый KPI (см. Tracking Plan).

### WS‑03: Контент/SEO/редактура (`03-Content-SEO-and-Editorial.md`)
- **Deliverables**
  - Шаблоны страниц (article/resource/page/landing) и QA‑чеклист публикации.
  - SEO‑метаданные и schema.org (Article/FAQPage).
- **Tasks**
  - Встроить обязательные дисклеймеры и tone of voice из исследований.
  - Валидации “publish” на стороне API (контент не публикуется без required мета).
- **Acceptance**
  - У каждой страницы корректные title/description/canonical/OG.

### WS‑04: Интерактивы (`04-Interactive-Modules.md`)
- **Deliverables**
  - Полный набор модулей из исследования: мини‑диагностики, дневники, челленджи, “первый шаг”, анонимный вопрос, избранное.
- **Tasks (примерный перечень)**
  - Дневники: UI + шифрование payload + экспорт + напоминания (если предусмотрено).
  - Челленджи/серии: модель прогресса, контент‑шаги, трекинг.
  - Единый каталог интерактивов.
- **Acceptance**
  - Все интерактивы имеют: public route + admin editor + трекинг start/complete.

### WS‑05: Запись/оплата/кабинет (`05-Booking-Payment-ClientCabinet.md`)
- **Deliverables**
  - Сквозной флоу booking/payment/consents.
  - Кабинет: история, материалы, экспорт/удаление, управление согласиями.
- **Acceptance**
  - e2e сценарии покрывают критический happy path и основные ошибки.

### WS‑06: Telegram (`06-Telegram-Ecosystem.md`)
- **Deliverables**
  - Deep links, сегментация, выдача лид‑магнитов, цепочки.
  - Атрибуция TG → lead → booking.
- **Acceptance**
  - Все TG‑входы создают deepLink и пишут события аналитики.

### WS‑07: Доверие/профиль/соц.доказательства (`07-Trust-SocialProof-Profile.md`)
- **Deliverables**
  - Профиль + этика/границы + FAQ.
  - Отзывы/кейсы с согласием на публикацию.
- **Acceptance**
  - Trust‑страницы соответствуют шаблонам и требованиям privacy/safety.

### WS‑08: Admin/CRM/Analytics (`08-Admin-CRM-Analytics.md`)
- **Deliverables**
  - Полный операционный контур: контент/интерактивы/модерация/лиды/услуги/события/аналитика.
- **Tasks**
  - Удалить хардкод URL в админке (всё через `/api/...`).
  - Расширить audit log на критичные операции (publish/price change/etc).
- **Acceptance**
  - Админка не требует ручного вмешательства в БД для ежедневной работы.

### WS‑09: AI safety (`09-AI-Agents-Safety.md`)
- **Deliverables**
  - Политики, ограничения, human‑in‑the‑loop, кризис‑хендлинг.
  - Логи/аудит AI‑ответов.
- **Acceptance**
  - Набор safety‑тесткейсов (red teaming) проходит стабильно.

### WS‑10: Legal/Privacy (`10-Legal-Privacy-Compliance-RU.md`)
- **Deliverables**
  - Карта данных: сбор → хранение → обработка → удаление → экспорт.
  - Согласия: версии, источники, отзыв.
- **Acceptance**
  - Проверяемая реализация (тестами и аудитом), без “серых зон”.

### WS‑11: UI‑kit + microcopy (`11-Component-Library-and-Copy.md`)
- **Deliverables**
  - Единые состояния UI (loading/empty/error/success) и тексты.
  - A11y соответствие (`docs/Accessibility-A11y-Requirements.md`).
- **Acceptance**
  - UI не “рассыпается” по проекту и соответствует design system.

### WS‑12: Community & Events (`12-Community-and-Events.md`)
- **Deliverables**
  - Каталог событий, регистрация, модерация заявок, уведомления.
  - (Опционально) клуб/подписка/группа — если включаем.
- **Acceptance**
  - Полный цикл: анонс → регистрация → напоминания → пост‑материалы → аналитика.

### WS‑13: Competitive research (`13-Competitive-Research-*.md`)
- **Deliverables**
  - Не “копирование”, а **решения**: что берём/не берём, почему, и где это в backlog.
- **Acceptance**
  - Каждая “заимствованная механика” привязана к целям и метрикам.

## Тест‑план
### API
- e2e:
  - интерактивы: получение definition по slug для всех типов + run start/complete,
  - события: list/get/register (ошибки: capacity full, registration closed),
  - booking/payment (критические happy paths),
  - data export/delete (если в scope).

### Web
- Playwright:
  - `/start` (все интерактивы),
  - `/booking` flow,
  - `/events` list/detail/register,
  - TG CTA: мок `createTelegramDeepLink` и проверка `cta_tg_click`.

### Admin
- e2e:
  - create/update/publish: content, interactive, service, event.
  - moderation flows.

## Миграции данных (events)
Добавление `Event/EventRegistration` требует:
- Prisma migration (dev/deploy) и проверку на staging,
- backfill/seed (если нужен стартовый контент),
- мониторинг ошибок и rollback plan.

См. `docs/database-migrations-guide.md`.

## Риски и меры
- **Scope creep**: фиксировать out-of-scope через ADR.
- **Privacy**: любой новый сбор данных проходит ревью по `10-*`.
- **Analytics**: изменения схем событий версионировать; проверять ingestion тестами.
- **AI safety**: любые новые LLM‑фичи — только через safety gate.

## План внедрения (по фазам)
- **Phase A (Coverage & критичные дыры)**: построить матрицу, устранить 404/CTA, закрыть missing public/admin flows.
- **Phase B (Интерактивы/удержание)**: дневники/челленджи/избранное + TG цепочки.
- **Phase C (Compliance & safety hardening)**: ретеншн/удаление/экспорт/аудит/AI‑redteam.
- **Phase D (SEO/UX polishing)**: schema.org, sitemap, performance, accessibility.

