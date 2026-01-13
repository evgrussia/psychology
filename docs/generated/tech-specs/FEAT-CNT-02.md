# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-CNT-02`  
**Epic:** `EPIC-02`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~100k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Реализуем каталог тем релиза 1 и SEO‑лендинги тем: хаб `/s-chem-ya-pomogayu/` и страницы `/s-chem-ya-pomogayu/{topic-slug}/` с блоками “признаки/что попробовать сейчас/как я работаю/CTA”.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** PRD требует лендинги по запросам + перелинковку.
- **Ожидаемый эффект:** SEO входы → интерактивы → booking/TG.
- **Если не сделать:** теряем органический трафик и “сценарный вход”.

### 1.3 Ссылки на первоисточники
- PRD: `docs/PRD.md` (FR-IA-1..3)
- IA: `docs/information-architecture.md` (`/s-chem-ya-pomogayu/*`)
- Content guide: `docs/Content-Guide-UX-Copywriting.md`
- Tracking: `docs/Tracking-Plan.md` (`view_problem_landing`)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** 3–5 тем релиза 1: тревога/выгорание/отношения/границы/самооценка.
- **G2:** На лендинге темы есть:
  - “что попробовать сейчас” (ссылка на интерактив/ресурс),
  - доверие/границы,
  - CTA: Telegram/запись.
- **G3:** Внутренняя перелинковка: лендинг ↔ статьи ↔ ресурсы ↔ услуги.

### 2.2 Non-goals (что осознанно НЕ делаем)
- Генерация 100+ тем. Только стартовый набор.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Пользователь открывает каталог тем, выбирает “тревога”.
- **US-2:** На лендинге темы запускает интерактив и/или переходит к записи.

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 `/s-chem-ya-pomogayu/` отображает все активные темы.
- [ ] AC-2 `/s-chem-ya-pomogayu/{topic}/` рендерится из CMS/контента.
- [ ] AC-3 В лендинге есть блок “попробовать сейчас” и перелинковка.

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** topic slug не существует → 404 с подсказкой “С чего начать”.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
- `/s-chem-ya-pomogayu/`
- `/s-chem-ya-pomogayu/{topic-slug}/`

### 4.2 A11y (минимум)
- [ ] карточки тем — семантические ссылки, клавиатура.

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation:** страницы + компоненты “topic landing”.
- **Application:** `GetTopicLandingUseCase` (read model).
- **Domain:** `Topic`, `ContentItem`.
- **Infrastructure:** content repo (лендинги тем как `content_type=landing`).

### 5.2 Основные use cases (сигнатуры)
- `GetTopicLandingUseCase.execute({ topicSlug }): { landing, relatedContent[], relatedInteractives[], relatedServices[] }`

---

## 6) Модель данных (БД) и миграции
Используем `topics` и `content_items` (`landing`) + связки по темам/тегам (см. `FEAT-CNT-01`).

---

## 7) API / Контракты (если применимо)
| Endpoint | Method | Auth | Request | Response | Ошибки |
|---|---:|---|---|---|---|
| `/api/public/topics` | GET | public | — | `200 {topics[]}` | — |
| `/api/public/topic-landings/{topicSlug}` | GET | public | — | `200 {model}` | 404 |

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)

### 8.1 События (таблица)
| Event name | Source | Когда срабатывает | Props (P0-only) | Запреты |
|---|---|---|---|---|
| `view_problem_landing` | web | просмотр лендинга | `topic`, `page_path` | — |

### 8.2 Воронка / метрики успеха
- `view_problem_landing` → `start_quiz`/`navigator_start` → `booking_start`

---

## 9) Security / Privacy / Compliance
Только P0 данные в аналитике.

---

## 10) Надёжность, производительность, деградации
- SSG/ISR для лендингов.

---

## 11) Rollout plan
- `topic_landings_enabled` (stage → prod)

---

## 12) Test plan

### 12.3 E2E (критические happy paths)
- `/s-chem-ya-pomogayu/` → открыть тему → клик “Запись” → `/booking/`

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Сколько контент‑элементов показывать в related блоках (рекомендация: 2–4 статьи + 2–4 ресурса).

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** лендинги тем — контент‑тип `landing` в CMS, чтобы править без разработчика.

