# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-SEC-03`  
**Epic:** `EPIC-11`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~100k токенов (≤ 270k)

---

## 1) Summary
Сквозные политики доступа и аудит критичных операций: P2 данные доступны только по RBAC+need-to-know; все admin critical операции фиксируются в audit log; экспорт данных и удаление — всегда аудируются.

### Ссылки
- Admin spec: `docs/Admin-Panel-Specification.md` (RBAC, audit log)
- Audit: `FEAT-PLT-05`
- RBAC: `FEAT-PLT-03`

---

## 2) Goals
- централизованный permission matrix (route/action → roles),
- ownership checks для client data,
- audit hooks для операций: export/delete/price change/role change.

---

## 3) AC
- [ ] AC-1 P2 endpoints требуют `owner` (или `assistant` с ограничениями).
- [ ] AC-2 Любая попытка несанкционированного доступа логируется как security event (без PII).

---

## 12) Test plan
- integration: assistant не видит audit log (кроме своих), editor не видит лиды/модерацию.

