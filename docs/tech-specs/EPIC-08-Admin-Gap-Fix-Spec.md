# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** draft  

**Feature ID:** `FEAT-ADM-GAP-01`  
**Epic:** `EPIC-08`  
**Приоритет:** P0  
**Трекер:** —  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Закрываем пробелы в админке:  
1) разрешаем доступ **assistant** к `/admin` с ограниченным набором виджетов и серверной фильтрацией данных,  
2) добавляем **SLA‑метрики** модерации в UI на основе существующего `/api/admin/moderation/metrics`.

### 1.2 Почему сейчас (контекст / риск)
- В техспеке `FEAT-ADM-01` указано, что assistant имеет ограниченный доступ к дашборду, но UI сейчас блокирует страницу для assistant.  
- В техспеке `FEAT-ADM-05` требуется SLA‑метрика модерации, но UI выводит только очередь без агрегатов.

### 1.3 Ссылки на первоисточники
- `docs/generated/tech-specs/FEAT-ADM-01.md`  
- `docs/generated/tech-specs/FEAT-ADM-05.md`  
- `docs/Admin-Panel-Specification.md` (разделы 3.1, 4.10)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Assistant может открыть `/admin`, но видит только ограниченный набор виджетов без финансовых данных.  
- **G2:** SLA‑метрики модерации отображаются на странице `/admin/moderation`.  
- **G3:** Сохранить RBAC и отсутствие PII в ответах.

### 2.2 Non-goals (что осознанно НЕ делаем)
- Полный редизайн дашборда админки.  
- Переписывание расчётов метрик (используем существующие use‑cases).

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope
- **US‑1:** assistant открывает `/admin` и видит сводку по модерации, встречам и интерактивам.  
- **US‑2:** owner видит полный дашборд (включая выручку и воронки).  
- **US‑3:** на `/admin/moderation` отображаются агрегаты SLA (pending age, avg decision/answer).

### 3.2 Out-of-scope
- Изменения в схеме БД.  
- Новые источники данных для метрик.

### 3.3 Acceptance criteria (AC)
- [ ] **AC‑1:** `/admin` доступен для `owner` и `assistant`; `editor` по‑прежнему получает 403.  
- [ ] **AC‑2:** Assistant не видит блоки выручки и конверсий; server‑response очищен от финансовых данных для роли assistant.  
- [ ] **AC‑3:** `/admin/moderation` отображает SLA‑метрики из `/api/admin/moderation/metrics` (pending, flagged, avg decision/answer, alerts).  
- [ ] **AC‑4:** UI остаётся без PII/свободного текста.

---

## 4) UX / UI

### 4.1 Дашборд `/admin`
- **Owner:** текущий полный набор виджетов без изменений.  
- **Assistant:** видит только:
  - модерация (queue + alerts),
  - встречи (upcoming + no‑show rate),
  - интерактивы (top starts),
  - быстрые переходы.
- Блоки **выручки** и **воронки** скрыты.

### 4.2 Модерация `/admin/moderation`
- Вверху страницы добавить карточки:
  - pendingCount / flaggedCount / overdueCount / crisisOverdueCount,
  - среднее время решения (averageDecisionHours) и ответа (averageAnswerHours),
  - предупреждения из `alerts`.

---

## 5) Архитектура и ответственность слоёв

### 5.1 Presentation
- **Admin UI:**  
  - `/admin` — условный рендер виджетов на основе роли пользователя.  
  - `/admin/moderation` — запрос `/metrics` и отображение агрегатов.

### 5.2 Application
- **GetAdminDashboardUseCase** получает роль пользователя и возвращает ограниченный набор полей для assistant.

### 5.3 Infrastructure
- Без изменений.

---

## 6) Модель данных (БД) и миграции
- Изменений нет.

---

## 7) API

### 7.1 Изменения
- `GET /api/admin/dashboard`  
  - Добавить роль пользователя в контекст и фильтрацию ответа для `assistant`.
- `GET /api/admin/moderation/metrics`  
  - Уже существует, используется в UI.

---

## 8) Security / Privacy
- Не отдавать финансовые данные в ответе для `assistant`.
- Не добавлять PII/свободный текст в админские агрегаты.

---

## 9) Test plan

- **Backend:**
  - e2e: `assistant` → `/api/admin/dashboard` → отсутствуют `revenue` и `bookingFunnel` (или возвращаются `null`).  
  - e2e: `owner` → `/api/admin/dashboard` → все поля доступны.
- **Frontend (ручная проверка):**
  - `assistant` открывает `/admin` и видит только разрешённые блоки.  
  - `/admin/moderation` показывает SLA‑карточки и алерты.

---

## 10) Rollout / риски
- Низкий риск: изменения в UI и фильтрации ответа.  
- Нужна проверка доступа для роли `assistant` в админском auth‑контексте.

---

## 11) Open questions
- Какие именно блоки дашборда должны быть видны assistant (текущий список можно уточнить у владельца продукта).
