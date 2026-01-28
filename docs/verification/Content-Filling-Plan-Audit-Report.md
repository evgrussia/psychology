# Аудит выполнения плана наполнения контентом

**Спецификация:** `docs/Content-Filling-Plan.md`  
**Дата аудита:** 2026-01-28  
**Метод:** Verification Engine (spec compliance, артефакты, рекомендации).

---

## 1. Резюме

| Категория | Статус | Готовность |
|-----------|--------|-------------|
| Фаза 0 — Подготовка | ✅ Выполнено | 100% |
| Фаза 1 — Seed и артефакты | ✅ Выполнено | 100% |
| Фаза 2 — Seed и Admin | ✅ Выполнено | 100% |
| Фаза 3 — Ранбук и команда проверки | ✅ Выполнено | 100% |
| Документация и шаблоны | ✅ Выполнено | 100% |
| Рекомендации (topics, ограничения) | ⚠️ Частично / принято как есть | см. раздел 5 |

**Общая оценка соответствия плану: 98%.** Расхождений по обязательным пунктам нет; оставшиеся 2% — учётные рекомендации (модель Topic, definition_json для квизов), которые план допускает как опциональные или отложенные.

---

## 2. Фаза 0 — Подготовка

### 2.1 Регистрация в Django Admin

| Требование | Статус | Доказательство |
|------------|--------|----------------|
| ContentItemModel зарегистрирован | ✅ | `backend/infrastructure/persistence/admin.py`: `@admin.register(ContentItemModel)`, `ContentItemModelAdmin` |
| BoundaryScriptModel зарегистрирован | ✅ | Там же: `@admin.register(BoundaryScriptModel)`, `BoundaryScriptModelAdmin` |
| InteractiveDefinitionModel зарегистрирован | ✅ | Там же: `@admin.register(InteractiveDefinitionModel)`, `InteractiveDefinitionModelAdmin` |

### 2.2 Поля excerpt, category в ContentItemModel

| Требование | Статус | Доказательство |
|------------|--------|----------------|
| Миграция excerpt, category | ✅ | `backend/infrastructure/persistence/migrations/0006_contentitem_excerpt_category.py` |
| Поля в Django-модели | ✅ | `backend/infrastructure/persistence/django_models/content.py`: `excerpt`, `category` |
| Домен ContentItem | ✅ | `backend/domain/content/aggregates/content_item.py`: `excerpt`, `category` в конструкторе и свойствах |
| Маппер to_domain / to_persistence | ✅ | `backend/infrastructure/persistence/mappers/content_mapper.py`: чтение/запись excerpt, category |
| Use cases (get_article, list_articles) | ✅ | `get_article.py`: ArticleResponseDto с excerpt, category; `list_articles.py`: excerpt, category в списке |

### 2.3 Медиа-библиотека

| Требование | Статус | Доказательство |
|------------|--------|----------------|
| Команда setup_media | ✅ | `backend/infrastructure/persistence/management/commands/setup_media.py`: создаёт images, audio, pdf под MEDIA_ROOT |
| Документация | ✅ | `docs/Media-Library-Guide.md`: структура, команда, настройки, использование |

### 2.4 Шаблоны текстов (дисклеймеры, CTA, «когда к специалисту»)

| Требование | Статус | Доказательство |
|------------|--------|----------------|
| Документ шаблонов | ✅ | `docs/content-templates/Phase0-Text-Templates.md`: разделы 1 (дисклеймеры), 2 (когда к специалисту), 3 (CTA) |

**Артефакты Фазы 0 по плану:** все присутствуют: `admin.py`, миграция `0006_contentitem_excerpt_category`, `python manage.py setup_media`, `docs/Media-Library-Guide.md`, `docs/content-templates/Phase0-Text-Templates.md`.

---

## 3. Фаза 1 — Минимальный жизнеспособный контент

### 3.1 Команда seed_phase1_content

| Требование | Статус | Доказательство |
|------------|--------|----------------|
| Команда существует | ✅ | `backend/infrastructure/persistence/management/commands/seed_phase1_content.py` |
| Сначала migrate | ✅ | `call_command("migrate", "--noinput", verbosity=1)` при не dry_run |
| Идемпотентность (update_or_create по slug) | ✅ | Статьи/ресурсы: `ContentItemModel.objects.update_or_create(slug=slug, ...)`; интерактивы: `InteractiveDefinitionModel.objects.update_or_create(slug=slug, ...)`; скрипты: get_or_create + save при обновлении |
| Опция --dry-run без записи в БД | ✅ | `add_arguments`: `--dry-run`; в handle при dry_run только вывод, без migrate и без сохранения |

### 3.2 Содержимое seed Фазы 1 (по плану)

| Тип | План | Реализация |
|-----|------|------------|
| Статьи (pillar + supporting) | 6–7 по темам (тревога, выгорание, отношения, границы, самооценка) | 7 статей: trevoga-kak-ponyat, trevoga-utrom-3-shaga, vygoranie-priznaki-prichiny, symptomy-vygorania-ignoriruyut, otnosheniya-konflikty-blizost, kak-govorit-net-bez-viny, samoocenka-samokritika ✅ |
| Ресурсы | 4–6 (дыхание, заземление, чек-листы, дневник ABC) | 5 ресурсов: dyhanie-4-6, zazemlenie-5-4-3-2-1, chek-list-den-bez-peregruza, chek-list-granic, dnevnik-abc ✅ |
| Интерактивы | 1 квиз по тревоге, 1 по стрессу, стили границ, ритуалы, навигатор | 7 записей: trevoga-orientir, stress-napryazhenie, granicy-stili, ritual-utro, ritual-vecher, boundaries-script, navigator-kuda ✅ |
| Скрипты границ | 8–16 комбинаций scenario×style×goal | 10 скриптов (work/partner/family/friends × soft/brief/firm × refuse/ask/set_rule/pause) ✅ |

В теле статей и ресурсов добавлены блоки «Когда стоит обратиться к специалисту», CTA и перелинковка «См. также» (2–5 ссылок по теме) — соответствует плану и разделу 5.

---

## 4. Фаза 2 — Расширение и SEO

### 4.1 Команда seed_phase2_content

| Требование | Статус | Доказательство |
|------------|--------|----------------|
| Команда существует | ✅ | `backend/infrastructure/persistence/management/commands/seed_phase2_content.py` |
| migrate при не dry_run | ✅ | `call_command("migrate", "--noinput", verbosity=1)` в else от dry_run |
| Идемпотентность | ✅ | `update_or_create(slug=slug, ...)` для статей и ресурсов |
| --dry-run | ✅ | Реализован, без записи в БД |
| 6 supporting-статей, 3 микро (тег micro), 3 ресурса | ✅ | Списки supporting, micro (3 шт.), resources (3 шт.); микро с тегом `micro` |

### 4.2 Точечная доработка Admin (Фаза 2)

| Требование | Статус | Доказательство |
|------------|--------|----------------|
| Колонка «Теги» (tags_preview) | ✅ | `ContentItemModelAdmin.list_display`: `tags_preview`; метод `tags_preview` |
| Фильтр «микро-заметка» (тег micro) | ✅ | `MicroTagFilter`, `list_filter`: включает `MicroTagFilter` |
| help_text для topics и tags | ✅ | `formfield_for_dbfield`: TOPICS_HELP, TAGS_HELP |
| Блок «Перед публикацией» с чеклистом (раздел 5 плана) | ✅ | `readonly_fields`: `checklist_before_publish`; fieldset «Перед публикацией»; метод `checklist_before_publish` со ссылками на Phase0-Text-Templates и Content-Filling-Plan, раздел 5 |

---

## 5. Фаза 3 — Поддержка и рост

| Требование | Статус | Доказательство |
|------------|--------|----------------|
| Редакционный ранбук | ✅ | `docs/content-templates/Phase3-Editorial-Runbook.md`: ритм, перелинковка, CTA, проверка |
| Команда phase3_weekly_check | ✅ | `backend/infrastructure/persistence/management/commands/phase3_weekly_check.py` |
| Вывод недельного чеклиста | ✅ | `_print_weekly_checklist`: объёмы на неделю, правила перед публикацией |
| Опция --check: проверка последних публикаций на перелинковку (2–5) и CTA | ✅ | `add_arguments`: `--check`, `--limit`; `_check_recent_content`: подсчёт внутренних ссылок, эвристика CTA, вывод замечаний |

Контент командой не создаётся — только ритм и аудит, как в плане.

---

## 6. Рекомендации и ограничения из плана

### 6.1 Темы (topics)

- **План:** темы захардкожены в API (TopicsViewSet); в контенте — коды в поле `topics`; рекомендация: либо оставить статичный список, либо ввести модель Topic.
- **Факт:** статичный список оставлен; в админке и в seed используются коды anxiety, burnout, relationships, self-esteem, boundaries, stress. Модель Topic не вводилась — **соответствует варианту «оставить статичный список».**

### 6.2 Ограничения ContentItemModel

- **План:** для полноценного блога стоит добавить excerpt и category; при отсутствии — getattr с пустой строкой в API.
- **Факт:** excerpt и category добавлены в модель, маппер, домен и use cases; в API возвращаются реальные значения. **Рекомендация выполнена.**

### 6.3 Контент квизов (вопросы/ответы)

- **План:** вопросы/ответы квизов в БД не хранятся; контент либо на фронте по slug, либо в модели (например definition_json).
- **Факт:** в InteractiveDefinitionModel нет definition_json; контент квизов по slug на фронте — **соответствует варианту «на фронте по slug», модель не расширялась.**

---

## 7. Чеклист перед публикацией (раздел 5 плана)

В админке реализован блок «Перед публикацией» с 6 пунктами из раздела 5:

1. Дисклеймер (шаблоны Phase0-Text-Templates, разд. 1)  
2. Тон (не директивный, без «диагноз»/«лечим»/«обязаны»)  
3. Первый шаг (упражнение/ресурс/микро-действие)  
4. CTA (Telegram и/или запись, разд. 3 Phase0)  
5. Перелинковка (2–5 ссылок)  
6. Интерактивы (кризисный блок и экстренные контакты для чувствительных тем)

Ссылки на `docs/content-templates/Phase0-Text-Templates.md` и `docs/Content-Filling-Plan.md` (раздел 5) присутствуют в `checklist_before_publish`.

---

## 8. Итоговая таблица артефактов

| Артефакт по плану | Путь | Наличие |
|-------------------|------|---------|
| Admin: ContentItemModel, BoundaryScriptModel, InteractiveDefinitionModel | backend/infrastructure/persistence/admin.py | ✅ |
| Миграция excerpt, category | backend/.../migrations/0006_contentitem_excerpt_category.py | ✅ |
| setup_media | backend/.../management/commands/setup_media.py | ✅ |
| Media-Library-Guide | docs/Media-Library-Guide.md | ✅ |
| Phase0-Text-Templates | docs/content-templates/Phase0-Text-Templates.md | ✅ |
| seed_phase1_content | backend/.../management/commands/seed_phase1_content.py | ✅ |
| seed_phase2_content | backend/.../management/commands/seed_phase2_content.py | ✅ |
| Phase3-Editorial-Runbook | docs/content-templates/Phase3-Editorial-Runbook.md | ✅ |
| phase3_weekly_check | backend/.../management/commands/phase3_weekly_check.py | ✅ |

---

## 9. Вывод и действия

- **Соответствие плану:** все обязательные пункты Фаз 0–3 и перечисленные артефакты реализованы. Рекомендации по excerpt/category выполнены; по topics и контенту квизов выбран допустимый вариант без расширения моделей.
- **Действия не требуются** для достижения 100% по текущей спецификации. При желании усилить контент-процесс можно:
  - ввести модель Topic и вынести темы в админку;
  - добавить в InteractiveDefinitionModel поле definition_json для хранения вопросов/ответов квизов и кризисных триггеров.

---
*Отчёт создан: Orchestrator Agent (аудит по Verification Engine)*
