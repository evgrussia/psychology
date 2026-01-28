"""
Django Admin: контент, скрипты границ, определения интерактивов.

Фаза 0/2 наполнения контентом — регистрация моделей, точечная доработка для редакторов.
См. docs/Content-Filling-Plan.md.
"""
from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.utils.html import format_html

from .django_models.content import ContentItemModel, BoundaryScriptModel
from .django_models.interactive import InteractiveDefinitionModel


TOPICS_HELP = "Коды тем: anxiety, burnout, relationships, self-esteem, boundaries, stress. JSON-массив, напр. [\"anxiety\", \"stress\"]."
TAGS_HELP = "Теги для фильтрации, напр. micro, pillar, supporting. JSON-массив."

CHECKLIST_ITEMS = [
    ("Дисклеймер", "Для квизов/упражнений — по шаблонам (docs/content-templates/Phase0-Text-Templates.md, разд. 1)."),
    ("Тон", "Не директивный; нет «диагноз», «лечим», «обязаны»."),
    ("Первый шаг", "Есть упражнение, ресурс или микро-действие."),
    ("CTA", "Telegram и/или запись с понятной подписью «зачем» (разд. 3 Phase0-Text-Templates)."),
    ("Перелинковка", "2–5 ссылок на другие материалы/темы в теле контента."),
    ("Интерактивы", "Для квизов/чувствительных тем — проверен кризисный блок и экстренные контакты."),
]


class MicroTagFilter(SimpleListFilter):
    title = "микро-заметка"
    parameter_name = "micro"

    def lookups(self, request, model_admin):
        return (("yes", "Да (тег micro)"), ("no", "Нет"))

    def queryset(self, request, queryset):
        if self.value() == "yes":
            return queryset.filter(tags__contains=["micro"])
        if self.value() == "no":
            return queryset.exclude(tags__contains=["micro"])
        return queryset


@admin.register(ContentItemModel)
class ContentItemModelAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "slug",
        "content_type",
        "status",
        "category",
        "tags_preview",
        "published_at",
        "topics_preview",
    )
    list_filter = ("content_type", "status", "category", MicroTagFilter)
    search_fields = ("title", "slug", "excerpt")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("id", "created_at", "updated_at", "checklist_before_publish")
    fieldsets = (
        (None, {"fields": ("id", "slug", "title", "content_type", "status")}),
        ("Классификация", {"fields": ("topics", "tags", "category", "time_to_benefit")}),
        ("Контент", {"fields": ("excerpt", "content_body", "published_at")}),
        ("Перед публикацией", {"fields": ("checklist_before_publish",), "description": "Отметьте пункты перед сохранением и публикацией."}),
        ("Системные", {"fields": ("created_at", "updated_at")}),
    )
    ordering = ("-updated_at",)

    @admin.display(description="Темы")
    def topics_preview(self, obj):
        if not obj.topics:
            return "—"
        return ", ".join(str(t) for t in (obj.topics or [])[:3])

    @admin.display(description="Теги")
    def tags_preview(self, obj):
        if not obj.tags:
            return "—"
        return ", ".join(str(t) for t in (obj.tags or [])[:5])

    @admin.display(description="Чеклист перед публикацией")
    def checklist_before_publish(self, obj):
        lines = [
            "<p><strong>Проверьте перед публикацией:</strong></p>",
            "<ol>",
        ]
        for title, detail in CHECKLIST_ITEMS:
            lines.append(f"<li><strong>{title}</strong> — {detail}</li>")
        lines.append("</ol>")
        lines.append(
            "<p>Подробнее: <code>docs/Content-Filling-Plan.md</code>, раздел 5; "
            "<code>docs/content-templates/Phase0-Text-Templates.md</code>.</p>"
        )
        return format_html("".join(lines))

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == "topics":
            kwargs["help_text"] = TOPICS_HELP
        elif db_field.name == "tags":
            kwargs["help_text"] = TAGS_HELP
        return super().formfield_for_dbfield(db_field, request, **kwargs)


@admin.register(BoundaryScriptModel)
class BoundaryScriptModelAdmin(admin.ModelAdmin):
    list_display = ('scenario', 'style', 'goal', 'status', 'script_preview', 'display_order')
    list_filter = ('scenario', 'style', 'goal', 'status')
    search_fields = ('script_text',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('id', 'scenario', 'style', 'goal', 'status', 'display_order')}),
        ('Текст скрипта', {'fields': ('script_text',)}),
        ('Системные', {'fields': ('created_at', 'updated_at')}),
    )
    ordering = ('scenario', 'style', 'goal', 'display_order')

    @admin.display(description='Скрипт')
    def script_preview(self, obj):
        text = (obj.script_text or '')[:60]
        return f'{text}…' if len(obj.script_text or '') > 60 else text


@admin.register(InteractiveDefinitionModel)
class InteractiveDefinitionModelAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'interactive_type', 'topic_code', 'status', 'published_at')
    list_filter = ('interactive_type', 'status', 'topic_code')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('id',)
    fieldsets = (
        (None, {'fields': ('id', 'slug', 'title', 'interactive_type', 'topic_code', 'status')}),
        ('Публикация', {'fields': ('published_at',)}),
    )
    ordering = ('-published_at',)
