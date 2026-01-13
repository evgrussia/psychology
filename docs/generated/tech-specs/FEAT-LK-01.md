# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-LK-01`  
**Epic:** `EPIC-07`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary
Минимальный ЛК клиента: обзор и список встреч/материалов, доступный после авторизации, с корректными правами доступа (только свои записи).

### Ссылки
- PRD: `docs/PRD.md` (FR-LK-1)
- IA: `docs/information-architecture.md` (`/cabinet/*`)
- Tracking: `docs/Tracking-Plan.md` (`lk_opened`)

---

## 2) Goals
- `/cabinet/` и подразделы `/cabinet/appointments/`, `/cabinet/materials/`.
- отображение предстоящих/прошедших встреч (из booking).
- материалы: ссылки/файлы (локальное медиа-хранилище; для приватных материалов — через авторизованный прокси/подпись ссылок в отдельной фиче).

---

## 3) AC
- [ ] AC-1 Доступ только для роли `client`.
- [ ] AC-2 Пользователь видит только свои appointments.

---

## 6) Data model
- `appointments` (client_user_id)
- `materials` (если есть) или `content_items` привязанные к appointment (минимум).

---

## 7) API
- `GET /api/cabinet/me`
- `GET /api/cabinet/appointments`
- `GET /api/cabinet/materials`

---

## 8) Tracking
- `lk_opened` (page_path)

---

## 12) Test plan
- e2e: login → открыть ЛК → увидеть встречи.

