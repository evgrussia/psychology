# Верификация Фазы 1 — Инфраструктура API и авторизация

**Дата:** 2026-01-28  
**Спецификация:** [BACKEND-INTEGRATION-PLAN.md](./BACKEND-INTEGRATION-PLAN.md) § 7 «Фаза 1 — Инфраструктура»

---

## Чек-лист Фазы 1

| № | Требование | Статус | Артефакт |
|---|------------|--------|----------|
| 1 | Добавить `VITE_API_BASE_URL` в `.env` и `.env.example` | ✅ | `frontend/.env`, `frontend/.env.example` |
| 2 | Реализовать `api/client.ts` (request, refresh при 401, типы ошибок) | ✅ | `frontend/src/api/client.ts` |
| 3 | Реализовать `api/endpoints/auth.ts` и типы auth | ✅ | `frontend/src/api/endpoints/auth.ts`, `frontend/src/api/types/auth.ts` |
| 4 | Добавить AuthContext (login, logout, refresh, user) | ✅ | `frontend/src/contexts/AuthContext.tsx` |
| 5 | Обернуть приложение в AuthProvider | ✅ | `frontend/src/main.tsx` |

---

## Детали реализации

### 1. Переменные окружения

- В `.env` и `.env.example`: `VITE_API_BASE_URL=http://localhost:8000/api/v1`.
- В коде используется `import.meta.env.VITE_API_BASE_URL`; при отсутствии — запросы идут по относительным путям (proxy).

### 2. API-клиент (`api/client.ts`)

- **Base URL:** из `VITE_API_BASE_URL`, без завершающего слэша.
- **Опции по умолчанию:** `credentials: 'include'`, `headers: { 'Content-Type': 'application/json' }`.
- **2xx:** парсинг JSON при наличии body; 204 — без тела.
- **401:** вызов `POST /auth/refresh/` с `credentials: 'include'` (refresh из cookie), один повтор исходного запроса; при повторном 401 — `setOnUnauthorized()` и выброс `ApiError('UNAUTHORIZED', …)`.
- **4xx/5xx:** парсинг `{ error: { code, message, details } }`, выброс `ApiError`.
- **Сигнатура:** `request<T>(method, path, body?, options?)`.

### 3. Auth endpoints и типы

- **Типы** (`api/types/auth.ts`): `User`, `LoginRequest`, `RegisterRequest`, `AuthResponse`, `AuthResponseData`.
- **Типы ошибок** (`api/types/errors.ts`): `ApiError`, `ErrorDetail`, `ApiErrorPayload`.
- **Эндпоинты** (`api/endpoints/auth.ts`): `login`, `register`, `logout`, `refresh`.

### 4. AuthContext

- **Состояние:** `user | null`, `isLoading`, `isAuthenticated`.
- **Методы:** `login(credentials)`, `register(payload)`, `logout()`, `refreshUser()`.
- При инициализации вызывается `refreshUser()` (refresh по cookie); при успехе пользователь восстанавливается из localStorage (бэкенд не отдаёт user в refresh).
- Колбэк при повторном 401 регистрируется через `setOnUnauthorized` (очистка user и localStorage).

### 5. Обёртка приложения

- В `main.tsx` корень приложения обёрнут в `<AuthProvider>`.

---

## Итог

**Фаза 1 реализована на 100%.** Все пять пунктов плана выполнены, артефакты на месте, поведение соответствует спецификации.

---

*Документ создан: Orchestrator Agent*
