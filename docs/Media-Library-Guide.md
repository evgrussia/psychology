# Медиа-библиотека для контента

**Фаза 0** наполнения (см. `docs/Content-Filling-Plan.md`): подготовка структуры под изображения, аудио, PDF.

## Структура каталогов

Под `MEDIA_ROOT` (в development: `backend/media/`):

```
media/
├── images/   # Иллюстрации статей, обложки, карточки тем
├── audio/    # Аудиопрактики (дыхание, заземление, медитации)
└── pdf/      # Чек-листы, гайды, экспорт дневников
```

## Создание каталогов

Перед массовым наполнением или деплоем выполните:

```bash
cd backend
python manage.py setup_media
```

Команда создаёт `images`, `audio`, `pdf` под `MEDIA_ROOT`. Идемпотентна.

## Настройки

- **MEDIA_ROOT**: `config.settings.base` → `BASE_DIR / 'media'` (dev); production — отдельно.
- **MEDIA_URL**: в dev раздаётся через `static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)` в `config/urls.py`.

## Использование в контенте

- В `ContentItemModel` пока нет полей `file_url` / `image_url`. Ссылки на медиа можно хранить в `content_body` (Markdown) или позже добавить отдельные поля.
- При загрузке файлов через админку (если появится) — сохранять в соответствующий подкаталог и сохранять относительный путь или URL в контенте.

## Связанные документы

- `docs/Content-Filling-Plan.md` — план наполнения, фазы 0–3
- `docs/research/03-Content-SEO-and-Editorial.md` — контент-стратегия, типы ресурсов
- `docs/Content-Guide-UX-Copywriting.md` — тон, дисклеймеры, CTA

---
*Документ создан: Orchestrator Agent (Фаза 0)*
