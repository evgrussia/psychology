# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-CNT-01`  
**Epic:** `EPIC-02`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~240k токенов (≤ 270k, близко к лимиту → см. slices)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Реализуем CMS в админке для контента (markdown + live preview) и каркас публичной выдачи: статьи/ресурсы/лендинги тем/служебные страницы, с SEO‑полями, медиа‑вставками, статусами и минимальным версионированием.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** контент — основной канал SEO и “бережной помощи”.
- **Ожидаемый эффект:** рост органики и вовлечения (`page_view`, `save_resource`, `booking_start`).
- **Если не сделать:** блокируется EPIC-01/02 и значительная часть админки.

### 1.3 Ссылки на первоисточники
- Admin spec: `docs/Admin-Panel-Specification.md` (4.4 Контент, 4.4.4 Медиа)
- Technical decisions: `docs/Technical-Decisions.md` (markdown + live preview)
- IA: `docs/information-architecture.md` (`/blog/*`, `/resources/*`, `/about/`, `/how-it-works/`, `/legal/*`)
- PRD: `docs/PRD.md` (FR-CNT-1..3)
- Tracking: `docs/Tracking-Plan.md` (content events)
- Data model: `docs/Модель-данных.md` (content_items/tags/topics/media_assets)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Контент‑типы:
  - `article` (блог),
  - `resource` (упражнение/аудио/чек‑лист),
  - `landing` (лендинг темы),
  - `page` (служебные/доверие/юридические).
- **G2:** Редактор: markdown (CodeMirror/Monaco) + live preview.
- **G3:** Статусы: draft → review(optional) → published → archived.
- **G4:** SEO поля: meta title/description + canonical (опционально).
- **G5:** Метаданные: темы/теги, формат, time_to_benefit, support_level.
- **G6:** Интеграция с медиа (`FEAT-PLT-04`): вставка изображений/аудио/PDF.
- **G7:** QA чеклист публикации (из Admin spec) + блокировка публикации без обязательных пунктов (как минимум: дисклеймер/alt/CTA).

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** WYSIWYG редактор (решение: markdown).
- **NG2:** Полный “автогенератор” перелинковки — достаточно подсказок.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Editor создаёт статью, добавляет темы/теги, вставляет изображение, публикует.
- **US-2:** Owner редактирует страницу `/about/` без разработчика.
- **US-3:** Публичный пользователь читает `/blog/{slug}/` и видит CTA “попробовать сейчас”.

### 3.2 Out-of-scope
- Локализация (мультиязычность).

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 CRUD контента из админки + публичная выдача по slug.
- [ ] AC-2 Markdown preview совпадает с публичным рендером.
- [ ] AC-3 Публикация требует прохождения QA чеклиста (минимум).
- [ ] AC-4 Медиа вставляется без ручного копирования URL (через picker).

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** Дубль slug в рамках типа → ошибка и подсказка.
- **NS-2:** Ошибка рендера markdown (битый синтаксис) → показываем fallback и логируем.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
- **Admin:** `/admin/content/` (список), `/admin/content/{type}/{id}` (редактор), `/admin/content/media/` (медиа).
- **Public:** `/blog/`, `/blog/{slug}/`, `/resources/`, `/resources/{slug}/`, `/s-chem-ya-pomogayu/{topic}/` (лендинги тем), `/about/`, `/how-it-works/`, `/legal/*`.
- **Состояния UI:** loading / empty / error / success.

### 4.2 A11y (минимум)
- [ ] Редактор доступен с клавиатуры.
- [ ] Для изображений требуется alt (или “декоративное”).

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation:** admin UI + public pages; API controllers.
- **Application:** use cases:
  - `CreateContentItemUseCase`
  - `UpdateContentItemUseCase`
  - `PublishContentItemUseCase`
  - `ListContentItemsUseCase`
  - `GetContentItemBySlugUseCase`
- **Domain:** `ContentItem`, `Tag`, `Topic`, `MediaAsset` (в Content context).
- **Infrastructure:** Postgres repositories; markdown renderer; media storage adapter (локальная статика на VPS, `FEAT-PLT-04`).

### 5.2 Основные use cases (сигнатуры)
- `PublishContentItemUseCase.execute({ id, qaChecklist }): void`
- `GetContentItemBySlugUseCase.execute({ type, slug }): { content }`

### 5.3 Доменные события (если нужны)
- `ContentPublished` (consumer: analytics/audit).

---

## 6) Модель данных (БД) и миграции

### 6.1 Новые/изменённые сущности
По `docs/Модель-данных.md`:
- `content_items`, `topics`, `tags`, `content_item_topics`, `content_item_tags`
- `media_assets`, `content_media`
- (опционально) `content_item_versions` / `content_item_revisions` (если нужно версионирование)

### 6.2 P0/P1/P2 классификация данных
- **P0:** body_markdown (публичный контент), теги, темы.
- **P1/P2:** не должно быть пользовательского текста, кроме UGC (не здесь).

### 6.3 Миграции
Если версионирование не описано в базовой модели — добавить таблицу `content_revisions`:
- хранить `body_markdown`, `meta`, `changed_by_user_id`, `created_at`.

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
| Endpoint | Method | Auth | Request | Response | Ошибки |
|---|---:|---|---|---|---|
| `/api/public/content/{type}/{slug}` | GET | public | — | `200 {content}` | 404 |
| `/api/public/content/{type}` | GET | public | фильтры | `200 {items[]}` | — |

### 7.2 Admin API
| Endpoint | Method | Role | Назначение |
|---|---:|---|---|
| `/api/admin/content` | GET | owner/editor | список |
| `/api/admin/content` | POST | owner/editor | создать |
| `/api/admin/content/{id}` | GET | owner/editor | получить |
| `/api/admin/content/{id}` | PUT | owner/editor | обновить |
| `/api/admin/content/{id}/publish` | POST | owner/editor | публикация + QA |
| `/api/admin/content/{id}/archive` | POST | owner/editor | архив |

### 7.3 Интеграции (внешние)
- Медиа-статика (через `FEAT-PLT-04`).

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)

### 8.1 События (таблица)
| Event name | Source | Когда срабатывает | Props (P0-only) | Запреты |
|---|---|---|---|---|
| `page_view` | web | просмотр страницы | `page_path`, `content_type`, `content_slug` | — |
| `save_resource` | web | “сохранить” ресурс | `resource_slug`, `save_target` | — |
| `admin_content_published` | admin | публикация | `content_type`, `content_slug` | без текста |

### 8.2 Воронка / метрики успеха
- рост вовлечения в ресурсы: `save_resource`,
- переходы в booking/tg из контента (CTA клики).

---

## 9) Security / Privacy / Compliance

### 9.1 Privacy by design (обязательные пункты)
- [ ] В админском логировании не хранить “черновики заметок” с P2 (если появятся).

### 9.2 RBAC и аудит
- публикация/архив → audit log.

---

## 10) Надёжность, производительность, деградации

### 10.1 SLA/SLO (если критично)
- быстрый рендер контента: SSG для опубликованного, ISR/кэш для списка.

### 10.3 Деградации (fallback)
- если медиа недоступно, страница остаётся читабельной (alt/placeholder).

---

## 11) Rollout plan

### 11.1 Фича‑флаг / поэтапное включение
- `cms_enabled`: internal → stage → prod.

---

## 12) Test plan

### 12.1 Unit tests
- slugify, markdown renderer, QA checklist validator.

### 12.2 Integration tests
- create draft → publish → public GET by slug.

### 12.3 E2E (критические happy paths)
- admin: создать статью → опубликовать → открыть публичную `/blog/{slug}`.

### 12.4 Проверка privacy
- [ ] в событиях/логах нет body_markdown

### 12.5 A11y smoke
- [ ] editor: таб, фокус, aria в preview.

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Статус `review` обязателен или можно пропустить (для релиза 1 можно убрать, оставить draft/published/archived).
- [ ] Делаем ли дифф версий сразу или только список ревизий (минимум: список + откат).

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** markdown + live preview; QA чеклист перед публикацией; медиа через локальную статику (VPS).

---

## Appendix: Implementation slices (чтобы уложиться в контекст)

> Если агенту Cursor не хватает контекста/лимита — делать по очереди, закрывая каждый slice полностью.

1. **Slice A (~90k):** БД + базовый CRUD контента (без версий) + публичный read by slug.
2. **Slice B (~60k):** Markdown editor + live preview + renderer (единый).
3. **Slice C (~50k):** SEO поля + списки/фильтры + темы/теги.
4. **Slice D (~40k):** QA чеклист публикации + минимальное версионирование (history + rollback).

