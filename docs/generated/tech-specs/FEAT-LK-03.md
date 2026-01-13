# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-LK-03`  
**Epic:** `EPIC-07`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary
Экспорт PDF “на консультацию” из дневников: пользователь выбирает период и получает PDF файл.

### Ссылки
- PRD: `docs/PRD.md` (FR-LK-3)
- Tracking: `docs/Tracking-Plan.md` (`pdf_exported`)

---

## 2) Goals
- генерация PDF из дневниковых записей (P2),
- хранение: либо on-the-fly download, либо временный файл (signed URL) с TTL.

---

## 3) AC
- [ ] AC-1 PDF доступен только владельцу.
- [ ] AC-2 В аналитике только факт экспорта, без содержания.

---

## 6) Data model
Опционально:
- `diary_exports` (user_id, created_at, expires_at, storage_key) — если храним файлы.

---

## 7) API
- `POST /api/cabinet/diary/export` → `application/pdf` или `{download_url}`

---

## 8) Tracking
- `pdf_exported` (export_type=diary_pdf, period)

---

## 9) Security/Privacy
- PDF содержит P2 → хранение только временно, доступ по signed URL.

---

## 12) Test plan
- integration: export returns pdf, access denied for other user.

