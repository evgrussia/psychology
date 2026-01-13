## Внедрение исследования 13 в документацию проекта — карта соответствия и пробелы

**Источник**: `docs/research/13-Competitive-Research-Psychology-Portals.md`  
**Версия**: v0.1  
**Дата**: 2026-01-07  

Цель документа: быстро проверить, что выводы исследования **не просто “упомянуты”**, а **приземлены** в требования, флоу, UX‑копи и аналитике.  

---

## 1) Ключевые выводы исследования 13 → где они внедрены

### 1.1 Быстрый безопасный “первый шаг” (1–3 минуты)
- **Где зафиксировано**:
  - `docs/PRD.md` (one‑liner, сценарии, `FR-HP-*`, `FR-INT-*`)
  - `docs/research/04-Interactive-Modules.md` (разделы 0, 2, 4)
  - `docs/user-flows-cjm.md` (флоу 1, 2, 4)
  - `docs/Content-Guide-UX-Copywriting.md` (паттерны 5.1–5.5)
- **Статус**: внедрено.

### 1.2 “Результат = польза + следующий шаг” (3 слоя)
Из исследования: уровень → “что это может значить” → что делать (сейчас/на неделю) + “когда обратиться”.
- **Где зафиксировано**:
  - `docs/PRD.md` (`FR-INT-2`, acceptance criteria)
  - `docs/research/04-Interactive-Modules.md` (2.1–2.3)
  - `docs/User-Stories-JTBD-Acceptance-Criteria.md` (US-INT-01/02)
  - `docs/Content-Guide-UX-Copywriting.md` (5.4)
- **Статус**: внедрено.

### 1.3 Интерактивы без логина; логин/Telegram только “сохранить/продолжить”
- **Где зафиксировано**:
  - `docs/PRD.md` (`FR-INT-1`, `FR-INT-7`, privacy constraints)
  - `docs/information-architecture.md` (принципы IA, `/start/…`, “избранное/аптечка”)
  - `docs/user-flows-cjm.md` (флоу 1/2/3/7)
- **Статус**: внедрено.

### 1.4 “Urgent support” / кризисный режим (без “прогрева”)
- **Где зафиксировано**:
  - `docs/PRD.md` (`FR-INT-4`, constraints)
  - `docs/research/04-Interactive-Modules.md` (1.3, 6.*)
  - `docs/User-Stories-JTBD-Acceptance-Criteria.md` (US-HP-03, US-INT-02/05)
  - `docs/Content-Guide-UX-Copywriting.md` (3.2)
  - `docs/Tracking-Plan.md` (`crisis_banner_shown`)
- **Статус**: внедрено.

### 1.5 Доверие рядом с интерактивом (процесс/границы/конфиденциальность/FAQ)
- **Где зафиксировано**:
  - `docs/PRD.md` (`FR-HP-3`, `FR-TRUST-*`)
  - `docs/information-architecture.md` (принципы и page patterns 5.*)
  - `docs/user-flows-cjm.md` (North Star CJM — этап “Доверие”)
  - `docs/research/07-Trust-SocialProof-Profile.md` (детализация доверительных блоков)
- **Статус**: внедрено.

### 1.6 Контент‑связки: статья → “попробовать сейчас”; результат теста → материалы/запись
- **Где зафиксировано**:
  - `docs/PRD.md` (`FR-CNT-2`, `FR-IA-2/3`)
  - `docs/user-flows-cjm.md` (флоу 2, 3)
  - `docs/User-Stories-JTBD-Acceptance-Criteria.md` (US-CNT-01, US-IA-01)
  - `docs/Content-Guide-UX-Copywriting.md` (5.2–5.3)
- **Статус**: внедрено.

### 1.7 Серии/программы (7 дней) как удержание, доставка через Telegram
- **Где зафиксировано**:
  - `docs/PRD.md` (`FR-TG-3`, `FR-TG-5`)
  - `docs/research/04-Interactive-Modules.md` (челленджи 7.*)
  - `docs/User-Stories-JTBD-Acceptance-Criteria.md` (EPIC H)
  - `docs/Content-Guide-UX-Copywriting.md` (термин “План”, CTA Telegram, шаблоны уведомлений)
- **Статус**: внедрено (в фокусе Telegram; email‑серии — опционально).

---

## 2) “Уникальные активности” из исследования 13 → статус внедрения

### P0 (рекомендуемые для быстрого безопасного старта)
- **Навигатор состояния (ветвящийся сценарий)**  
  - **Где**: `docs/PRD.md` (`FR-INT-6`), `docs/research/04-Interactive-Modules.md` (3.6), `docs/User-Stories-JTBD-Acceptance-Criteria.md` (US-INT-05), `docs/user-flows-cjm.md` (флоу 1a), `docs/Tracking-Plan.md` (events).
  - **Статус**: внедрено.

- **«Термометр ресурса»**  
  - **Где**: `docs/PRD.md` (`FR-INT-6`), `docs/research/04-Interactive-Modules.md` (3.7), `docs/User-Stories-JTBD-Acceptance-Criteria.md` (US-INT-06), `docs/user-flows-cjm.md` (флоу 1b), `docs/Tracking-Plan.md`.
  - **Статус**: внедрено.

- **Генератор “скриптов границ”**  
  - **Где**: `docs/PRD.md` (`FR-INT-6/7`), `docs/research/04-Interactive-Modules.md` (3.8), `docs/User-Stories-JTBD-Acceptance-Criteria.md` (US-INT-07), `docs/user-flows-cjm.md` (флоу 1c), `docs/Tracking-Plan.md`.
  - **Статус**: внедрено.

- **«Подготовка к первой консультации» (конструктор запроса)**  
  - **Где**: `docs/PRD.md` (`FR-INT-6/7`), `docs/research/04-Interactive-Modules.md` (3.9), `docs/User-Stories-JTBD-Acceptance-Criteria.md` (US-INT-08), `docs/user-flows-cjm.md` (флоу 1d), `docs/Tracking-Plan.md`.
  - **Статус**: внедрено.

### P1 (полезно, но не обязательно для релиза 1)
Эти пункты **присутствуют в исследовании 13**, но **не были явно вынесены в PRD как roadmap/backlog** (риск “потерять” при разработке).

- **«Письмо себе через 7 дней» (тайм‑капсула)** — P1  
- **«Карта поддержки близкому»** — P1  
- **«Кризисная карточка» (план безопасности/поддержки)** — P1  
- **«Тихая геймификация без стриков»** — P1  

**Статус**: требуется явная фиксация в PRD (следующий релиз) и спецификация в `docs/research/04-Interactive-Modules.md`.

---

## 3) Что в исследовании 13 намеренно out-of-scope (или требует отдельного решения)

### 3.1 “Маркетплейсные” механики
Из примеров (Yasno/YouTalk/и т.п.): каталог психологов, фильтры по подходам, “подбор специалиста сервисом”.  
- **Причина**: продукт — сайт одного психолога (не маркетплейс).
- **Статус**: out-of-scope.

### 3.2 Retention‑механики “как у маркетплейсов”
Подарочные сертификаты, пакеты/абонементы, акции/скидки, “подвешенные сессии”.  
- **Где уже частично есть**: `docs/Vision-Product-brief.md` и `docs/research/05-Booking-Payment-ClientCabinet.md` (пакеты/сертификат как опции).
- **Рекомендация**: зафиксировать как опциональный backlog в `docs/PRD.md` (чтобы было понятно: это осознанно “позже”, а не “забыли”).

---

## 4) Следующие правки (чтобы “максимально внедрено” было честно)

1) В `docs/PRD.md` добавить явный backlog/roadmap по P1‑идеям из исследования 13 (и retention‑механикам, если они нужны).  
2) В `docs/research/04-Interactive-Modules.md` добавить P1‑модули (цель/формат/безопасность/данные).  
3) В `docs/README.md` заменить “чек‑лист внедрения” на ссылку на этот документ + отметку статуса (что уже сделано).  

