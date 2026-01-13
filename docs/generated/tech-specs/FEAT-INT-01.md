# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-INT-01`  
**Epic:** `EPIC-03`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~200k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Создаём базовую платформу интерактивов без логина: общий рантайм (маршруты, UI‑паттерны, дисклеймеры, кризис‑баннер), хранение **только агрегатов** результатов (`result_level`, `duration_ms`, `crisis_triggered`) и связку с Telegram через `deep_link_id`.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** интерактивы — core domain (time‑to‑benefit) и вход в TG/booking.
- **Ожидаемый эффект:** рост `start_*`/`complete_*`, CTA в TG/booking.
- **Если не сделать:** блокируются QZ/NAV/TRM/BND/RIT и кризисный режим.

### 1.3 Ссылки на первоисточники
- PRD: `docs/PRD.md` (FR-INT-1..7)
- Interactive matrix: `docs/Interactive-Modules-Matrix.md` (общие правила)
- IA: `docs/information-architecture.md` (`/start/*`, `/interactive/*`)
- Tracking: `docs/Tracking-Plan.md` (interactive events + запреты)
- Telegram deep links: `docs/Telegram-Deep-Links-Schema.md`
- Domain model: `docs/Domain-Model-Specification.md` (InteractiveRun aggregate)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Интерактивы доступны гостю без обязательного контакта (FR-INT-1).
- **G2:** Сохраняем только агрегаты:
  - `result_level` / `resource_level` / `result_profile` (если применимо),
  - `duration_ms`,
  - `crisis_triggered` (boolean/category),
  - технические IDs (quiz_slug, navigator_slug, ritual_slug, variant_id).
- **G3:** Единые UI‑паттерны: start → progress → result (+ CTA TG/booking).
- **G4:** Кризисный режим перекрывает CTA “прогрева”.
- **G5:** `anonymous_id` для трекинга и связки с runs (см. Tracking plan).

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** Хранение сырых ответов квизов/текстов (запрещено).
- **NG2:** Персонализация на основе текста.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Гость запускает интерактив (квиз/навигатор/термометр/скрипты/ритуал) и получает результат.
- **US-2:** После результата нажимает “Получить план в Telegram” → deep link.
- **US-3:** При кризисном триггере видит экстренную помощь и безопасные альтернативы.

### 3.2 Out-of-scope
- Сохранение “избранного” в аккаунт (можно localStorage в рамках web; серверное — позже/в ЛК).

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 В БД сохраняются только агрегаты runs (без сырых ответов).
- [ ] AC-2 Отправляются события `start_*`, `complete_*` и `crisis_banner_shown` по Tracking Plan.
- [ ] AC-3 CTA TG генерирует `deep_link_id` и отправляет `cta_tg_click`.

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** Ошибка сохранения run → результат всё равно показывается, но backend логирует ошибку (best effort).
- **NS-2:** Интеграция Telegram недоступна → показываем fallback (копировать ссылку/перейти на канал) без PII.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
По IA:
- `/start/` (хаб)
- `/start/quizzes/`, `/interactive/quizzes/{quiz-slug}/`
- `/start/navigator/` (NAV)
- `/start/resource-thermometer/` (TRM)
- `/start/boundaries-scripts/` (BND)
- `/start/rituals/` (RIT)
- `/start/consultation-prep/` (PRP, если включаем как тип интерактива)
- состояния: loading/empty/error/success

### 4.2 A11y (минимум)
- [ ] Все шаги интерактива доступны с клавиатуры.
- [ ] Семантические радиогруппы/кнопки.
- [ ] Видимый фокус и контраст.

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation:** web страницы интерактивов + shared components (Progress, ResultCard, CTAButtons, CrisisBanner).
- **Application:** use cases:
  - `StartInteractiveRunUseCase`
  - `CompleteInteractiveRunUseCase`
- **Domain:** `InteractiveRun` (Aggregate Root), `ResultLevel`, `RunMetadata`, `CrisisTrigger` (VO).
- **Infrastructure:** `InteractiveRunRepository` (Postgres), analytics adapter.

### 5.2 Основные use cases (сигнатуры)
- `StartInteractiveRunUseCase.execute({ interactiveSlug, anonymousId, topic?, entryPoint }): { runId }`
- `CompleteInteractiveRunUseCase.execute({ runId, resultAggregate }): void`

### 5.3 Доменные события (если нужны)
- `InteractiveRunStarted`, `InteractiveRunCompleted`, `CrisisTriggered` (см. Domain model).

---

## 6) Модель данных (БД) и миграции

### 6.1 Новые/изменённые сущности
По `docs/Модель-данных.md`:
- `interactive_runs`:
  - `interactive_definition_id`/`interactive_slug`
  - `anonymous_id` (nullable) / `user_id` (nullable)
  - `started_at`, `completed_at`
  - `result_level` (enum) / `result_profile` (nullable)
  - `duration_ms`
  - `crisis_triggered` (bool) + `crisis_trigger_type` (category, nullable)

> Сырые ответы НЕ сохраняем. Для квизов scoring делается “на лету” и сохраняется только итоговый уровень.

### 6.2 P0/P1/P2 классификация данных
- **P0:** result_level/profile, ids, длительность.
- **P1:** user_id (внутренний), anonymous_id (технический).
- **P2:** отсутствует.

### 6.3 Миграции
Если `interactive_runs` уже создана в `FEAT-PLT-02` — миграций нет.

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
| Endpoint | Method | Auth | Request | Response | Ошибки |
|---|---:|---|---|---|---|
| `/api/public/interactive/runs` | POST | public | `{interactive_slug, topic?, entry_point}` | `{run_id}` | 400 |
| `/api/public/interactive/runs/{run_id}/complete` | POST | public | `{result_level, result_profile?, duration_ms, crisis_triggered?, crisis_trigger_type?}` | 204 | 400/404 |

### 7.2 Admin API
Не в этой фиче (см. `FEAT-ADM-03`).

### 7.3 Интеграции (внешние)
- Telegram deep links (`FEAT-TG-01`) используется на уровне CTA.

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)

### 8.1 События (таблица)
Минимум для платформы:
| Event name | Source | Когда срабатывает | Props (P0-only) | Запреты |
|---|---|---|---|---|
| `start_quiz` | web | старт квиза | `quiz_slug`, `topic` | — |
| `complete_quiz` | web | завершение | `quiz_slug`, `result_level`, `duration_ms` | без ответов |
| `navigator_start` | web | старт NAV | `navigator_slug` | — |
| `navigator_complete` | web | завершение NAV | `navigator_slug`, `result_profile`, `duration_ms` | без текста |
| `resource_thermometer_start` | web | старт TRM | `topic?` | — |
| `resource_thermometer_complete` | web | завершение TRM | `resource_level`, `duration_ms` | — |
| `crisis_banner_shown` | web | показ экстренной помощи | `trigger_type`, `surface` | без деталей |

### 8.2 Воронка / метрики успеха
- completion rate по каждому интерактиву,
- CTA rate `complete_* → cta_tg_click/booking_start`.

---

## 9) Security / Privacy / Compliance

### 9.1 Privacy by design (обязательные пункты)
- [ ] Никаких сырых ответов/текстов в БД/аналитике.
- [ ] Запрет на отправку текстов в события/логи.

### 9.2 RBAC и аудит
Не применимо (публичный сценарий).

### 9.3 Кризисный режим (если применимо)
Единый компонент кризис‑баннера + ссылка на `/emergency/`.

---

## 10) Надёжность, производительность, деградации

### 10.2 Retry / idempotency
`complete` должен быть идемпотентен (повторный submit не должен создавать дубли).

### 10.3 Деградации (fallback)
Если backend недоступен: интерактив всё равно должен работать (client-only), но без сохранения run; события — best effort.

---

## 11) Rollout plan
- `interactive_platform_enabled`: internal → stage → prod.

---

## 12) Test plan

### 12.1 Unit tests
- валидатор payload (запрет PII/текста),
- idempotency complete.

### 12.2 Integration tests
- start run → complete run → запись в БД с агрегатами.

### 12.3 E2E (критические happy paths)
- `/start/quizzes/` → открыть квиз → завершить → увидеть результат.
- кризисный триггер → показать `/emergency/` CTA.

### 12.4 Проверка privacy
- [ ] контракт API не принимает свободный текст
- [ ] события не содержат ответы/текст

### 12.5 A11y smoke
- [ ] клавиатура для выбора вариантов/кнопок

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Избранное: localStorage vs аккаунт vs гибрид (в IA/архитектуре отмечено). Рекомендация релиза 1: localStorage.

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** сохраняем только агрегаты; интерактивы доступны без логина; кризисный режим перекрывает CTA.

