# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** draft  

**Feature ID:** `FEAT-TG-02-GAP`  
**Epic:** `EPIC-06`  
**Приоритет:** P0  
**Трекер:** —  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Закрываем пробелы Telegram‑функционала: добавляем отсутствующие TG‑флоу (prep/ritual/boundaries/favorites/question), корректные CTA на web‑стороне, и минимальную серию сообщений для `plan_7d`/`challenge_7d` + напоминания для `save_resource`/`ritual`/`boundaries` (best‑effort, без PII).

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** Deep‑link схема в `docs/Telegram-Deep-Links-Schema.md` предусматривает TG‑флоу, которые сейчас не обрабатываются ботом или не вызываются с web‑стороны.
- **Риск:** CTA “получить в Telegram” ведёт в бот, но пользователь получает нецелевой сценарий или только базовое сообщение без обещанной серии/напоминания.
- **Эффект:** корректная склейка web↔TG, снижение “разрыва” пользовательского пути, рост конверсии в TG и доверия к TG‑сценариям.

### 1.3 Ссылки на первоисточники
- Deep links: `docs/Telegram-Deep-Links-Schema.md`
- Tracking: `docs/Tracking-Plan.md`
- PRD FR‑TG: `docs/PRD.md`
- FEAT‑TG‑01/02/03: `docs/generated/tech-specs/FEAT-TG-01.md`, `FEAT-TG-02.md`, `FEAT-TG-03.md`

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Бот обрабатывает все объявленные TG‑флоу из схемы deep links: `plan_7d`, `challenge_7d`, `save_resource`, `concierge`, `question`, `prep`, `ritual`, `boundaries`, `favorites`.
- **G2:** На web‑стороне корректные TG‑CTA создают deep links с правильным `tg_flow` (и `entity_id`/`source_page` где нужно).
- **G3:** Для `plan_7d`/`challenge_7d` есть минимальная серия сообщений (1‑7 дней) с возможностью остановки.
- **G4:** Для `save_resource`/`ritual`/`boundaries` есть напоминание через 24 часа (best effort), отключаемое `/stop`.
- **G5:** Сохранены правила privacy‑by‑design: никакого свободного текста пользователя в БД/аналитику.

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** Полноценный Telegram‑CRM или сложные сегментации.
- **NG2:** AI‑генерация сообщений в TG.
- **NG3:** Полный UI управления шаблонами в админке (достаточно дефолтных шаблонов/конфига).

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US‑1:** Пользователь завершает prep/ritual/boundaries → CTA “получить в Telegram” → бот отправляет релевантную карточку и ссылку на источник.
- **US‑2:** Пользователь оставляет анонимный вопрос → CTA “получить ответ в Telegram” → бот подтверждает получение и фиксирует связь `question_id ↔ telegram_user_id`.
- **US‑3:** Пользователь получает `plan_7d`/`challenge_7d` → бот отправляет Day‑1 и планирует следующие сообщения.
- **US‑4:** Пользователь нажимает `/stop` → серия и напоминания отменяются.
- **US‑5:** Пользователь открывает “Избранное/аптечку” → бот отправляет ссылку на `/start/favorites` (web‑first).

### 3.2 Out-of-scope
- Отложенные ответы на вопросы в админке (UI “ответить в TG”) — допускается как следующая итерация.
- Полноценный контент‑конструктор TG‑сообщений в админке.

### 3.3 Acceptance criteria (AC)
- [ ] AC‑1 Для `prep`, `ritual`, `boundaries`, `favorites`, `question` бот отправляет целевое сообщение вместо дефолтного ответа.
- [ ] AC‑2 `createTelegramDeepLink` вызывается с корректным `tg_flow` на соответствующих экранах.
- [ ] AC‑3 Для `plan_7d` и `challenge_7d` настроен минимальный план сообщений (Day‑1 + плановая отправка Day‑2…Day‑7).
- [ ] AC‑4 Для `save_resource`/`ritual`/`boundaries` отправляется напоминание через 24 часа (best effort).
- [ ] AC‑5 `/stop` отменяет активные серии/напоминания и фиксирует `tg_series_stopped`.
- [ ] AC‑6 В TG‑событиях нет PII/текстов; используются только агрегаты/ID.

### 3.4 Негативные сценарии (обязательные)
- **NS‑1:** Некорректный/устаревший payload → бот отвечает безопасным дефолтным сообщением без падения.
- **NS‑2:** Нет `TELEGRAM_BOT_TOKEN` → модуль не запускает polling/webhook, логирует предупреждение (как сейчас).
- **NS‑3:** Планировщик недоступен → Day‑1 отправлен, последующие сообщения не блокируют пользователя.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
- **Web / prep:** CTA “Сохранить в Telegram” отправляет `tg_flow=prep`.
- **Web / boundaries:** CTA “Больше техник в Telegram” отправляет `tg_flow=boundaries`.
- **Web / rituals:** CTA “Сохранить ритуал” отправляет `tg_flow=ritual`.
- **Web / favorites:** CTA “Открыть в Telegram” отправляет `tg_flow=favorites` (если есть).
- **Web / anonymous question:** после успешной отправки появляется CTA “Получить ответ в Telegram”.

### 4.2 A11y
- CTA‑кнопки доступны с клавиатуры и имеют понятные тексты.

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation (web):** корректировка TG‑CTA для prep/boundaries/ritual/favorites, добавление CTA в `AnonymousQuestionClient`.
- **Presentation (api):** без новых контроллеров; используется существующий webhook `/api/webhooks/telegram`.
- **Application:** расширение `HandleTelegramUpdateUseCase` + добавление use‑case для планировщика сообщений.
- **Domain:** расширение поведения `TelegramSession` (серии/напоминания), новые VO для типов серии.
- **Infrastructure:** планировщик (setInterval) для отправки отложенных сообщений; репозитории получают методы выборки “due” сессий.

### 5.2 Основные use cases (сигнатуры)
- `HandleTelegramUpdateUseCase.execute(update)`
  - обработка новых `tg_flow` и постановка серии/напоминаний.
- `ProcessTelegramScheduledMessagesUseCase.execute(now)`
  - выбирает активные сессии с `next_send_at <= now`, отправляет сообщение, обновляет состояние.

### 5.3 Доменные события
- Не добавляем (события фиксируются через `TrackingService`).

---

## 6) Модель данных (БД) и миграции

### 6.1 Изменения (предложение)
Добавить поля в `telegram_sessions`:
- `series_type` (string, nullable) — `plan_7d | challenge_7d | save_resource_reminder | ritual_reminder | boundaries_reminder | prep_checklist | favorites_link | question_ack`.
- `series_step` (int, nullable) — номер шага серии.
- `next_send_at` (datetime, nullable) — когда отправить следующее сообщение.
- `last_message_key` (string, nullable) — идентификатор шаблона (для трекинга).

### 6.2 Миграции
- Миграция Prisma для новых полей `telegram_sessions`.

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
- Используется существующий `/api/public/deep-links` без изменений.

### 7.2 Telegram webhook
- `/api/webhooks/telegram` без изменений; расширяется обработка payload.

---

## 8) Реализация TG‑флоу (минимальные правила)

### 8.1 `prep`
- Сообщение с чек‑листом (1–3 пункта) + CTA “Записаться”.
- Ссылка на `/start/consultation-prep` с `dl` и UTM.

### 8.2 `ritual`
- Короткая карточка ритуала (название, длительность, зачем) + кнопка “Открыть на сайте”.
- Напоминание через 24 часа (best effort).

### 8.3 `boundaries`
- Сообщение “Сохранил варианты фраз” + кнопка “Открыть скрипты”.
- Напоминание через 24 часа (best effort).

### 8.4 `favorites`
- Web‑first: ссылка на `/start/favorites` с UTM и `dl`.

### 8.5 `question`
- Сообщение‑подтверждение с дисклеймерами.
- Связка `question_id ↔ telegram_user_id` (через `entity_id` в deep link).

### 8.6 `plan_7d` / `challenge_7d`
- Отправка Day‑1 сразу.
- Планирование Day‑2…Day‑7 (1 раз в сутки, фиксированное окно).
- Кнопка “Стоп” в каждом сообщении.

---

## 9) Трекинг

### 9.1 Обязательные события
- Web: `cta_tg_click` (tg_target, tg_flow, deep_link_id, cta_id, topic?)
- TG: `tg_subscribe_confirmed`, `tg_onboarding_completed`, `tg_interaction`, `tg_series_stopped`

### 9.2 Дополнительно (если появится в рамках данной итерации)
- `favorites_add` (когда TG подтверждает сохранение) — через `TrackingService` (опционально).

---

## 10) Конфиги/ENV/инфраструктура

Добавить (если нужно):
- `TELEGRAM_SERIES_SEND_HOUR` (timezone UTC) — окно отправки Day‑сообщений.
- `TELEGRAM_REMINDER_DELAY_HOURS` (default 24).

---

## 11) Rollout plan

1) Добавить новые поля в `telegram_sessions`.
2) Включить обработку новых `tg_flow`.
3) Включить планировщик сообщений (setInterval).
4) Обновить web‑CTA (prep/boundaries/ritual/favorites/question).

---

## 12) Test plan

### 12.1 Unit tests
- decode payload → корректная маршрутизация `tg_flow`.
- серия `plan_7d`: шаги и `next_send_at`.
- `/stop` отменяет `series_type` и `next_send_at`.

### 12.2 Integration tests
- Web → `/public/deep-links` → TG `/start` → корректный ответ по flow.
- Обработчик планировщика отправляет due‑сообщения.

### 12.3 Ручные E2E
- Prep/Boundaries/Ritual: CTA → TG → получить сообщение + ссылка.
- Question: submit → CTA “ответ в TG” → TG подтверждение.
- Plan 7d: Day‑1 + проверка отправки Day‑2 (ускоренное окно).

---

## 13) Open questions

- Нужно ли фиксировать временную зону пользователя для расписания сообщений?
- Хранить ли `question_id ↔ telegram_user_id` в отдельной таблице или в `telegram_sessions`?
