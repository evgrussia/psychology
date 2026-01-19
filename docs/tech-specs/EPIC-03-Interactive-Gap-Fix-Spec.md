# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** draft  

**Feature ID:** `FEAT-INT-05-GAP`  
**Epic:** `EPIC-03`  
**Приоритет:** P0  
**Трекер:** —  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Закрываем пробелы в реализации мини‑ритуалов (FEAT‑INT‑05): корректируем момент старта/завершения run и трекинга, добавляем недостающие админ‑операции (создание/архив), и устраняем расхождение по публичным API путям.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** старт события фиксируется при открытии страницы, что искажает метрики.
- **Ожидаемый эффект:** корректный `ritual_started/ritual_completed`, стабильная работа админ‑контента без ручных сидов.
- **Если не сделать:** риск неверной аналитики, невозможность создавать/архивировать ритуалы из админки.

### 1.3 Ссылки на первоисточники
- FEAT‑INT‑05: `docs/generated/tech-specs/FEAT-INT-05.md`
- IA: `docs/information-architecture.md`
- Tracking: `docs/Tracking-Plan.md`
- Admin spec: `docs/Admin-Panel-Specification.md` (раздел ритуалов)
- Data model: `docs/Модель-данных.md`

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** `ritual_started` и создание `InteractiveRun` происходят при явном старте ритуала (кнопка “Начать ритуал”), а не при открытии карточки.
- **G2:** Публичные пути соответствуют техспеке: доступны `/api/public/rituals` и `/api/public/rituals/{slug}` (алиасы к `/api/public/interactive/rituals*`).
- **G3:** Админка поддерживает создание и архивирование ритуалов (минимальный CRUD: create + update + publish + archive).

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** Редизайн UI ритуалов.
- **NG2:** Новые типы контента или AI‑генерация.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US‑1:** Пользователь открывает ритуал → событие `ritual_started` фиксируется только после клика “Начать”.
- **US‑2:** Админ создаёт новый ритуал в UI → редактирует шаги → публикует.
- **US‑3:** Админ архивирует ритуал → он исчезает из публичного каталога.
- **US‑4:** Клиентский код может использовать `/api/public/rituals` без изменения UX.

### 3.2 Out-of-scope
- Миграция существующих данных (остаются как есть).

### 3.3 Acceptance criteria (AC)
- [ ] AC‑1 `ritual_started` отправляется только после явного старта, не при рендере страницы.
- [ ] AC‑2 `InteractiveRun` создаётся при старте, `complete` вызывается при завершении (без “ранних” runs).
- [ ] AC‑3 `/api/public/rituals` и `/api/public/rituals/{slug}` возвращают те же данные, что и `/api/public/interactive/rituals*`.
- [ ] AC‑4 Админка имеет кнопку “Создать ритуал” и действие “Архивировать”.
- [ ] AC‑5 Архивные ритуалы не возвращаются публичным API.

### 3.4 Негативные сценарии (обязательные)
- **NS‑1:** Админ пытается создать ритуал без шагов → 400 с валидацией.
- **NS‑2:** Публичный запрос к архивному ритуалу → 404.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
- **Админ:** `apps/admin/src/app/interactive/rituals/page.tsx` — кнопка “Создать ритуал”.
- **Админ:** `apps/admin/src/app/interactive/rituals/[id]/page.tsx` — действие “Архивировать” (status = archived).
- **Web:** карточка ритуала — старт/трекинг только после клика.

### 4.2 A11y (минимум)
- [ ] Кнопка старта остаётся доступной с клавиатуры.
- [ ] Управление архивацией доступно по фокусу/клавиатуре.

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation (web):** перенос `trackRitualStart` и `startRun` в обработчик кнопки старта.
- **Presentation (admin):** создание и архивирование ритуалов в UI.
- **Application:** новый use case `CreateInteractiveDefinitionUseCase` (тип `RITUAL`) + расширение publish/archival.
- **Domain:** без изменений.
- **Infrastructure:** репозиторий определений — поддержка create, сохранение статуса `archived`.

### 5.2 Основные use cases (сигнатуры)
- `CreateInteractiveDefinitionUseCase.execute({ type, slug, title, topicCode?, config }): { id }`
- `ArchiveInteractiveDefinitionUseCase.execute({ id }): void` (или использовать `UpdateInteractiveDefinitionUseCase` с `status=archived`)

---

## 6) Модель данных (БД) и миграции

### 6.1 Новые/изменённые сущности
- Используется существующая `interactive_definitions`.
- Статус `archived` уже поддерживается enum — без миграций.

### 6.2 P0/P1/P2 классификация данных
- **P0:** slug, title, config ритуала.
- **P1/P2:** отсутствуют.

### 6.3 Миграции
- Не требуются.

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
| Endpoint | Method | Auth | Request | Response | Ошибки |
|---|---:|---|---|---|---|
| `/api/public/rituals` | GET | public | — | `{items[], total}` | 200 |
| `/api/public/rituals/{slug}` | GET | public | — | `{ritual}` | 404 |

### 7.2 Admin API
| Endpoint | Method | Role | Назначение |
|---|---:|---|---|
| `/api/admin/interactive/rituals` | POST | owner/editor | создать ритуал |
| `/api/admin/interactive/rituals/{id}/archive` | POST | owner/editor | архивировать |

---

## 8) Tracking / Analytics

### 8.1 События
| Event name | Source | Когда срабатывает | Props (P0-only) | Запреты |
|---|---|---|---|---|
| `ritual_started` | web | клик “Начать ритуал” | `ritual_slug`, `topic` | без текста |
| `ritual_completed` | web | завершение ритуала | `ritual_slug`, `duration_ms` | без текста |

---

## 9) Security / Privacy / Compliance

### 9.1 Privacy by design
- [ ] В событиях нет текста шагов.
- [ ] Контент ритуалов хранится в `definition_json`, не попадает в аналитику.

---

## 10) Надёжность, производительность, деградации

### 10.3 Деградации
- Если start/complete не удалось отправить — UI завершения остаётся, логируем в консоль (best effort).

---

## 11) Rollout plan

### 11.1 Фича‑флаг
- Не требуется (локальная доработка поведения).

---

## 12) Test plan

### 12.1 Unit tests
- Проверка, что `startRun` вызывается по клику “Начать”, а не при рендере.

### 12.2 Integration tests
- `POST /api/admin/interactive/rituals` создаёт definition.
- `POST /api/admin/interactive/rituals/{id}/archive` скрывает ритуал от public API.

### 12.3 E2E
- Открыть ритуал → нажать “Начать” → `ritual_started` отправлен.
- Завершить ритуал → `ritual_completed` отправлен с `duration_ms`.

### 12.4 Проверка privacy
- [ ] payload событий не содержит текста шагов.

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Нужен ли отдельный UI для удаления ритуала или достаточно `archived`?

### 13.2 Decision log
- **2026-01-19:** старт/трекинг переносим на пользовательский action; добавляем admin‑create и archive.

