# Техническая спецификация: доработка EPIC-02 (Content & SEO)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** draft  

**Epic:** `EPIC-02`  
**Приоритет:** P0  
**Трекер:** TBD  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Закрываем несоответствия EPIC‑02, связанные с SEO‑полями CMS и корректной перелинковкой контента:
- используем `seo_title/seo_description/seo_keywords/canonical_url` для статей/ресурсов/служебных страниц;
- исправляем ссылки на контент в лендингах тем и подборках;
- добавляем отображение связанных услуг на лендинге темы.

### 1.2 Почему сейчас
- **Сигнал/боль:** контент из CMS публикуется, но SEO‑поля не попадают в мета‑теги и канонические URL; перелинковка в публичных страницах некорректна.
- **Ожидаемый эффект:** корректная индексация и снижение SEO‑рисков дубликатов, улучшение навигации и конверсии.
- **Если не сделать:** просадка SEO, неверные маршруты, потеря трафика и конверсий.

### 1.3 Ссылки на первоисточники
- `docs/generated/tech-specs/FEAT-CNT-01.md`
- `docs/generated/tech-specs/FEAT-CNT-02.md`
- `docs/generated/tech-specs/FEAT-CNT-04.md`
- `docs/Tracking-Plan.md`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** SEO‑поля из CMS используются в `Metadata` для страниц контента (article/resource/page).
- **G2:** Канонический URL (`canonical_url`) выставляется там, где он задан.
- **G3:** Лендинг темы показывает связанные услуги (если есть) и корректно ссылается на материалы.
- **G4:** Подборки корректно строят ссылки на разные типы контента.

### 2.2 Non-goals
- **NG1:** Переписывание контента, копирайта или структуры CMS.
- **NG2:** Новые типы контента или изменения API контрактов.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope
- **US-1:** Пользователь открывает статью/ресурс/служебную страницу, и в `<head>` отображаются SEO‑поля из CMS с корректными fallback‑ами.
- **US-2:** Пользователь открывает лендинг темы и видит блок “услуги по теме” (если в API есть связанные услуги).
- **US-3:** Пользователь открывает подборку, и каждый элемент ведёт на корректный маршрут в зависимости от `contentType`.

### 3.2 Out-of-scope
- Добавление новых разделов сайта.
- Миграции данных или изменение схем БД.

### 3.3 Acceptance criteria
- [ ] Для `article` и `resource` в `generateMetadata` используются `seo_title/seo_description/seo_keywords`, при отсутствии — fallback к `title/excerpt`.
- [ ] Для `page` (включая `/about`, `/how-it-works`, `/legal/*`) используются SEO‑поля из CMS и `canonical_url` при наличии.
- [ ] `canonical_url` прокидывается в metadata через `alternates.canonical`, если он задан.
- [ ] На лендинге темы отображается блок связанных услуг (если `relatedServices.length > 0`).
- [ ] Ссылки на контент в лендинге темы и подборках строятся через единый маппинг `contentType → route`.

### 3.4 Негативные сценарии
- **NS-1:** SEO‑поля отсутствуют → используются безопасные fallback‑значения.
- **NS-2:** Контент‑тип неизвестен → ссылка ведёт в общий fallback `/` или скрывается (решение фиксируется).

---

## 4) Архитектура и ответственность слоёв

### 4.1 Компоненты/модули
- **Presentation (web):**
  - `apps/web/src/app/blog/[slug]/page.tsx`
  - `apps/web/src/app/resources/[slug]/page.tsx`
  - `apps/web/src/app/about/page.tsx`, `apps/web/src/app/how-it-works/page.tsx`
  - `apps/web/src/app/legal/[slug]/page.tsx`
  - `apps/web/src/app/s-chem-ya-pomogayu/[slug]/TopicLandingClient.tsx`
  - `apps/web/src/app/curated/[slug]/page.tsx`
- **Shared helper:** новый утилитарный маппинг `contentType → route` в `apps/web/src/lib/content-links.ts` (или рядом с `ContentPlatform`).

### 4.2 Предлагаемое решение (high-level)
- Добавить helper `resolveContentUrl(contentType, slug)` и использовать его в теме/подборках.
- В `generateMetadata` использовать SEO‑поля из CMS и canonical.
- Добавить блок “услуги по теме” в `TopicLandingClient` на основе `relatedServices`.

---

## 5) UX / UI

### 5.1 Лендинг темы
- Если есть `relatedServices`, показываем карточки услуг с CTA на `/services/{slug}` или `/booking` (решение фиксируем).
- Блок располагается ниже “полезных материалов” или рядом с CTA‑зоной.

### 5.2 Подборки
- Для контент‑элементов выводим корректный ярлык типа и ведём на соответствующий маршрут.

---

## 6) Tracking / Analytics
- Сохраняем текущий `page_view` и `cta_click` без новых событий.
- При добавлении CTA на услуги — использовать `cta_click` с `cta_target=service/booking`.

---

## 7) Test plan

### 7.1 Unit tests
- Маппинг `contentType → route`.
- Метаданные формируются корректно при наличии и отсутствии SEO‑полей.

### 7.2 E2E
- `/blog/{slug}` и `/resources/{slug}` публикуют SEO‑поля и canonical.
- `/s-chem-ya-pomogayu/{topic}` показывает услуги при наличии.
- `/curated/{slug}` ведёт на корректные маршруты (article/resource/landing).

---

## 8) Open questions
- Какой маршрут использовать для `contentType=page` в подборках: `/{slug}` или специализированные `/legal/*`?
- Нужно ли добавлять отдельный CTA “Записаться” в блоке услуг на лендинге темы?

