"""
Создаёт структуру медиа-библиотеки для контента (Фаза 0).

Каталоги: images, audio, pdf.
См. docs/Media-Library-Guide.md, docs/Content-Filling-Plan.md.
"""
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Создать каталоги медиа-библиотеки (images, audio, pdf)."

    def handle(self, *args, **options):
        root = Path(settings.MEDIA_ROOT)
        subdirs = ("images", "audio", "pdf")
        for name in subdirs:
            d = root / name
            d.mkdir(parents=True, exist_ok=True)
            self.stdout.write(self.style.SUCCESS(f"  {d}"))
        self.stdout.write(self.style.SUCCESS(f"Медиа-каталоги созданы в {root}"))
