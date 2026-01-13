# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-BKG-01`  
**Epic:** `EPIC-04`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Реализуем каталог услуг и правила записи: публичные страницы `/services/` и `/services/{service-slug}/`, отображение формата/длительности/цены/депозита/правил отмены и CTA в `/booking/`. Управление услугами — через админку (см. `FEAT-ADM-02`, `Admin-Panel-Specification`).

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-BKG-1, FR-BKG-3)
- IA: `docs/information-architecture.md` (`/services/*`, `/booking/`)
- Admin spec: `docs/Admin-Panel-Specification.md` (4.3 Услуги)
- Domain model: `docs/Domain-Model-Specification.md` (Service VO/aggregate)
- Tracking: `docs/Tracking-Plan.md` (`service_selected`)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Публичный каталог услуг с понятным “что будет” и правилами.
- **G2:** Страница услуги включает:
  - формат (online/offline/hybrid), адрес для офлайна,
  - длительность,
  - цена/депозит,
  - правила отмены/переноса,
  - CTA: начать запись.
- **G3:** Сервисные данные — источник истины для booking/payments.

### 2.2 Non-goals
- Пакеты/скидки (P2).

---

## 3) Scope / AC
- [ ] AC-1 `/services/` показывает активные услуги.
- [ ] AC-2 `/services/{slug}/` доступна по slug и содержит правила.
- [ ] AC-3 Клик CTA отправляет `booking_start` с `service_slug` (если известно).

Негативные:
- slug не найден → 404.

---

## 4) UX / UI
- UI и тон по `docs/UI-Kit-Design-System.md` + контент-гайд.
- A11y: семантические секции, доступные CTA.

---

## 5) Архитектура
- **Application:** `ListServicesUseCase`, `GetServiceBySlugUseCase`.
- **Domain:** `Service` (в Booking context).
- **Infrastructure:** Postgres service repo; admin CRUD в `FEAT-ADM-02`.

---

## 6) Data model
По модели данных:
- `services`: slug, title, format, duration, price, deposit, cancel/reschedule policy.

Классификация: P0.

---

## 7) API
Public:
- `GET /api/public/services`
- `GET /api/public/services/{slug}`

Admin:
- `GET/POST/PUT /api/admin/services/*` (в `FEAT-ADM-02`)

---

## 8) Tracking
- `service_selected` (service_slug, format, price_bucket)
- `booking_start` (если стартуем из услуги)

---

## 12) Test plan
- e2e: `/services/{slug}` → CTA → `/booking/` и событие.

