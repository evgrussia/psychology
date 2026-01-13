# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-PLT-03`  
**Epic:** `EPIC-00`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~140k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Реализуем идентификацию и доступ: сессии, RBAC (owner/assistant/editor/client) и защиту роутов для admin/ЛК, чтобы обеспечить безопасность, доступ к P2 данным только по необходимости и выполнить требования админки.

### 1.2 Почему сейчас (контекст / метрики / риск)
- **Сигнал/боль:** без RBAC невозможно строить админку и хранить P2 данные (дневники/анкеты/UGC).
- **Ожидаемый эффект:** безопасная операционка и комплаенс (152‑ФЗ контекст).
- **Если не сделать:** утечки данных, отсутствие разделения ролей, блокировка `EPIC-08/11/07`.

### 1.3 Ссылки на первоисточники
- PRD: `docs/PRD.md` (FR-ADM-1, NFR-SEC, 18+)
- Admin spec: `docs/Admin-Panel-Specification.md` (матрица доступа)
- Domain model: `docs/Domain-Model-Specification.md` (Identity context)
- Data model: `docs/Модель-данных.md` (users/roles/consents)
- Security: `docs/NFR-SLO-SLI-Performance-Security-Scalability.md`

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** RBAC роли: `owner`, `assistant`, `editor`, `client` (как в PRD/Admin spec).
- **G2:** Авторизация для admin и client cabinet; защита admin API и admin UI.
- **G3:** Сессии с возможностью ревокации (logout, истечение, блокировка пользователя).
- **G4:** Логирование security-событий (admin_login, блокировки) без PII в аналитике (см. Tracking Plan).

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** Social login (Google/Telegram OAuth) в релиз 1 — опционально позже.
- **NG2:** Полный IAM (SCIM/SSO) — не требуется.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Owner заходит в админку, видит все разделы.
- **US-2:** Assistant видит расписание/лиды/модерацию, но не меняет цены.
- **US-3:** Editor управляет контентом и текстами интерактивов, не видит лиды/модерацию.
- **US-4:** Клиент входит в ЛК и видит только свои встречи/дневники/экспорт.

### 3.2 Out-of-scope
- Self‑serve registration “для всех” без необходимости (можно ограничиться login-on-demand через booking/магик‑линк).

### 3.3 Acceptance criteria (AC)
- [ ] AC-1 Все admin endpoints требуют роль `owner|assistant|editor` по матрице доступа.
- [ ] AC-2 Все client endpoints требуют роль `client` и ownership-check.
- [ ] AC-3 Сессия истекает, logout инвалидирует сессию.
- [ ] AC-4 Блокировка пользователя предотвращает доступ.

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** Нет прав (403) — корректный ответ без утечки существования ресурса.
- **NS-2:** Истёкшая/поддельная сессия — 401 и безопасный редирект на логин.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
- **Маршруты/страницы:** `/admin/login`, `/admin/*`, `/lk/*` (точные URL — из IA).
- **Состояния UI:** loading / error / forbidden (403).
- **Копирайт/тон:** нейтрально, без “страшилок”.

### 4.2 A11y (минимум)
- [ ] Фокус в формах логина.
- [ ] Ошибки формы читаемы скринридером.

---

## 5) Архитектура и ответственность слоёв (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation:** middleware/guards для API; страницы логина.
- **Application:** use cases:
  - `AdminLoginUseCase`
  - `ClientLoginUseCase` (если есть)
  - `LogoutUseCase`
  - `CreateAdminUserInviteUseCase` (если invites в релизе 1)
- **Domain:** `User`, `Role`, `Consent` (Identity context).
- **Infrastructure:** хранилище сессий (DB/Redis), password hashing, email sender (для magic link/invite), audit log hooks (см. `FEAT-PLT-05`).

### 5.2 Основные use cases (сигнатуры)
- `AdminLoginUseCase.execute({ email, password }): { session }`
- `LogoutUseCase.execute({ sessionId }): void`
- `GetCurrentUserUseCase.execute({ session }): { user, roles }`

### 5.3 Доменные события (если нужны)
- `AdminLoggedIn` (для audit/analytics без PII).
- `UserBlocked`, `RoleAssigned` (если требуется).

---

## 6) Модель данных (БД) и миграции

### 6.1 Новые/изменённые сущности
По `docs/Модель-данных.md` (или добавляем, если не описано явно):
- `users` (P1: email/phone/tg)
- `roles`, `user_roles`
- `consents`
- `sessions` (server-side sessions) **или** `refresh_tokens` (если JWT+refresh)
- `admin_invites` (опционально, если приглашаем assistant/editor)

### 6.2 P0/P1/P2 классификация данных
- **P0:** role codes, session id (random), timestamps.
- **P1:** email/phone/tg_id.
- **P2:** не хранится в этом домене.

### 6.3 Миграции
- добавить таблицы `sessions`/`admin_invites` (если их нет в модели данных).

---

## 7) API / Контракты (если применимо)

### 7.1 Public API (web)
| Endpoint | Method | Auth | Request | Response | Ошибки |
|---|---:|---|---|---|---|
| `/api/auth/admin/login` | POST | public | `{email,password}` | `200 {user}` + set-cookie | 400/401 |
| `/api/auth/logout` | POST | auth | — | 204 | 401 |
| `/api/auth/me` | GET | auth | — | `200 {user,roles}` | 401 |

> Если выберем passwordless для клиента: `/api/auth/magic-link/request`, `/api/auth/magic-link/confirm`.

### 7.2 Admin API
RBAC guards по матрице доступа из `docs/Admin-Panel-Specification.md`.

### 7.3 Интеграции (внешние)
- **Email:** отправка invite/magic-link (retry policy, rate limit).

---

## 8) Tracking / Analytics (по `docs/Tracking-Plan.md`)

### 8.1 События (таблица)
| Event name | Source | Когда срабатывает | Props (P0-only) | Запреты |
|---|---|---|---|---|
| `admin_login` | admin/backend | успешный вход | `role` | без email |

### 8.2 Воронка / метрики успеха
Не KPI, но мониторим:
- долю неуспешных логинов,
- количество блокировок/подозрительных попыток (только в логах).

---

## 9) Security / Privacy / Compliance

### 9.1 Privacy by design (обязательные пункты)
- [ ] В analytics нет email/phone/tg.
- [ ] Логи аутентификации не содержат пароль/токены.

### 9.2 RBAC и аудит
- **Кто видит P2:** `owner` (полный), `assistant` (только нужное), `editor` (без P2).
- **Какие действия пишем в audit log:** входы, смена ролей, блокировки, экспорт данных, изменения цен (см. `FEAT-PLT-05`).

### 9.3 Кризисный режим (если применимо)
Не применимо.

---

## 10) Надёжность, производительность, деградации

### 10.1 SLA/SLO (если критично)
Лимиты:
- rate limit на `/login` (IP + user).

### 10.2 Retry / idempotency
Не применимо.

### 10.3 Деградации (fallback)
Если email-провайдер недоступен (magic link/invite) — показываем понятную ошибку, логируем инцидент.

---

## 11) Rollout plan

### 11.1 Фича‑флаг / поэтапное включение
- `auth_admin_enabled` (по умолчанию включён на stage → prod).

### 11.2 Миграция данных и обратимость
Не требуется.

### 11.3 Коммуникации (если нужно)
Инструкция owner: как добавить assistant/editor (если invites).

---

## 12) Test plan

### 12.1 Unit tests
- проверка guards/permissions matrix.

### 12.2 Integration tests
- login → me → logout,
- 403 по матрице ролей,
- блокировка пользователя.

### 12.3 E2E (критические happy paths)
- owner: вход → открыть `/admin/` (доступ есть).

### 12.4 Проверка privacy
- [ ] события/логи не содержат email/phone/tg_id

### 12.5 A11y smoke
- [ ] фокус/лейблы в `/admin/login`

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Клиентская авторизация: passwordless по email (рекомендуется) или только “по факту записи”.
- [ ] Хранилище сессий: DB vs Redis (для релиза 1 допустима DB; Redis — если появится нагрузка).

### 13.2 Decision log (что и почему решили)
- **2026-01-07:** RBAC строго по матрице админки; server-side sessions для ревокации и безопасности.

