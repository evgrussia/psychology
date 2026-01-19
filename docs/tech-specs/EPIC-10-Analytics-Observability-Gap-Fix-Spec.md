# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** draft  

**Feature ID:** `FEAT-AN-03-GAP`  
**Epic:** `EPIC-10`  
**Приоритет:** P0  
**Трекер:** —  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Доводим наблюдаемость до требований FEAT-AN-03: добавляем error reporting (Sentry или self-hosted), алертинг по росту 5xx и алерты на сбои email-интеграции. Сохраняем редактирование PII/P2 и `x-request-id`.

### 1.2 Почему сейчас (контекст / риск)
- **Сигнал:** FEAT-AN-03 реализован частично — нет error reporting и алерта на рост 5xx, а email-интеграция не поднимает алерт при сбое.  
- **Риск:** пропуск критичных аварий (массовые 5xx или массовые ошибки отправки писем), отсутствие централизованных стэктрейсов.

### 1.3 Ссылки на первоисточники
- FEAT-AN-03: `docs/generated/tech-specs/FEAT-AN-03.md`
- NFR/SLO: `docs/NFR-SLO-SLI-Performance-Security-Scalability.md`
- Tracking Plan (PII правила): `docs/Tracking-Plan.md`

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Error reporting включается по `SENTRY_DSN` (или self-hosted аналог) и получает exceptions со связкой `x-request-id`.
- **G2:** Алерт при росте 5xx (rate/threshold) с защитой от флуда.
- **G3:** Алерт при сбоях отправки email (SMTP).
- **G4:** PII/тексты редактируются до отправки в error reporting/алерты.

### 2.2 Non-goals
- Полная observability-платформа с метриками Prometheus/Grafana.
- Изменение форматов существующих логов.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope
- Подключение error reporting SDK (Sentry или self-hosted) в API.
- Исключения и unhandled rejections отправляются в error reporting.
- Счётчик 5xx по sliding window с алертом при превышении порога.
- EmailService вызывает AlertService при ошибке отправки.

### 3.2 Out-of-scope
- Клиентский (web/admin) Sentry.
- Расширенные метрики latency/percentiles.

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 В error reporting есть события с `request_id` и редактированными полями.
- [ ] AC-2 При 5xx rate > порога отправляется алерт (не чаще min-интервала).
- [ ] AC-3 Ошибка отправки email вызывает алерт с безопасным payload.
- [ ] AC-4 В проде error reporting включается только при валидном `SENTRY_DSN`.

---

## 4) Архитектура и ответственность слоёв (Clean Architecture)

### 4.1 Компоненты/модули
- **Domain:** `IErrorReporter` (интерфейс), reuse `IAlertService`.
- **Infrastructure:**  
  - `SentryErrorReporter` (или self-hosted аналог),  
  - `ErrorRateMonitor` (in-memory sliding window),  
  - интеграция в `main.ts`/global exception filter/Interceptor.

### 4.2 Use cases
- Новых use cases не требуется; логика — infra/observability.

---

## 5) Дизайн и реализация

### 5.1 Error reporting
- Инжектить `IErrorReporter` в глобальный exception filter.
- В payload включать `request_id`, `path`, `method`, `user_id`/`lead_id` если есть в контексте (без PII).
- Редактировать payload через `redactSensitiveData`.

### 5.2 5xx rate alert
- Middleware/Interceptor считает ответные статусы.
- Sliding window: `ERROR_RATE_WINDOW_MINUTES` (default 5), порог `ERROR_RATE_THRESHOLD` (например 0.1 или абсолютное число).
- Алерт отправляет `AlertService` с ключом `error_rate_5xx`.

### 5.3 Email failure alert
- В `EmailService.sendEmail` перехватывать исключения SMTP и вызывать `AlertService.notify`.
- Ключ алерта: `email_send_failed`.

---

## 6) Модель данных
Не требуется.

---

## 7) Конфиги/ENV
- `SENTRY_DSN` (уже есть в `env.prod.example`)
- `ERROR_RATE_WINDOW_MINUTES` (default 5)
- `ERROR_RATE_THRESHOLD` (default 0.1 или 5% от total)
- `ERROR_RATE_MIN_SAMPLES` (default 50)

---

## 8) Rollout plan
1) Добавить `IErrorReporter` и реализацию.
2) Подключить глобальный filter/Interceptor для отправки ошибок.
3) Включить ErrorRateMonitor и алерты по 5xx.
4) Обновить EmailService (алерт при сбое).
5) Проверить настройки ENV в prod.

---

## 9) Test plan

### 9.1 Unit tests
- redaction сохраняется перед отправкой в error reporting.
- ErrorRateMonitor триггерит алерт при превышении порога.

### 9.2 Integration tests
- Синтетический 5xx → алерт отправлен.
- Ошибка SMTP → алерт отправлен.

### 9.3 Ручные проверки
- Исключение в контроллере → событие в error reporting.

---

## 10) Open questions
- Какой провайдер error reporting выбран в проде (Sentry/self-hosted)?
- Какие пороги 5xx считать критичными для P0?
