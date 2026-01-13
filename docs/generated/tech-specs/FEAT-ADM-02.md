# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-ADM-02`  
**Epic:** `EPIC-08`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~180k токенов (≤ 270k)

---

## 1) Summary
Раздел `/admin/schedule/`: управление слотами, исключениями, буферами и синхронизацией с Google Calendar (в UI). Owner+assistant.

### Ссылки
- Admin spec: `docs/Admin-Panel-Specification.md` (4.2)
- Booking: `FEAT-BKG-02`

---

## 2) Goals
- календарь (день/неделя/месяц) + список слотов,
- создание/редактирование слотов и исключений,
- просмотр бронирований,
- запуск sync и статус интеграции.

---

## 3) AC
- [ ] AC-1 UI показывает статусы (available/booked/exception/buffer).
- [ ] AC-2 Изменения отражаются в публичной availability.

---

## 7) API
- `GET/POST/PUT /api/admin/schedule/*`
- `POST /api/admin/integrations/google-calendar/sync`

---

## 12) Test plan
- e2e: создать слот → слот появился в booking API.

