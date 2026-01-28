# План интеграции бэкенда с фронтендом

**Версия:** 1.0  
**Дата:** 2026-01-28  
**Цель:** Подключить все экраны приложения к REST API бэкенда («Эмоциональный баланс»).

---

## 1. Обзор

### 1.1 Текущее состояние

- **Фронтенд:** React (Vite), навигация через состояние `currentPage` в `App.tsx`, данные на экранах — моки (локальные массивы).
- **Бэкенд:** Django REST API, базовый путь `/api/v1/`, JWT в **httpOnly cookies** (`access_token`, `refresh_token`), CORS с `credentials: true`.
- **Контракт API:** `docs/api/api-contracts.md`.

### 1.2 Ключевые решения

| Аспект | Решение |
|--------|---------|
| Авторизация | Токены только в cookies; все запросы с `credentials: 'include'`. |
| Base URL | Переменная окружения `VITE_API_BASE_URL` (по умолчанию `http://localhost:8000/api/v1`). |
| HTTP-клиент | Нативный `fetch` + тонкий слой `apiClient` (перехват 401, refresh, формат ошибок). |
| Кэширование (опционально) | React Query (TanStack Query) для списков и деталей — по желанию во второй фазе. |

### 1.3 Зависимости

- Текущий `package.json`: **без** axios/react-query. Для плана достаточно `fetch` + опционально позже добавить `@tanstack/react-query`.

---

## 2. Инфраструктура: API-клиент и окружение

### 2.1 Переменные окружения

В `frontend/.env` и `frontend/.env.example`:

```env
# Base URL бэкенда (без завершающего слэша)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Использование в коде: `import.meta.env.VITE_API_BASE_URL`.

### 2.2 Структура папок (рекомендуемая)

```
frontend/src/
├── api/                    # новый слой
│   ├── client.ts           # базовый fetch + refresh + ошибки
│   ├── endpoints/
│   │   ├── auth.ts
│   │   ├── content.ts
│   │   ├── booking.ts
│   │   ├── interactive.ts
│   │   ├── cabinet.ts
│   │   └── tracking.ts
│   └── types/              # типы ответов/запросов по контракту
│       ├── auth.ts
│       ├── content.ts
│       ├── booking.ts
│       ├── interactive.ts
│       └── cabinet.ts
├── app/
│   ├── components/        # экраны (подключить к api/)
│   └── ...
└── contexts/              # опционально
    └── AuthContext.tsx     # user, login, logout, refresh
```

### 2.3 Базовый API-клиент (`api/client.ts`)

Обязательный функционал:

1. **Base URL** из `import.meta.env.VITE_API_BASE_URL`.
2. **Опции по умолчанию:**  
   `credentials: 'include'`,  
   `headers: { 'Content-Type': 'application/json' }`.
3. **Обработка ответа:**  
   - 2xx: парсить `response.json()` (если есть body).  
   - 401: попытка обновить токен через `POST /auth/refresh/` (body: `{}` или `{ refresh: ... }`, refresh берётся из cookie), повтор исходного запроса один раз; при повторном 401 — выброс ошибки «Unauthorized» (для редиректа на логин).  
   - 4xx/5xx: парсить `{ error: { code, message, details } }` и выбрасывать типизированную ошибку (например, `ApiError` с полями `code`, `message`, `details`, `status`).
4. **Типы:** экспорт интерфейсов для ответов ошибок и обёртка `request<T>(method, path, body?)`.

Пример сигнатуры:

```ts
// api/client.ts
export async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T>
```

Использование в endpoint-файлах: вызывать `request<ResponseType>(...)` и возвращать результат.

### 2.4 Контекст авторизации (рекомендуется)

- **AuthContext:** хранение `user | null`, флаги `isLoading`, `isAuthenticated`; методы `login(credentials)`, `logout()`, `refreshUser()`.
- **login:** `POST /auth/login`, после успеха — установка `user` из `data.user`, cookies уже выставляет бэкенд.
- **logout:** `POST /auth/logout` + очистка `user`.
- **refresh:** при инициализации приложения (и при 401 в client) вызывать refresh; при успехе — обновить `user` (при необходимости запрос профиля, если бэкенд отдаёт пользователя в refresh).
- Защищённые экраны (кабинет, записи) при `!isAuthenticated` перенаправлять на логин (или показывать заглушку с кнопкой «Войти»).

---

## 3. Маппинг экран → API

Ниже перечислены **все экраны** из `App.tsx` и какие вызовы API к ним привязать.

### 3.1 Публичные статические (без данных с бэкенда)

| Экраны | Действие |
|--------|----------|
| HomePage, HowItWorksPage, AboutPage | Никаких обязательных запросов. Опционально: отправка tracking-события при показе (см. раздел Tracking). |
| PrivacyPolicyPage, ConsentPage, TermsPage, DisclaimerPage, CookiesPolicyPage | Статический контент. |
| EmergencyHelpPage | Статика. |
| NotFoundPage (404) | Статика. |

### 3.2 Контент: темы (Topics)

| Экраны | Метод | Endpoint | Описание |
|--------|--------|----------|----------|
| **TopicsHubPage** | GET | `/content/topics/` | Список тем. Ответ: `{ data: Array<{ id, slug, title, description }> }`. Заменить локальный массив `topics` на результат запроса; сохранить маппинг иконок/градиентов по `id` или `slug` на фронте. |
| **TopicDetailPage** | — | — | Бэкенд отдаёт только список тем (retrieve по slug нет). Варианты: (1) хранить выбранную тему в состоянии/контексте при переходе с хаба и рендерить по ней; (2) добавить на бэкенде `GET /content/topics/:slug` и дергать его при открытии детали. Рекомендация: вариант (1) для первой итерации. |

### 3.3 Контент: блог (статьи)

| Экраны | Метод | Endpoint | Описание |
|--------|--------|----------|----------|
| **BlogListPage** | GET | `/content/articles/?page=1&per_page=20` (+ опционально `category`, `tag`, `search`) | Ответ: `{ data: ArticleListItem[], pagination }`. Заменить мок-массив статей. Поддержать пагинацию (кнопки или «ещё»). При клике на статью — переход на BlogArticlePage с передачей `slug` (через state или будущий роутер). |
| **BlogArticlePage** | GET | `/content/articles/:slug/` | Один запрос при монтировании по `slug`. Ответ: `{ data: Article }`. Показывать заголовок, контент (Markdown → разметка), дату, теги. Обработка 404 (статья не найдена). |

**Важно:** текущая навигация без роутера — в `App.tsx` при переходе на «blog-article» нужно хранить выбранный `slug` в state и передавать в `BlogArticlePage`; при прямом открытии (если позже будет URL) — брать slug из пути.

### 3.4 Контент: ресурсы

| Экраны | Метод | Endpoint | Описание |
|--------|--------|----------|----------|
| **ResourcesListPage** | GET | `/content/resources/?page=1&per_page=20` | Ответ: `{ data: ResourceListItem[], pagination }`. Аналогично блогу — заменить моки, пагинация. |
| Деталь ресурса | GET | `/content/resources/:slug/` | Если в приложении есть экран «ресурс по slug», один запрос при открытии. Сейчас в App такого экрана может не быть — при появлении подключить сюда. |

### 3.5 Запись на консультацию (Booking)

| Экраны | Метод | Endpoint | Описание |
|--------|--------|----------|----------|
| **BookingServicePage** | GET | `/booking/services/` | Список услуг. Ответ: `{ data: Service[] }` (id, slug, title, description, duration_minutes, price_amount, format и т.д.). Заменить мок-массив. При выборе услуги сохранять `serviceId` (uuid) в state/контексте для следующих шагов. |
| **BookingSlotPage** | GET | `/booking/services/:serviceId/slots/?date_from=...&date_to=...&timezone=...` | Слоты на период. Ответ: `{ data: Slot[] }` (id, start_at, end_at, status). Нужны: `serviceId` с предыдущего шага, выбранная дата (или период). Таймзону брать из `Intl.DateTimeFormat().resolvedOptions().timeZone`. При выборе слота сохранять `slotId`. |
| **BookingFormPage** | POST | `/booking/appointments/` | Body: `{ service_id, slot_id, intake_form?, consents }`. Ответ 201: `{ data: Appointment }` с полем `payment.payment_url` при необходимости оплаты. После успеха — редирект в кабинет или на страницу «Запись оформлена» с ссылкой на оплату. |

### 3.6 Авторизация

| Экраны | Метод | Endpoint | Описание |
|--------|--------|----------|----------|
| **LoginPage** | POST | `/auth/login/` | Body: `{ email, password }`. Успех: 200, cookies выставляются бэкендом. В ответе `data.user` (id, email). Вызвать `AuthContext.login()` или установить user, затем редирект в кабинет/главную. Ошибки 401 — показать «Неверный email или пароль». |
| **RegisterPage** | POST | `/auth/register/` | Body: `{ email, password, display_name?, consents? }`. Успех: 201, cookies выставляются. Аналогично логину — обновить контекст и редирект. Ошибка 409 — «Email уже зарегистрирован». |

При необходимости обновления токена (и при 401 в api client):  
**POST** `/auth/refresh/` — body пустой или `{ refresh }`; refresh берётся из cookie. В ответе может быть новый access (или бэкенд обновляет cookie).

**Выход:** **POST** `/auth/logout/` (тело пустое), затем очистить user в контексте.

### 3.7 Личный кабинет (Cabinet)

Все запросы — с авторизацией (cookies).

| Экраны | Метод | Endpoint | Описание |
|--------|--------|----------|----------|
| **CabinetDashboard** | — | Опционально GET `/cabinet/appointments/` с `limit=3` | Для виджета «ближайшие встречи». Остальное — статика/навигация. |
| **CabinetAppointments** | GET | `/cabinet/appointments/?status=all|upcoming|past` | Список встреч клиента. Ответ: `{ data: Appointment[] }`. Разделение на «предстоящие» и «прошедшие» по дате слота на фронте. Отображение сервиса, даты/времени, статуса, ссылки на встречу. |
| **CabinetDiary** | GET | `/cabinet/diaries/` или `/interactive/diaries/` | Список записей дневника. Создание: POST с `{ type, content }`. Использовать один и тот же endpoint по контракту (в urls бэкенда — `interactive/diaries`). |
| **CabinetMaterials** | GET | `/content/resources/` или `/content/articles/` | Трактуется как «полезные материалы» — список ресурсов или статей для авторизованного пользователя. Выбрать один тип контента или комбинировать — по продукту. |

Примечание: в `backend/.../urls.py` дневники — `router.register(r'interactive/diaries', ...)`. В контракте cabinet упоминается GET/POST cabinet/diaries; нужно сверить с реальными URL. По текущему коду: список дневника — `CabinetDiaryViewSet.list` → `GET /cabinet/diaries/`, создание — через `interactive/diaries` (POST). Уточнить в коде бэкенда и в плане использовать: список `GET /cabinet/diaries/`, создание `POST /interactive/diaries/` если так зарегистрировано, иначе оба под cabinet.

### 3.8 Квизы (Interactive)

| Экраны | Метод | Endpoint | Описание |
|--------|--------|----------|----------|
| **QuizStartPage** | 1) GET `/interactive/quizzes/` | Список квизов. Если квиз один (PHQ-9) — можно сразу показывать его описание и кнопку «Начать». 2) При нажатии «Начать»: POST `/interactive/quizzes/:slug/start/` (slug квиза, например `phq-9` или как на бэкенде). | Ответ start: `{ data: { run_id, quiz, questions } }`. Сохранить `run_id` и `questions` в state (или контексте) для QuizProgressPage. |
| **QuizProgressPage** | — | Данные с предыдущего шага (run_id, questions). При отправке: POST `/interactive/quizzes/:slug/submit/` body: `{ run_id, answers: [ { question_id, value } ] }`. | Вопросы и варианты брать из `questions` с бэкенда. Формат ответов привести к виду API (question_id, value). При 200 — перейти на QuizResultPage с данными из ответа (result: level, profile, recommendations). Логика «кризис» (например, последний вопрос ≥ 2): при срабатывании переходить на QuizCrisisPage, не вызывать submit или вызывать и потом редирект на кризис. |
| **QuizResultPage** | — | Данные приходят с submit (или передаются через state). Отобразить level, recommendations. | |
| **QuizCrisisPage** | — | Статический экран. Без вызова API. | |

### 3.9 Навигатор

| Экраны | Метод | Endpoint | Описание |
|--------|--------|----------|----------|
| **NavigatorStartPage** | Опционально GET `/content/topics/` | Для консистентного списка тем/практик. Или оставить статичный блок. | |

### 3.10 Аналитика (Tracking)

| Где | Метод | Endpoint | Описание |
|-----|--------|----------|----------|
| Ключевые экраны | POST | `/tracking/events` | Body по контракту: `event_name`, `event_id`, `occurred_at`, `source`, `session_id`, `anonymous_id`, опционально `user_id`, `page`, `properties`. Вызывать при монтировании или при значимых действиях (например, «quiz_started», «booking_started»). Генерировать `session_id` и `anonymous_id` на клиенте (localStorage), при логине подставлять `user_id`. |

---

## 4. Детализация по экранам (что менять в коде)

### 4.1 TopicsHubPage

- Удалить локальный массив `topics`.
- При монтировании: `GET /content/topics/`, setState/данные в список.
- Маппинг: `id`/`slug` с бэкенда → иконка и градиент (локальный словарь по slug).
- При клике на тему: вызывать `onNavigateToTopic(slug)` (или сохранять slug в state и переходить на topic-detail). Для TopicDetailPage передать slug (или объект темы).

### 4.2 TopicDetailPage

- Вариант без нового API: получать `slug` (или topic) через props/state от TopicsHubPage; рендер по переданным title/description; ссылки на квиз/навигатор — как сейчас.
- Вариант с API: при наличии `GET /content/topics/:slug` — запрос по slug при монтировании.

### 4.3 BlogListPage

- Запрос: `GET /content/articles?page=1&per_page=20`. Сохранить `data` и `pagination`.
- Рендер списка из `data`; маппинг полей (slug, title, excerpt, published_at, category, tags).
- Пагинация: при смене страницы — новый запрос с `page`.
- Клик по статье: `onNavigateToArticle(slug)` + в App сохранить `articleSlug` для BlogArticlePage.

### 4.4 BlogArticlePage

- Получить `slug` из props/state (из App). При монтировании: `GET /content/articles/:slug/`.
- Отобразить title, content (Markdown), published_at, tags. 404 — сообщение и ссылка на список.

### 4.5 ResourcesListPage

- Аналогично блогу: `GET /content/resources?page=1&per_page=20`, отображение и пагинация.
- При наличии экрана детали ресурса — передавать slug и запрашивать `GET /content/resources/:slug/`.

### 4.6 BookingServicePage

- `GET /booking/services/`. Отображение карточек (title, description, duration_minutes, price_amount, format).
- При выборе услуги: сохранить `serviceId` (uuid) в state App или в контексте Booking, вызвать `onSelectService(serviceId)` и переход на booking-slot.

### 4.7 BookingSlotPage

- Получить `serviceId` из state/контекста.
- Период: например текущий месяц. Запрос: `GET /booking/services/:serviceId/slots/?date_from=...&date_to=...&timezone=Europe/Moscow`.
- Отрисовать календарь/слоты из `data`. При выборе слота сохранить `slotId`, при «Продолжить» — переход на booking-form.

### 4.8 BookingFormPage

- Получить `serviceId`, `slotId` из state/контекста.
- Форма: имя, контакты, intake_form (если есть), согласия (consents).
- Отправка: `POST /booking/appointments/` с `{ service_id, slot_id, intake_form, consents }`.
- Успех: показать сообщение и ссылку на `data.payment.payment_url` (если есть) или «Запись создана» и редирект в кабинет.

### 4.9 LoginPage / RegisterPage

- Заменить мок на вызовы `api/endpoints/auth.ts`: login и register.
- При успехе — обновить AuthContext и редирект (например, в кабинет или домой).
- Ошибки: 401/409 — показывать текст из `error.message`.

### 4.10 Cabinet*

- **CabinetAppointments:** при монтировании `GET /cabinet/appointments/`, отобразить таблицу/карточки; разделение на предстоящие/прошедшие по `slot.start_at`.
- **CabinetDiary:** GET список записей; форма добавления — POST с type и content. Использовать endpoint из urls (cabinet/diaries или interactive/diaries в зависимости от бэкенда).
- **CabinetMaterials:** один или два запроса (resources, articles) и отображение списка с ссылками.

### 4.11 Quiz*

- **QuizStartPage:** GET квизов; при одном квизе — сразу показать описание и кнопку «Начать». По кнопке — POST start, сохранить run_id и questions, переход на quiz-progress.
- **QuizProgressPage:** получать run_id, questions, quiz_slug из state/контекста; рендер вопросов из `questions`; сбор answers в формате `[{ question_id, value }]`; по «Готово» — POST submit; по ответу — переход на result или crisis в зависимости от логики кризиса.
- **QuizResultPage:** получать result (level, recommendations) из state после submit и отображать.

---

## 5. Типы (TypeScript)

Рекомендуется завести в `api/types/` интерфейсы по контракту, например:

- **auth:** User, LoginRequest, RegisterRequest, AuthResponse.
- **content:** Article, ArticleListItem, Resource, ResourceListItem, Topic, Pagination, ListArticlesResponse и т.д.
- **booking:** Service, Slot, Appointment, CreateAppointmentRequest.
- **interactive:** Quiz, QuizRun, Question, QuizSubmitRequest, QuizResult.
- **cabinet:** CabinetAppointment, DiaryEntry.
- **tracking:** TrackingEventPayload.
- **errors:** ApiError, ErrorDetail.

Использовать их в `api/endpoints/*` и в компонентах при setState/пропсах.

---

## 6. Обработка ошибок и граничные случаи

- **Сеть недоступна:** показывать сообщение «Проверьте подключение» и кнопку повтора.
- **401 после refresh:** редирект на логин и очистка user.
- **403:** сообщение «Недостаточно прав».
- **404:** «Ресурс не найден» с навигацией назад.
- **422:** показывать `error.details` под полями формы.
- **429:** «Слишком много запросов. Попробуйте позже.»

Во всех запросах через `api/client` обрабатывать ошибки единообразно (например, пробрасывать ApiError с code/message/details).

---

## 7. Порядок внедрения (фазы)

### Фаза 1 — Инфраструктура ✅ ЗАВЕРШЕНО

1. ✅ Добавить `VITE_API_BASE_URL` в `.env` и `.env.example`.
2. ✅ Реализовать `api/client.ts` (request, refresh при 401, типы ошибок).
3. ✅ Реализовать `api/endpoints/auth.ts` и типы auth.
4. ✅ Добавить AuthContext (login, logout, refresh, user).
5. ✅ Обернуть приложение в AuthProvider.

### Фаза 2 — Публичный контент ✅ ЗАВЕРШЕНО

6. ✅ `api/endpoints/content.ts` + типы: articles, resources, topics.
7. ✅ Подключить TopicsHubPage → GET topics.
8. ✅ Подключить BlogListPage и BlogArticlePage (статьи).
9. ✅ Подключить ResourcesListPage (ресурсы).
10. ✅ TopicDetailPage: получать данные из state (локальный словарь данных).

### Фаза 3 — Booking ✅ ЗАВЕРШЕНО

11. ✅ `api/endpoints/booking.ts` + типы.
12. ✅ BookingServicePage → GET services.
13. ✅ BookingSlotPage → GET slots (передача serviceId, дат, timezone).
14. ✅ BookingFormPage → POST appointment; передача serviceId/slotId через state/контекст.

### Фаза 4 — Авторизация и кабинет ✅ ЗАВЕРШЕНО

15. ✅ LoginPage и RegisterPage перевести на API и AuthContext.
16. ✅ CabinetAppointments → GET cabinet/appointments.
17. ✅ CabinetDiary → GET/POST diaries (cabinet/diaries список, interactive/diaries создание).
18. ✅ CabinetMaterials → GET resources и articles.
19. ✅ Защита экранов кабинета: при неавторизованном пользователе — редирект на логин.

### Фаза 5 — Квизы

20. `api/endpoints/interactive.ts` + типы (quizzes, start, submit).
21. QuizStartPage: GET quizzes, POST start; передача run_id, questions, slug в следующий экран.
22. QuizProgressPage: рендер по questions, сбор answers, POST submit; переход на result/crisis.
23. QuizResultPage: отображение данных из ответа submit.

### Фаза 6 — Дополнительно

24. Tracking: хелпер `trackEvent(...)` и вызовы на ключевых экранах (главная, квиз, запись, кабинет).
25. Единая обработка ошибок в UI (тосты или inline-сообщения).
26. Опционально: React Query для кэширования списков и деталей.

---

## 8. Чек-лист по экранам (финальная сводка)

| № | Экраны | Endpoint(s) | Статус |
|---|--------|-------------|--------|
| 1 | HomePage, HowItWorks, About, Legal, Emergency, 404 | — | ✅ Статика / опционально tracking |
| 2 | TopicsHubPage | GET /content/topics/ | ✅ Подключено |
| 3 | TopicDetailPage | State (локальный словарь) | ✅ Подключено |
| 4 | BlogListPage | GET /content/articles/ | ✅ Подключено |
| 5 | BlogArticlePage | GET /content/articles/:slug/ | ✅ Подключено |
| 6 | ResourcesListPage | GET /content/resources/ | ✅ Подключено |
| 7 | BookingServicePage | GET /booking/services/ | ✅ Подключено |
| 8 | BookingSlotPage | GET /booking/services/:id/slots/ | ✅ Подключено |
| 9 | BookingFormPage | POST /booking/appointments | ✅ Подключено |
| 10 | LoginPage | POST /auth/login/ | ✅ Подключено |
| 11 | RegisterPage | POST /auth/register/ | ✅ Подключено |
| 12 | CabinetDashboard | Опционально GET /cabinet/appointments | ✅ Статика/навигация |
| 13 | CabinetAppointments | GET /cabinet/appointments/ | ✅ Подключено |
| 14 | CabinetDiary | GET cabinet/diaries, POST interactive/diaries | ✅ Подключено |
| 15 | CabinetMaterials | GET /content/resources/ и articles | ✅ Подключено |
| 16 | QuizStartPage | GET /interactive/quizzes/, POST .../start/ | Подключить |
| 17 | QuizProgressPage | POST .../submit/ (данные со start) | Подключить |
| 18 | QuizResultPage | Данные из submit | Подключить |
| 19 | QuizCrisisPage | — | Статика |
| 20 | NavigatorStartPage | Опционально GET /content/topics/ | По желанию |
| 21 | Tracking | POST /tracking/events | Подключить на ключевых экранах |

---

## 9. Ссылки

- Контракт API: `docs/api/api-contracts.md`
- Бэкенд API URLs: `backend/presentation/api/v1/urls.py`
- Настройки CORS: `backend/config/settings/development.py` (порты 3000, 3010)
- Авторизация (cookies): `backend/presentation/api/v1/views/auth.py`

---

*Документ создан: Orchestrator Agent*
