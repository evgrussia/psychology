# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-PLT-05`  
**Epic:** `EPIC-00`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~80k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Вводим минимальный аудит‑лог критичных действий (security/compliance): запись событий в БД, фильтры/поиск в админке и доступ по ролям. Аудит-лог — источник истины для расследований и комплаенса.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** PRD/админка требуют аудит критичных действий (экспорт, цены, удаления).
- **Ожидаемый эффект:** контроль безопасности, снижение рисков 152‑ФЗ контекста.
- **Если не сделать:** невозможно доказать кто/когда сделал действие, высокий риск инцидентов.

### 1.3 Ссылки на первоисточники
- Admin spec: `docs/Admin-Panel-Specification.md` (раздел 4.13)
- Tracking plan: `docs/Tracking-Plan.md` (admin events)
- PRD: `docs/PRD.md` (FR-ADM-5, NFR-SEC)
- Data model: `docs/Модель-данных.md` (AuditLogEntry)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Записывать audit entries для “критичных” действий (минимум из Admin spec).
- **G2:** Доступ:
  - `owner` видит всё,
  - `assistant` видит свои действия (как минимум),
  - `editor` не видит audit log.
- **G3:** Данные audit log не содержат P2 и по возможности не содержат P1 (email можно хранить как reference через user_id).
- **G4:** Технические поля: IP, user-agent, timestamp, entity reference, diff (old/new) для цен/настроек.

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** SIEM интеграции и алерты (это `FEAT-AN-03`).
- **NG2:** Подпись логов/immutability (append-only storage) — можно как P1/P2 hardening.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Owner меняет цену услуги → появляется audit запись с old/new.
- **US-2:** Assistant экспортирует лиды → появляется audit запись.
- **US-3:** Owner удаляет контент → audit запись.

### 3.2 Out-of-scope
- Полный аудит всех CRUD (слишком шумно). Только whitelist “критичных”.

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 Все действия из списка “минимум” логируются.
- [ ] AC-2 В админке есть просмотр audit log с фильтрами (по пользователю/действию/сущности/дате).
- [ ] AC-3 Права доступа соблюдены (assistant видит только свои записи).

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** Пользователь без прав открывает audit log → 403.
- **NS-2:** В audit log не попадает P2 payload (анкеты/дневники/UGC тексты) — только ссылки/категории.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
- **Маршруты/страницы:** `/admin/audit-log/` (см. Admin spec).
- **Состояния UI:** loading / empty / error.

### 4.2 A11y (минимум)
- [ ] Таблица доступна с клавиатуры.
- [ ] Фильтры имеют label.

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation:** admin endpoints `GET /admin/audit-log`, middleware добавляет actor/ip/ua.
- **Application:** `WriteAuditLogUseCase` / `AuditLogService`.
- **Domain:** `AuditLogEntry` (может быть в Supporting domain “Admin & Audit”).
- **Infrastructure:** `AuditLogRepository` (Postgres), helper для diff (sanitize).

### 5.2 Основные use cases (сигнатуры)
- `AuditLogWriter.write({ actorUserId, action, entityType, entityId, meta }): void`
- `ListAuditLogUseCase.execute({ filters, pagination }): { items, pageInfo }`

### 5.3 Доменные события (если нужны)
Скорее используем “application service”, но допускается:
- `AdminActionOccurred` → consumer: audit writer.

---

## 6) Модель данных (БД) и миграции

### 6.1 Новые/изменённые сущности
По `docs/Admin-Panel-Specification.md` (4.13.2):
- `audit_log_entries`:
  - `id`, `occurred_at`, `actor_user_id`, `actor_role`
  - `action` (event_name)
  - `entity_type`, `entity_id`
  - `old_value_json` (nullable, sanitized)
  - `new_value_json` (nullable, sanitized)
  - `ip`, `user_agent`

### 6.2 P0/P1/P2 классификация данных
- **P0:** action/entity/timestamps/role.
- **P1:** IP, user-agent (квази‑PII) — хранить, но не отправлять в аналитику; доступ ограничить.
- **P2:** запрещено.

### 6.3 Миграции
Если таблица не создана в `FEAT-PLT-02` — добавить миграцию.

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
Не применимо.

### 7.2 Admin API
| Endpoint | Method | Role | Назначение |
|---|---:|---|---|
| `/api/admin/audit-log` | GET | owner/assistant | список (assistant=только свои) |

### 7.3 Интеграции (внешние)
Не применимо.

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)

### 8.1 События (таблица)
Часть “аудит” может быть только в БД, но допускаем P0-события:
| Event name | Source | Когда срабатывает | Props (P0-only) | Запреты |
|---|---|---|---|---|
| `admin_price_changed` | admin/backend | изменение цены | `service_id/slug`, `changed_fields` | без сумм, если считаем это чувствительным (решаем) |
| `admin_data_exported` | admin/backend | экспорт | `export_type`, `role` | без содержимого |

### 8.2 Воронка / метрики успеха
Метрики безопасности:
- количество экспортов,
- количество критичных изменений.

---

## 9) Security / Privacy / Compliance

### 9.1 Privacy by design (обязательные пункты)
- [ ] Санитизация old/new JSON (не сохранять P2, не сохранять свободный текст).
- [ ] Доступы ограничены.

### 9.2 RBAC и аудит
Это сама фича.

### 9.3 Кризисный режим (если применимо)
Не применимо.

---

## 10) Надёжность, производительность, деградации

### 10.1 SLA/SLO (если критично)
Список audit log грузится <2s (Admin spec).

### 10.2 Retry / idempotency
Запись audit log должна быть “best effort”:
- при ошибке записи не должна ломать бизнес-операцию для некритичных действий,
- для критичных действий (экспорт) — желателен “вместе в транзакции”.

### 10.3 Деградации (fallback)
Если audit log временно недоступен:
- блокируем экспорт данных (лучше отказать, чем “без следа”).

---

## 11) Rollout plan

### 11.1 Фича‑флаг / поэтапное включение
- `audit_log_enabled` (stage → prod).

### 11.2 Миграция данных и обратимость
Не применимо.

### 11.3 Коммуникации (если нужно)
Owner: где искать историю изменений.

---

## 12) Test plan

### 12.1 Unit tests
- sanitize/diff helper.

### 12.2 Integration tests
- изменить цену → запись audit log,
- assistant: видит только свои записи.

### 12.3 E2E (критические happy paths)
- открыть `/admin/audit-log` и отфильтровать по действию.

### 12.4 Проверка privacy
- [ ] audit entries не содержат P2 и не содержат email/phone.

### 12.5 A11y smoke
- [ ] таблица + фильтры доступны с клавиатуры.

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Хранить ли суммы цен в audit log (внутренне это P0, но может считаться чувствительным для утечки) — рекомендуем хранить, но ограничить доступ только owner.

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** логируем только whitelist критичных действий; храним ссылки/дифф без P2; доступ ограничен ролями.

