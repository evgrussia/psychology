# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-PLT-02`  
**Epic:** `EPIC-00`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~180k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Поднимаем PostgreSQL как основную БД и реализуем полный набор миграций для Release 1 по `docs/Модель-данных.md` (с учётом privacy by design, индексов и ограничений), чтобы все домены (booking, payments, content, interactive, CRM, admin, UGC) могли работать.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** почти все P0 фичи зависят от схемы БД (Roadmap зависимости).
- **Ожидаемый эффект:** единая модель данных, гарантия консистентности, возможность интеграционных тестов.
- **Если не сделать:** разъезжающиеся модели в коде и “ручные” правки БД, высокий риск privacy/comppliance ошибок.

### 1.3 Ссылки на первоисточники
- Data model: `docs/Модель-данных.md`
- Domain model: `docs/Domain-Model-Specification.md` (маппинг агрегатов)
- PRD: `docs/PRD.md` (FR и NFR по приватности)
- Tracking: `docs/Tracking-Plan.md` (классификация P0/P1/P2)
- Admin spec: `docs/Admin-Panel-Specification.md`
- Roadmap: `docs/Roadmap-Backlog.md` (`FEAT-PLT-02`)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Базовая схема Postgres для Release 1 полностью соответствует `docs/Модель-данных.md`.
- **G2:** Миграции идемпотентны в CI, воспроизводимы локально и в prod.
- **G3:** P2 поля (анкеты/дневники/UGC тексты) хранятся **зашифрованными “в покое”** (см. `FEAT-SEC-02`), но БД готова (колонки, типы).
- **G4:** Индексы/уникальности обеспечивают требования: slug uniqueness, conflict-check для booking, SLA модерации.
- **G5:** Подготовить базовые seed-данные (topics, roles) для dev/test.

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** Оптимизация на “миллионы записей” (но закладываем индексы и эволюцию).
- **NG2:** Event sourcing как обязательный паттерн (опционально позже).

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Разработчик запускает `docker-compose`, применяет миграции и получает рабочую БД для всех P0 фич.
- **US-2:** CI поднимает test DB, прогоняет миграции, выполняет integration tests.
- **US-3:** В prod миграции применяются безопасно: forward-only, без потери данных без процедуры.

### 3.2 Out-of-scope
- Полное наполнение контентом (статьи/термины) — это не часть миграций, только схема + seed.

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 Все таблицы/enum/constraints из `docs/Модель-данных.md` присутствуют в миграциях.
- [ ] AC-2 Есть seed: роли (`owner/assistant/editor/client`), темы (`anxiety/burnout/...`).
- [ ] AC-3 Есть базовые индексы для критичных запросов (booking conflicts, content by slug, moderation queue).
- [ ] AC-4 Миграции проходят на пустой БД и на stage/prod без ручных действий.

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** Попытка вставить запрещённый дубль (например, slug) → понятная ошибка (unique constraint).
- **NS-2:** Попытка сохранить P2 “в открытую” (без encryption pipeline) → блокируем на уровне приложения (`FEAT-SEC-02`), но БД принимает шифротекст.

---

## 4) UX / UI (что увидит пользователь)
Не применимо (платформа).

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Infrastructure (persistence):** Postgres + миграции + (опционально) ORM/Query builder.
- **Domain:** агрегаты и VO из `docs/Domain-Model-Specification.md` маппятся на таблицы (см. таблицу mapping в конце доменной спеки).
- **Application:** use cases используют repository interfaces, реализации — в infra.

### 5.2 Основные use cases (сигнатуры)
Схема БД должна поддержать use cases для:
- booking: создание/подтверждение/перенос/отмена/исход встречи
- payments: intent + webhook
- content: draft/review/publish, версии
- interactive: runs с агрегатами
- admin: аудит, CRM, модерация

### 5.3 Доменные события (если нужны)
БД должна уметь хранить:
- audit log записи,
- (опционально) outbox таблицу для событий (если решим “надёжные события” для webhook/analytics).

---

## 6) Модель данных (БД) и миграции

### 6.1 Новые/изменённые сущности
Полный перечень см. `docs/Модель-данных.md`. Для Release 1 обязательный минимум доменов:
- **Identity:** `users`, `roles`, `user_roles`, `consents`
- **Content:** `content_items`, `topics`, `tags`, `content_item_topics`, `content_item_tags`, `media_assets`, `content_media`, `curated_collections`, `curated_items`, `glossary_terms`, `glossary_term_synonyms`, (и связки/линки если в модели)
- **Interactive:** `interactive_definitions`, `interactive_versions` (если предусмотрено), `interactive_runs` (только агрегаты), `rituals`/`scripts` (если вынесены в отдельные таблицы), либо всё через definitions
- **Booking/Payments:** `services`, `schedule_rules`/`slots` (если есть), `appointments`, `payments`, `intake_forms` (encrypted), `waitlist_requests`
- **UGC:** `ugc_items`/`ugc_moderation_items`, `moderation_actions`, `ugc_answers` (encrypted), `ugc_triggers` (флаги)
- **CRM:** `leads`, `lead_identities`, `lead_timeline_events` (P0-only payload), `lead_notes` (internal, может быть P2 → шифровать)
- **Admin/Audit:** `admin_users` (или те же users с admin roles), `audit_log_entries`, `message_templates`, `system_settings`
- **Analytics (server-side):** (если храним) `analytics_events_raw`/`analytics_events` (P0 only) или интеграция во внешний провайдер (тогда таблица опциональна)

> Точная нормализация (что отдельной таблицей, что JSONB) должна соответствовать `docs/Модель-данных.md`. Если в документе допускается JSONB (VO), используем JSONB для упрощения DDD-mapping.

### 6.2 P0/P1/P2 классификация данных
Соблюдаем `docs/Tracking-Plan.md` и `docs/Модель-данных.md`:
- **P0:** slugs, агрегаты `result_level`, `topic`, технические id, UTM (без PII), статусы.
- **P1:** email/phone/telegram_user_id — в таблице `users`/`lead_identities`, не в аналитике.
- **P2:** дневники, анкеты, UGC тексты, ответы квизов (если где-то сохраняются) — **только encrypted payload**, отдельные политики доступа.

### 6.3 Миграции
- **Migration plan:** набор миграций по доменам (00xx_identity, 01xx_content, 02xx_interactive, 03xx_booking, ...).
- **Rollback:** для prod:
  - запрещаем destructive миграции без двухшаговой процедуры (add → backfill → switch → drop позже),
  - в критичных миграциях обязательно прописываем “rollback note”.
- **Backfill:** если появляются новые обязательные поля — backfill отдельной задачей, с мониторингом и лимитами.

---

## 7) API / Контракты (если применимо)
Не применимо напрямую; это уровень persistence.

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)

### 8.1 События (таблица)
БД должна поддерживать хранение:
- **CRM timeline**: события из Tracking Plan без PII/текстов (строго P0 props).
- **Audit log**: админские действия.

### 8.2 Воронка / метрики успеха
Запросы для админ-дашбордов должны быть выполнимы по схеме (см. `docs/Admin-Panel-Specification.md`):
- booking funnel (4 шага),
- интерактивы (starts/completions),
- модерация (SLA),
- no-show rate (через outcome).

---

## 9) Security / Privacy / Compliance

### 9.1 Privacy by design (обязательные пункты)
- [ ] P2 поля выделены и помечены как encrypted payload.
- [ ] Для таблиц с P2 включён ограниченный доступ на уровне приложения (RBAC).
- [ ] В таблицах аналитики/CRM timeline нет PII/текстов.

### 9.2 RBAC и аудит
Таблицы должны поддерживать RBAC:
- разделение admin roles и client role,
- таблицы audit log.

### 9.3 Кризисный режим (если применимо)
Храним только флаги/категории триггеров (P0), не детали.

---

## 10) Надёжность, производительность, деградации

### 10.1 SLA/SLO (если критично)
Индексы для:
- очереди модерации (status + created_at),
- расписания/конфликтов (start/end + status),
- content (type + slug + status).

### 10.2 Retry / idempotency
Заложить уникальные ключи для идемпотентности:
- `payments.provider_payment_id` unique,
- `yookassa_webhook_event_id` (если сохраняем) unique,
- `deep_links.deep_link_id` unique.

### 10.3 Деградации (fallback)
Не применимо.

---

## 11) Rollout plan

### 11.1 Фича‑флаг / поэтапное включение
Не применимо.

### 11.2 Миграция данных и обратимость
- запуск stage с чистой БД,
- затем prod с “миграции вперёд”.

### 11.3 Коммуникации (если нужно)
Док для команды: как применять миграции локально/CI/prod.

---

## 12) Test plan

### 12.1 Unit tests
- тесты на SQL/ORM схему не обязательны; вместо этого — “schema snapshot” (опционально).

### 12.2 Integration tests
- поднять Postgres в контейнере → применить миграции → выполнить smoke запросы:
  - вставка/чтение пользователя,
  - вставка контент-айтема,
  - вставка интерактивного run с `result_level`,
  - вставка записи + платежа.

### 12.3 E2E (критические happy paths)
На уровне БД не применимо.

### 12.4 Проверка privacy
- [ ] В тестах гарантировать, что в “analytics/CRM timeline” нельзя вставить PII/текст (валидация в приложении).

### 12.5 A11y smoke
Не применимо.

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] UUID vs ULID как PK (рекомендуется UUID v4 для простоты; ULID — если нужен сортируемый ID для timeline).
- [ ] Хранение VO: отдельные колонки vs JSONB (рекомендуется JSONB для VO-структур, где это упрощает DDD mapping).

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** схема БД соответствует `docs/Модель-данных.md`; P2 данные только encrypted payload; критичные уникальности для идемпотентности (payments/deep links) обязательны.

