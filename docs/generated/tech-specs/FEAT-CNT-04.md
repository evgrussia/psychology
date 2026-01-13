# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-CNT-04`  
**Epic:** `EPIC-02`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~70k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Запускаем подборки контента `/curated/` (минимум 5 подборок) + управление из админки: создавать подборку, добавлять элементы (статьи/ресурсы/интерактивы), сортировать, публиковать.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** решение `docs/Technical-Decisions.md` — запускать в релизе 1; улучшает навигацию и удержание.
- **Ожидаемый эффект:** увеличение глубины просмотра и сохранений, мягкая конверсия в TG/booking.
- **Если не сделать:** каталог станет “плоским”, пользователю сложнее найти “следующее полезное”.

### 1.3 Ссылки на первоисточники
- Technical decisions: `docs/Technical-Decisions.md` (2.2)
- IA: `docs/information-architecture.md` (`/curated/*`)
- Admin spec: `docs/Admin-Panel-Specification.md` (4.6)
- Data model: `docs/Модель-данных.md` (`curated_collections`, `curated_items`)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Хаб `/curated/` + страница `/curated/{collection-slug}/`.
- **G2:** Админка `/admin/curated/` для owner/editor.
- **G3:** Поддержка типов подборок (problem/format/goal/context).
- **G4:** Элементы подборки: контент + интерактивы, порядок (drag & drop).

### 2.2 Non-goals (что осознанно НЕ делаем)
- Персонализированные подборки.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Пользователь открывает “Стартовый набор: тревога” и проходит 1–2 элемента.
- **US-2:** Editor создаёт подборку, добавляет 10 элементов, публикует.

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 5 подборок релиза 1 поддерживаются (CUR-01..05 из Technical Decisions).
- [ ] AC-2 Порядок элементов сохраняется и отображается на публичной странице.

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** Пустая подборка → бережный empty state + “С чего начать”.

---

## 4) UX / UI (что увидит пользователь)
- Public: `/curated/`, `/curated/{slug}/`
- Admin: `/admin/curated/`

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)
- **Application:** `ListCuratedCollectionsUseCase`, `GetCuratedCollectionUseCase`, `UpsertCuratedCollectionUseCase`, `ReorderCuratedItemsUseCase`.
- **Domain:** `CuratedCollection`, `CuratedItem`.
- **Infrastructure:** repo + join на content/interactives.

---

## 6) Модель данных (БД) и миграции
Используем `curated_collections`, `curated_items` (см. `docs/Модель-данных.md`). Данные P0.

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
| Endpoint | Method | Auth | Response |
|---|---:|---|---|
| `/api/public/curated` | GET | public | `{collections[]}` |
| `/api/public/curated/{slug}` | GET | public | `{collection, items[]}` |

### 7.2 Admin API
| Endpoint | Method | Role | Назначение |
|---|---:|---|---|
| `/api/admin/curated` | GET/POST | owner/editor | список/создать |
| `/api/admin/curated/{id}` | GET/PUT | owner/editor | получить/обновить |
| `/api/admin/curated/{id}/items/reorder` | POST | owner/editor | порядок |
| `/api/admin/curated/{id}/publish` | POST | owner/editor | публикация |

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)
Достаточно `page_view` + `cta_click` + `save_resource` (если пользователь сохраняет элементы).

---

## 9) Security / Privacy / Compliance
Нет PII/P2.

---

## 10) Надёжность, производительность, деградации
SSG/ISR.

---

## 11) Rollout plan
- `curated_enabled` (stage → prod)

---

## 12) Test plan
- E2E: `/curated/` → открыть подборку → открыть статью/ресурс.

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Добавлять ли в подборку “общую оценку времени” автоматически (можно P1).

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** минимальные подборки (5 шт.) в релиз 1, управление из админки.

