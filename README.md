# Эмоциональный баланс

Персональная платформа психологической поддержки — тёплое онлайн-пространство: интерактивы, консультации, ресурсы.

## Структура проекта

- **`frontend/`** — SPA на React + Vite (свёрстан по промптам Figma Make). Запуск: `cd frontend && npm install && npm run dev` (порт 3010).
- **`backend/`** — API на Django (DDD, REST). Запуск: см. `backend/README.md` (порт 8000).
- **`docs/`** — PRD, дизайн, исследования.
- **`FIGMA_MAKE_PROMPTS.md`**, **`FIGMA_CONCEPT_PROMPT.md`** — промпты для дизайна/верстки.

## Быстрый старт

1. Бэкенд: настроить `.env`, БД, затем запустить Django (порт 8000).
2. Фронтенд: `cd frontend && npm install && npm run dev` — откроется http://localhost:3010.
3. CORS для разработки уже разрешён с origin `http://localhost:3010` и `http://127.0.0.1:3010`.

Подробнее: `frontend/README.md`, `backend/README.md`.
