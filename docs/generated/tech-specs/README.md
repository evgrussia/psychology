# Индекс техспеков (Release 1 / P0)

**Проект:** «Эмоциональный баланс»  
**Дата генерации:** 2026-01-07  
**Назначение:** набор Tech Spec файлов по шаблону `docs/Feature-Tech-Spec-Template.md` для **полной реализации Release 1 (P0)** из `docs/Roadmap-Backlog.md`.

## Как этим пользоваться агенту Cursor

- **Одна фича = один контекст исполнения.** Для каждой фичи ниже есть отдельный файл с техспеком.
- **Готовые промпты для реализации:** см. `Cursor-Agent-Implementation-Prompts.md` (порядок — по `docs/Final-Implementation-Checklist.md`).
- **Контекстное окно:** 270 000 токенов.
  - Если оценка близка к лимиту, в техспеке добавлен **план нарезки на implementation slices**, чтобы укладываться.
- **Token estimate** — это ориентир на “сколько токенов обычно уходит агенту” на реализацию кода + тесты + правки по ревью в рамках одной фичи.

## Список фич (P0) и оценки токенов

> Легенда: `~50k` = примерно 50 000 токенов.

### EPIC-00 — Platform & Foundations

| Feature ID | Спека | Оценка токенов | Примечание |
|---|---|---:|---|
| FEAT-PLT-01 | `FEAT-PLT-01.md` | ~110k | скелет, CI/CD, окружения |
| FEAT-PLT-02 | `FEAT-PLT-02.md` | ~180k | БД + миграции по модели данных |
| FEAT-PLT-03 | `FEAT-PLT-03.md` | ~140k | RBAC + сессии |
| FEAT-PLT-04 | `FEAT-PLT-04.md` | ~90k | Медиа-статика (VPS) |
| FEAT-PLT-05 | `FEAT-PLT-05.md` | ~80k | аудит-лог (минимум) |

### EPIC-01 — Public Web

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-WEB-01 | `FEAT-WEB-01.md` | ~90k |
| FEAT-WEB-02 | `FEAT-WEB-02.md` | ~70k |
| FEAT-WEB-03 | `FEAT-WEB-03.md` | ~40k |

### EPIC-02 — Content & SEO

| Feature ID | Спека | Оценка токенов | Примечание |
|---|---|---:|---|
| FEAT-CNT-01 | `FEAT-CNT-01.md` | ~240k | близко к лимиту → есть slices |
| FEAT-CNT-02 | `FEAT-CNT-02.md` | ~100k | темы/лендинги |
| FEAT-CNT-03 | `FEAT-CNT-03.md` | ~70k | glossary (минимум) |
| FEAT-CNT-04 | `FEAT-CNT-04.md` | ~70k | curated (минимум) |

### EPIC-03 — Interactive

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-INT-01 | `FEAT-INT-01.md` | ~200k |
| FEAT-INT-02 | `FEAT-INT-02.md` | ~220k |
| FEAT-INT-03 | `FEAT-INT-03.md` | ~180k |
| FEAT-INT-04 | `FEAT-INT-04.md` | ~120k |
| FEAT-INT-05 | `FEAT-INT-05.md` | ~120k |
| FEAT-INT-06 | `FEAT-INT-06.md` | ~80k |

### EPIC-04 — Booking

| Feature ID | Спека | Оценка токенов | Примечание |
|---|---|---:|---|
| FEAT-BKG-01 | `FEAT-BKG-01.md` | ~120k | услуги + правила |
| FEAT-BKG-02 | `FEAT-BKG-02.md` | ~260k | близко к лимиту → есть slices |
| FEAT-BKG-03 | `FEAT-BKG-03.md` | ~220k | UI записи + анкета + согласия |
| FEAT-BKG-04 | `FEAT-BKG-04.md` | ~120k | анти-гонки / конфликты |
| FEAT-BKG-05 | `FEAT-BKG-05.md` | ~90k | no slots → waitlist/TG |

### EPIC-05 — Payments

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-PAY-01 | `FEAT-PAY-01.md` | ~120k |
| FEAT-PAY-02 | `FEAT-PAY-02.md` | ~120k |
| FEAT-PAY-03 | `FEAT-PAY-03.md` | ~80k |

### EPIC-06 — Telegram

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-TG-01 | `FEAT-TG-01.md` | ~100k |
| FEAT-TG-02 | `FEAT-TG-02.md` | ~200k |
| FEAT-TG-03 | `FEAT-TG-03.md` | ~60k |

### EPIC-07 — Client Cabinet

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-LK-01 | `FEAT-LK-01.md` | ~120k |
| FEAT-LK-02 | `FEAT-LK-02.md` | ~200k |
| FEAT-LK-03 | `FEAT-LK-03.md` | ~120k |
| FEAT-LK-04 | `FEAT-LK-04.md` | ~160k |

### EPIC-08 — Admin Panel

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-ADM-01 | `FEAT-ADM-01.md` | ~160k |
| FEAT-ADM-02 | `FEAT-ADM-02.md` | ~180k |
| FEAT-ADM-03 | `FEAT-ADM-03.md` | ~220k |
| FEAT-ADM-04 | `FEAT-ADM-04.md` | ~180k |
| FEAT-ADM-05 | `FEAT-ADM-05.md` | ~150k |
| FEAT-ADM-06 | `FEAT-ADM-06.md` | ~200k |

### EPIC-09 — UGC & Moderation

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-MOD-01 | `FEAT-MOD-01.md` | ~140k |
| FEAT-MOD-02 | `FEAT-MOD-02.md` | ~120k |

### EPIC-10 — Analytics & Observability

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-AN-01 | `FEAT-AN-01.md` | ~140k |
| FEAT-AN-02 | `FEAT-AN-02.md` | ~120k |
| FEAT-AN-03 | `FEAT-AN-03.md` | ~120k |

### EPIC-11 — Security/Privacy/Compliance

| Feature ID | Спека | Оценка токенов |
|---|---|---:|
| FEAT-SEC-01 | `FEAT-SEC-01.md` | ~120k |
| FEAT-SEC-02 | `FEAT-SEC-02.md` | ~120k |
| FEAT-SEC-03 | `FEAT-SEC-03.md` | ~100k |

### EPIC-12 — Accessibility

| Feature ID | Спека | Оценка токенов | Примечание |
|---|---|---:|---|
| FEAT-A11Y-01 | `FEAT-A11Y-01.md` | ~200k | кросс-срез → есть slices |

---

## Backlog: P1 (после запуска, Release 1.x / Release 2)

| Feature ID | Спека | Оценка токенов | Примечание |
|---|---|---:|---|
| FEAT-AN-11 | `FEAT-AN-11.md` | ~180k | детальная аналитика интерактивов |
| FEAT-INT-11 | `FEAT-INT-11.md` | ~240k | визуальный редактор NAV (сложно → slices) |
| FEAT-WEB-11 | `FEAT-WEB-11.md` | ~60k | улучшения конверсии главной/CTA |
| FEAT-BKG-11 | `FEAT-BKG-11.md` | ~120k | улучшение “нет слотов” (авто-альтернативы) |

## Backlog: P2 (позже/опционально)

| Feature ID | Спека | Оценка токенов | Примечание |
|---|---|---:|---|
| FEAT-AB-01 | `FEAT-AB-01.md` | ~220k | A/B инфраструктура |
| FEAT-AI-01 | `FEAT-AI-01.md` | ~300k | >270k → обязательно slices/этапы |
| FEAT-MOB-01 | `FEAT-MOB-01.md` | ~180k | mobile-admin (ограниченная) |
| FEAT-RET-99 | `FEAT-RET-99.md` | ~150k | агрессивные retention механики (только если ок позиционированию) |

