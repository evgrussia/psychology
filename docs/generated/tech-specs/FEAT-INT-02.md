# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-INT-02`  
**Epic:** `EPIC-03`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~220k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Реализуем квизы/мини‑диагностики QZ‑01 и QZ‑02 (логика вопросов, скоринг, пороги, результаты) так, чтобы **тексты и пороги редактировались в админке** без кода. В БД/аналитике сохраняем только итоговые агрегаты.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** QZ‑01/02 — основной “быстрый вход” (самые частые запросы).
- **Ожидаемый эффект:** рост completion rate и переходов в TG/booking.
- **Если не сделать:** интерактивы потеряют продуктовую ценность и гибкость (правки текста без релиза).

### 1.3 Ссылки на первоисточники
- Interactive matrix: `docs/Interactive-Modules-Matrix.md` (QZ‑01/02 детали)
- PRD: `docs/PRD.md` (FR-INT-2..5)
- Admin spec: `docs/Admin-Panel-Specification.md` (4.5.2 редактор квиза)
- Tracking: `docs/Tracking-Plan.md` (`start_quiz`, `complete_quiz`)
- Technical decisions: `docs/Technical-Decisions.md` (валидация формулировок психологом)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** QZ‑01 (анxiety, 7 вопросов, шкала 0..3, пороги 0–4/5–9/10+).
- **G2:** QZ‑02 (burnout, 10 вопросов, шкала 0..4, пороги согласно матрице).
- **G3:** Результаты 3 уровней: `low|moderate|high` + “сейчас/на неделю/когда обратиться”.
- **G4:** Кризисный режим:
  - триггер по порогу/вопросу → `crisis_banner_shown`,
  - CTA “экстренная помощь” видим.
- **G5:** Админка редактирует:
  - тексты вопросов,
  - варианты/подписи шкал,
  - пороги,
  - тексты результатов и CTA.

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** Хранение сырых ответов.
- **NG2:** Детальная аналитика “по вопросу” (P1 фича `FEAT-AN-11`).

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Пользователь проходит QZ‑01, получает уровень и план.
- **US-2:** Owner меняет порог “high” в админке, изменения видны пользователю без релиза.

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 Логика скоринга соответствует матрице, итог — `result_level`.
- [ ] AC-2 В события/БД не попадают ответы.
- [ ] AC-3 Админка имеет превью квиза (как пользователь).

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** Квиз в статусе draft → не доступен публично (404/redirect на каталог).
- **NS-2:** Некорректные пороги (overlap/gap) → валидация на сохранении в админке.

---

## 4) UX / UI (что увидит пользователь)
- **Маршруты:** `/start/quizzes/`, `/interactive/quizzes/{quiz-slug}/` (или один из паттернов IA).
- **Состояния:** progress, back, resume (опционально), result, кризисный баннер.
- **Копирайт:** бережно, без клиники.

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation:** QuizRunner UI (questionnaire).
- **Application:** `GetQuizDefinitionUseCase`, `ScoreQuizUseCase` (pure), `RecordQuizCompletionUseCase`.
- **Domain:** `QuizDefinition` (VO/Entity), `QuizResult` (VO).
- **Infrastructure:** хранение definition/versions (Postgres JSONB), публикация/версии.

### 5.2 Основные use cases (сигнатуры)
- `GetQuizDefinitionUseCase.execute({ quizSlug }): { definition }`
- `ScoreQuizUseCase.execute({ definition, answers }): { result_level }` *(answers in-memory only)*

---

## 6) Модель данных (БД) и миграции

### 6.1 Новые/изменённые сущности
Рекомендуемый подход (в духе Admin spec):
- `interactive_definitions`:
  - `type=quiz`, `slug`, `topic`, `status`
  - `definition_json` (вопросы/шкалы/пороги/результаты)
  - `published_version_id` (если версионируем)
- `interactive_definition_versions` (опционально) для истории изменений

`interactive_runs` (из `FEAT-INT-01`) хранит только:
- `quiz_slug`, `result_level`, `duration_ms`, `crisis_triggered`.

### 6.2 P0/P1/P2 классификация данных
- **P0:** definition JSON (контент), result_level.
- **P2:** ответы — запрещено хранить.

### 6.3 Миграции
Если `interactive_definitions` нет в базовой схеме — добавить.

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
| Endpoint | Method | Auth | Response |
|---|---:|---|---|
| `/api/public/quizzes` | GET | public | `{quizzes[]}` |
| `/api/public/quizzes/{slug}` | GET | public | `{definition}` (published only) |

> Ответы пользователя не отправляем на backend “поштучно”. Вариант: score на клиенте, backend получает только итог агрегатов через `complete` run (см. `FEAT-INT-01`).

### 7.2 Admin API
Редактирование definitions — в `FEAT-ADM-03`, но минимально требуется:
| Endpoint | Method | Role | Назначение |
|---|---:|---|---|
| `/api/admin/interactive/quizzes/{id}` | PUT | owner/editor | обновить тексты/пороги |
| `/api/admin/interactive/quizzes/{id}/publish` | POST | owner/editor | публикация |

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)
События строго по плану:
- `start_quiz` (quiz_slug, topic)
- `complete_quiz` (quiz_slug, result_level, duration_ms)
- `crisis_banner_shown` (если сработало)

---

## 9) Security / Privacy / Compliance

### 9.1 Privacy by design (обязательные пункты)
- [ ] Контракт не принимает/не логирует ответы.
- [ ] Любые debug логи “ответов” запрещены.

---

## 10) Надёжность, производительность, деградации
- Квиз работает без backend (definition можно кэшировать/SSG).

---

## 11) Rollout plan
- `quizzes_enabled` (stage → prod)
- поэтапно: сначала QZ‑01, затем QZ‑02 (если нужно).

---

## 12) Test plan

### 12.1 Unit tests
- scoring функция для QZ‑01/02,
- валидация порогов.

### 12.2 Integration tests
- definition published → доступен публично.

### 12.3 E2E (критические happy paths)
- пройти QZ‑01 → увидеть `result_level` и CTA.

### 12.4 Проверка privacy
- [ ] убедиться, что network payload не содержит answers

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Где делать скоринг: клиент или сервер? Рекомендация релиза 1: **клиент**, чтобы не передавать ответы.
- [ ] Валидация формулировок психологом: до запуска (обязательный гейт по `docs/Technical-Decisions.md`).

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** ответы не сохраняем; скоринг локально; в БД только агрегаты + версии definitions.

