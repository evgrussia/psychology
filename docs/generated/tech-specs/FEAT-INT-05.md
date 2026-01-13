# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-INT-05`  
**Epic:** `EPIC-03`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Запускаем библиотеку мини‑ритуалов (RIT‑01..): каталог + карточка ритуала с инструкцией (markdown), таймером и (опционально) аудио, управляемую из админки.

### 1.3 Ссылки
- Interactive matrix: `docs/Interactive-Modules-Matrix.md` (RIT-*)
- Admin spec: `docs/Admin-Panel-Specification.md` (4.5.6)
- IA: `docs/information-architecture.md` (`/start/rituals/`)
- Media: `FEAT-PLT-04`
- Tracking: `docs/Tracking-Plan.md` (`ritual_started`, `ritual_completed`)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Каталог `/start/rituals/` с фильтром по теме.
- **G2:** Карточка ритуала: “зачем”, пошаговая инструкция, таймер (если включён), аудио (если есть).
- **G3:** Админ CRUD ритуалов + публикация/архив.
- **G4:** Трекинг start/complete без текста.

### 2.2 Non-goals
- Стрики/геймификация.

---

## 3) Scope / AC
- [ ] AC-1 Аудио хранится в локальном медиа-хранилище (VPS статика) и отдаётся пользователю.
- [ ] AC-2 Таймер работает офлайн (client-side) и не требует backend.
- [ ] AC-3 Ритуалы доступны без логина.

Негативные:
- аудио не загрузилось → ритуал всё равно доступен (текст+таймер).

---

## 4) UX / UI
- A11y: кнопки play/pause с aria-label, таймер читаем.

---

## 5) Архитектура
- **Application:** `ListRitualsUseCase`, `GetRitualUseCase` (public), `UpsertRitualUseCase` (admin).
- **Domain:** `Ritual` (definition).
- **Infrastructure:** Postgres repo + media assets links.

---

## 6) Data model
Вариант:
- `interactive_definitions` (type `ritual`) + `definition_json` (steps, duration, audio_media_asset_id)
или отдельная `rituals` таблица (как в Admin spec).

---

## 7) API
Public:
- `GET /api/public/rituals`
- `GET /api/public/rituals/{slug}`

Admin:
- `PUT/POST /api/admin/interactive/rituals/*` (в `FEAT-ADM-03`)

---

## 8) Tracking
- `ritual_started` (ritual_slug, topic)
- `ritual_completed` (ritual_slug, duration_ms)

---

## 9) Security/Privacy
- не отправлять в аналитику содержимое инструкций.

---

## 12) Test plan
- e2e: открыть ритуал → старт таймера → complete → событие.

