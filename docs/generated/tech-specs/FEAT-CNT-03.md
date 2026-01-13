# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-CNT-03`  
**Epic:** `EPIC-02`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~70k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Запускаем словарь терминов `/glossary/` (минимум 10–15 терминов) с управлением из админки: страницы термина, категории, перелинковка на статьи/ресурсы/лендинги тем.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** решение `docs/Technical-Decisions.md` — запускать в релизе 1 (минимальная версия) ради SEO и доверия.
- **Ожидаемый эффект:** дополнительные SEO входы, повышение экспертности.
- **Если не сделать:** потеря органики, меньше “образовательных” точек контакта.

### 1.3 Ссылки на первоисточники
- Technical decisions: `docs/Technical-Decisions.md` (2.1)
- IA: `docs/information-architecture.md` (`/glossary/*`)
- Admin spec: `docs/Admin-Panel-Specification.md` (4.7)
- Data model: `docs/Модель-данных.md` (`glossary_terms`)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Хаб `/glossary/` + страница `/glossary/{term-slug}/`.
- **G2:** CRUD терминов в админке (`/admin/glossary/`) для owner/editor.
- **G3:** Категории: approach/state/concept (как в модели данных).
- **G4:** Связанные материалы (статьи/ресурсы/лендинги) — минимум через “ручной выбор” или по тегам/темам.

### 2.2 Non-goals (что осознанно НЕ делаем)
- Автоподсветка терминов по всему сайту (можно P1).

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Пользователь из SEO открывает термин и видит “что это” + ссылки на материалы.
- **US-2:** Editor создаёт термин и публикует.

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 Страницы словаря индексируются (SEO meta).
- [ ] AC-2 Термины редактируются в админке через markdown.

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** slug не найден → 404 с навигацией.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
- Public: `/glossary/`, `/glossary/{term-slug}/`
- Admin: `/admin/glossary/`

### 4.2 A11y (минимум)
- [ ] Список терминов доступен с клавиатуры.

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)
- **Presentation:** страницы словаря + админ редактор.
- **Application:** `ListGlossaryTermsUseCase`, `GetGlossaryTermUseCase`, `UpsertGlossaryTermUseCase`, `PublishGlossaryTermUseCase`.
- **Domain:** `GlossaryTerm`.
- **Infrastructure:** Postgres repo; markdown renderer.

---

## 6) Модель данных (БД) и миграции
Используем таблицы из `docs/Модель-данных.md`:
- `glossary_terms`, `glossary_term_synonyms`, (опционально) links to content.

Классификация данных: P0.

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
| Endpoint | Method | Auth | Request | Response |
|---|---:|---|---|---|
| `/api/public/glossary` | GET | public | фильтры | `{terms[]}` |
| `/api/public/glossary/{slug}` | GET | public | — | `{term}` |

### 7.2 Admin API
| Endpoint | Method | Role | Назначение |
|---|---:|---|---|
| `/api/admin/glossary` | GET/POST | owner/editor | список/создать |
| `/api/admin/glossary/{id}` | GET/PUT | owner/editor | получить/обновить |
| `/api/admin/glossary/{id}/publish` | POST | owner/editor | публикация |

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)
Можно ограничиться `page_view` + `cta_click` на “обсудить на консультации”.

---

## 9) Security / Privacy / Compliance
Нет PII/текста пользователя.

---

## 10) Надёжность, производительность, деградации
SSG/ISR.

---

## 11) Rollout plan
- `glossary_enabled` (stage → prod)

---

## 12) Test plan
- E2E: `/glossary/` → открыть термин → CTA “Запись”.

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Нужно ли “поиск по словарю” в релизе 1 (рекомендация: простой поиск по заголовку).

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** запускаем минимальный словарь (15 терминов), управление через CMS/markdown.

