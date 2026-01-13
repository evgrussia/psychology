# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-ADM-03`  
**Epic:** `EPIC-08`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~220k токенов (≤ 270k)

---

## 1) Summary
Админ-раздел `/admin/interactive/`: управление интерактивами без кода (квизы, навигатор тексты, термометр, скрипты границ, мини‑ритуалы), превью и публикация/версии.

### Ссылки
- Admin spec: `docs/Admin-Panel-Specification.md` (4.5)
- Interactive: `FEAT-INT-01..05`
- Technical decisions: `docs/Technical-Decisions.md` (структура NAV не редактируется в релиз 1)

---

## 2) Goals
- список интерактивов + метрики (starts/completion/cta),
- редактор QZ: вопросы/шкалы/пороги/результаты/дисклеймеры/кризис‑порог,
- NAV: редактировать тексты, не связи,
- TRM: веса/формула уровня (по матрице),
- BND: матрица вариантов фраз (variant_id),
- RIT: CRUD ритуалов + аудио.

---

## 3) AC
- [ ] AC-1 Публикация валидирует корректность definition (пороги, граф).
- [ ] AC-2 Превью открывает published/draft версию.
- [ ] AC-3 RBAC: owner/editor.

---

## 6) Data model
- `interactive_definitions` + optional `interactive_definition_versions`.

---

## 7) API
- `GET /api/admin/interactive`
- `GET/PUT /api/admin/interactive/{id}`
- `POST /api/admin/interactive/{id}/publish`
- `GET /api/admin/interactive/{id}/preview?version=...`

---

## 12) Test plan
- e2e: изменить порог QZ‑01 → publish → пройти квиз и увидеть новый уровень на границе.

