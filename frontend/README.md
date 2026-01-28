# Фронтенд «Эмоциональный баланс»

Фронтенд платформы психологической поддержки — свёрстан по промптам из `FIGMA_MAKE_PROMPTS.md` и `FIGMA_CONCEPT_PROMPT.md`.

## Стек

- **React 18** + TypeScript
- **Vite** — сборка и dev-сервер
- **Tailwind CSS 4** — стили
- **Motion** — анимации
- **Radix UI** (через shadcn/ui-компоненты) — доступность
- **Lucide React** — иконки

## Запуск

```bash
# Установка зависимостей
npm install
# или
pnpm install

# Режим разработки (http://localhost:3010)
npm run dev

# Сборка для production
npm run build

# Просмотр production-сборки
npm run preview
```

Фронтенд по умолчанию запускается на порту **3010** (соответствует `FRONTEND_PORT` в корневом `.env`).

## Интеграция с бэкендом

- Бэкенд (Django): по умолчанию `http://127.0.0.1:8000`.
- В режиме разработки Vite проксирует запросы:
  - `/api` → `http://127.0.0.1:8000/api`
  - `/admin` → `http://127.0.0.1:8000/admin`

Чтобы бэкенд принимал запросы с фронтенда, в настройках Django (development) должны быть разрешены CORS для `http://localhost:3010` и `http://127.0.0.1:3010`.

Переменные окружения (опционально):

- `VITE_API_BASE_URL` — базовый URL API (если не через proxy).

## Структура

```
frontend/
├── index.html          # Точка входа Vite
├── public/             # Статика (favicon и т.д.)
├── src/
│   ├── main.tsx        # Точка входа React
│   ├── app/
│   │   ├── App.tsx     # Корневой компонент, роутинг по состоянию
│   │   └── components/ # Страницы и UI
│   │       ├── ui/     # Базовые компоненты (shadcn/ui)
│   │       └── ...     # Страницы (HomePage, AboutPage, и т.д.)
│   └── styles/         # Глобальные стили, тема, Tailwind
├── package.json
├── vite.config.ts
└── README.md
```

Навигация сейчас реализована через состояние в `App.tsx` (без URL). Подключение React Router и привязка к URL — следующий шаг при интеграции с бэкендом.

## Документация по дизайну

- `FIGMA_CONCEPT_PROMPT.md` — общая концепция дизайна
- `FIGMA_MAKE_PROMPTS.md` — промпты по экранам (в корне репозитория)
