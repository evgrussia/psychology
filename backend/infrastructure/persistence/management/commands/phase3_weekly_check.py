"""
Фаза 3: недельный чеклист и проверка контента на соответствие правилам.

Выводит целевой ритм (1 большая статья, 2–3 микро, 1 ресурс, 1 интерактив в 1–2 недели)
и опционально проверяет последние опубликованные материалы на перелинковку (2–5 ссылок)
и наличие CTA. Контент не создаётся — только напоминание и аудит.
См. docs/Content-Filling-Plan.md (Фаза 3), docs/content-templates/Phase3-Editorial-Runbook.md.
"""
import re
from django.core.management.base import BaseCommand

from infrastructure.persistence.django_models.content import ContentItemModel


# Внутренние ссылки: /blog/..., /resources/..., /topics/...
INTERNAL_LINK_PATTERN = re.compile(
    r"\]\s*\(\s*/(?:blog|resources|topics)/[^)]+\)",
    re.IGNORECASE,
)
# Эвристика CTA: запись, встреча, Telegram
CTA_HINTS = ("запис", "встреч", "telegram", "консультац", "напоминание")


def count_internal_links(text: str) -> int:
    """Считает количество внутренних ссылок в Markdown-тексте."""
    if not text:
        return 0
    return len(INTERNAL_LINK_PATTERN.findall(text))


def has_cta_hint(text: str) -> bool:
    """Проверяет наличие подсказок CTA в тексте (эвристика)."""
    if not text:
        return False
    lower = text.lower()
    return any(h in lower for h in CTA_HINTS)


class Command(BaseCommand):
    help = (
        "Фаза 3: выводит недельный чеклист; с --check проверяет последние публикации "
        "на перелинковку (2–5) и CTA."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--check",
            action="store_true",
            help="Проверить последние опубликованные материалы на перелинковку и CTA.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=10,
            help="При --check: сколько последних записей проверять (по умолчанию 10).",
        )

    def handle(self, *args, **options):
        self._print_weekly_checklist()
        if options["check"]:
            self._check_recent_content(options["limit"])

    def _print_weekly_checklist(self):
        self.stdout.write("")
        self.stdout.write(self.style.HTTP_INFO("=== Фаза 3: недельный ритм ==="))
        self.stdout.write("")
        self.stdout.write("Целевые объёмы на неделю:")
        self.stdout.write("  • 1 большая статья (pillar / supporting, 12–18 мин)")
        self.stdout.write("  • 2–3 микро-заметки (тег micro)")
        self.stdout.write("  • 1 ресурс (exercise / audio / tool / video)")
        self.stdout.write("  • 1 интерактив раз в 1–2 недели (квиз / навигатор / ритуал)")
        self.stdout.write("")
        self.stdout.write("Правила перед публикацией:")
        self.stdout.write("  • Перелинковка: 2–5 внутренних ссылок в теле контента")
        self.stdout.write("  • CTA: запись и/или Telegram с понятным «зачем»")
        self.stdout.write("  • Чеклист: docs/Content-Filling-Plan.md, раздел 5")
        self.stdout.write("  • Ранбук: docs/content-templates/Phase3-Editorial-Runbook.md")
        self.stdout.write("")

    def _check_recent_content(self, limit: int):
        self.stdout.write(self.style.HTTP_INFO("=== Проверка последних публикаций ==="))
        self.stdout.write("")

        qs = (
            ContentItemModel.objects.filter(status="published")
            .order_by("-published_at")
            [:limit]
        )
        if not qs.exists():
            self.stdout.write(self.style.WARNING("Нет опубликованных записей для проверки."))
            return

        issues = []
        for obj in qs:
            links = count_internal_links(obj.content_body or "")
            cta = has_cta_hint(obj.content_body or "")
            type_label = obj.get_content_type_display() if hasattr(obj, "get_content_type_display") else obj.content_type
            slug_display = obj.slug[:40] + "…" if len(obj.slug) > 40 else obj.slug

            line_parts = [f"  {slug_display} ({type_label})"]
            if links < 2:
                issues.append((obj.slug, "мало ссылок", f"найдено {links}, нужно 2–5"))
                line_parts.append(self.style.WARNING(f" ссылок: {links} (нужно 2–5)"))
            else:
                line_parts.append(self.style.SUCCESS(f" ссылок: {links}"))
            if not cta:
                issues.append((obj.slug, "нет CTA", "добавьте запись/Telegram"))
                line_parts.append(self.style.WARNING(" CTA не обнаружен"))
            else:
                line_parts.append(self.style.SUCCESS(" CTA есть"))
            self.stdout.write("".join(line_parts))

        self.stdout.write("")
        if issues:
            self.stdout.write(self.style.WARNING(f"Замечаний: {len(issues)}"))
            for slug, kind, detail in issues[:15]:
                self.stdout.write(f"  • {slug}: {kind} — {detail}")
        else:
            self.stdout.write(self.style.SUCCESS("Замечаний нет."))
        self.stdout.write("")
