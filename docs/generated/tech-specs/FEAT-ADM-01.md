# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-ADM-01`  
**Epic:** `EPIC-08`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~160k токенов (≤ 270k)

---

## 1) Summary
Админка: базовый shell (layout, навигация, desktop-only), RBAC‑доступы и главный дашборд `/admin/` с ключевыми виджетами (booking funnel, telegram, интерактивы, модерация, выручка).

### Ссылки
- Admin spec: `docs/Admin-Panel-Specification.md` (3.1, 4.1)
- Tracking: `docs/Tracking-Plan.md` (admin_login)
- RBAC: `FEAT-PLT-03`

---

## 2) Goals
- навигация по разделам `/admin/*` согласно IA админки,
- desktop-only guard (<768px сообщение),
- дашборд с периодами (today/7d/30d/custom) и быстрыми ссылками.

---

## 3) AC
- [ ] AC-1 Owner видит дашборд, assistant — ограниченный набор, editor — не видит.
- [ ] AC-2 Виджеты строятся по данным из tracking/БД (best effort).

---

## 7) API
- `GET /api/admin/dashboard?range=...` (RBAC)

---

## 12) Test plan
- e2e: owner login → открыть `/admin/` → виджеты есть.

