"""
Seed Фазы 2: расширение и SEO.

Добавляет supporting-статьи, микро-заметки (тег micro), ресурсы.
Идемпотентно: повторный запуск обновляет существующие по slug.
См. docs/Content-Filling-Plan.md, docs/content-templates/Phase0-Text-Templates.md.
"""
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone as dtz

from infrastructure.persistence.django_models.content import ContentItemModel


WHEN_SPECIALIST = (
    "**Когда стоит обратиться к специалисту**\n\n"
    "Если переживания мешают жить, повторяются часто или вы чувствуете, что не справляетесь — "
    "имеет смысл обсудить это на встрече. Можно начать с одной консультации, "
    "чтобы прояснить запрос и понять, подходит ли вам формат."
)
CTA_END = (
    "Если хочется продолжения — можно сохранить это в Telegram и получить напоминание. "
    "Если хотите обсудить вашу ситуацию индивидуально — можно записаться на встречу."
)
DISCLAIMER_RESOURCE = (
    "Если упражнение вызывает усиление тревоги или дискомфорта — остановитесь, "
    "сделайте паузу и выберите более мягкий вариант. "
    "Если симптомы выраженные или повторяются — лучше обсудить это со специалистом."
)


# (slug, "article"|"resource", label) — Фаза 1 + Фаза 2 для перелинковки
LINK_MAP_PHASE2 = {
    "anxiety": [
        ("trevoga-kak-ponyat", "article", "Тревога: как понять и что делать"),
        ("trevoga-utrom-3-shaga", "article", "Тревога утром: 3 мягких шага"),
        ("navyazchivye-mysli-snizit-intensivnost", "article", "Навязчивые мысли: как снизить интенсивность"),
        ("panicheskaya-ataka-chto-delat", "article", "Паническая атака: что делать в моменте"),
        ("dyhanie-4-6", "resource", "Дыхание 4–6"),
        ("zazemlenie-5-4-3-2-1", "resource", "Заземление 5-4-3-2-1"),
        ("konteyner-trevozhnyh-mysley", "resource", "Контейнер для тревожных мыслей"),
    ],
    "burnout": [
        ("vygoranie-priznaki-prichiny", "article", "Выгорание: признаки, причины, восстановление"),
        ("symptomy-vygorania-ignoriruyut", "article", "Симптомы выгорания, которые часто игнорируют"),
        ("ustalost-ili-vygoranie-kak-razlichat", "article", "Усталость или выгорание: как различать"),
        ("chek-list-den-bez-peregruza", "resource", "Чек-лист «День без перегруза»"),
        ("micro-vecher-granitsa", "article", "Вечер: граница между днём и отдыхом"),
    ],
    "relationships": [
        ("otnosheniya-konflikty-blizost", "article", "Отношения: конфликты, близость, границы"),
        ("konflikt-kak-sporit-ne-razrushaya-kontakt", "article", "Конфликт: как спорить, не разрушая контакт"),
        ("sozavisimost-priznaki-i-pervye-shagi", "article", "Созависимость: признаки и первые шаги"),
        ("revnost-chto-za-ney-i-kak-byt", "article", "Ревность: что за ней стоит и как с ней быть"),
        ("kak-govorit-net-bez-viny", "article", "Как говорить «нет» без чувства вины"),
        ("chek-list-granic", "resource", "Чек-лист границ"),
    ],
    "boundaries": [
        ("kak-govorit-net-bez-viny", "article", "Как говорить «нет» без чувства вины"),
        ("otnosheniya-konflikty-blizost", "article", "Отношения: конфликты, близость, границы"),
        ("sozavisimost-priznaki-i-pervye-shagi", "article", "Созависимость: признаки и первые шаги"),
        ("chek-list-granic", "resource", "Чек-лист границ"),
        ("shablon-razgovor-o-granicah", "resource", "Шаблон «Разговор о границах»"),
        ("micro-net-bez-viny", "article", "«Нет» без чувства вины"),
    ],
    "self-esteem": [
        ("samoocenka-samokritika", "article", "Самооценка и самокритика"),
        ("dnevnik-abc", "resource", "Дневник ABC (самокритика)"),
    ],
    "stress": [
        ("micro-utro-bez-speshki", "article", "Утро без спешки: один маленький шаг"),
        ("rastyazhka-rasslablenie-5-min", "resource", "Растяжка и расслабление за 5 минут"),
    ],
}


def _related_links(category: str, exclude_slug: str, link_map: dict, max_links: int = 5) -> str:
    items = link_map.get(category, [])
    chosen = [x for x in items if x[0] != exclude_slug][:max_links]
    if not chosen:
        return ""
    lines = ["**См. также:**", ""]
    for slug, kind, label in chosen:
        path = f"/blog/{slug}" if kind == "article" else f"/resources/{slug}"
        lines.append(f"- [{label}]({path})")
    lines.extend(["", ""])
    return "\n".join(lines)


def _article_body(intro: str, stub: str = "", related: str = "") -> str:
    body = f"{intro}\n\n"
    if stub:
        body += f"{stub}\n\n"
    if related:
        body += related
    body += f"{WHEN_SPECIALIST}\n\n{CTA_END}"
    return body


def _micro_body(observation: str, phrase: str, step: str, related: str = "") -> str:
    out = f"{observation}\n\n{phrase}\n\n**Микро-шаг:** {step}\n\n"
    if related:
        out += related
    out += CTA_END
    return out


def _resource_body(goal: str, steps: str) -> str:
    return (
        f"**Для чего:** {goal}\n\n**Как делать:**\n{steps}\n\n"
        f"*{DISCLAIMER_RESOURCE}*\n\n{CTA_END}"
    )


class Command(BaseCommand):
    help = "Наполнить БД контентом Фазы 2 (supporting, micro, ресурсы)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Только вывести, что будет создано/обновлено, без записи в БД.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — изменения в БД не вносятся."))
        else:
            call_command("migrate", "--noinput", verbosity=1)

        now = dtz.now()
        created = {"articles": 0, "micro": 0, "resources": 0}
        updated = {"articles": 0, "micro": 0, "resources": 0}

        # --- Supporting-статьи (Фаза 2) ---
        supporting = [
            (
                "navyazchivye-mysli-snizit-intensivnost",
                "Навязчивые мысли: почему появляются и как снизить интенсивность",
                "anxiety",
                "short_term",
                "Навязчивые мысли не значит «с вами что-то не так». "
                "Кратко о том, почему они возникают и что может помочь снизить накал.",
                "",
            ),
            (
                "panicheskaya-ataka-chto-delat",
                "Паническая атака: что делать в моменте (бережно)",
                "anxiety",
                "immediate",
                "В моменте паники важно не оценивать себя, а вернуть опору. "
                "Несколько простых шагов, которые можно попробовать прямо сейчас.",
                "",
            ),
            (
                "ustalost-ili-vygoranie-kak-razlichat",
                "Усталость или выгорание: как различать",
                "burnout",
                "short_term",
                "Усталость снимается отдыхом; выгорание — системнее. "
                "О признаках и о том, с чего начать, если похоже на выгорание.",
                "",
            ),
            (
                "konflikt-kak-sporit-ne-razrushaya-kontakt",
                "Конфликт: как спорить, не разрушая контакт",
                "relationships",
                "short_term",
                "Спор не обязан заканчиваться разрывом. "
                "О том, как формулировать позицию и слышать другого.",
                "",
            ),
            (
                "sozavisimost-priznaki-i-pervye-shagi",
                "Созависимость: признаки и первые шаги",
                "boundaries",
                "medium_term",
                "Созависимость — не приговор. Кратко о признаках и о том, "
                "как можно двигаться к более здоровым границам.",
                "",
            ),
            (
                "revnost-chto-za-ney-i-kak-byt",
                "Ревность: что за ней стоит и как с ней быть",
                "relationships",
                "short_term",
                "Ревность часто маскирует страх или неуверенность. "
                "О том, что может стоять за ней и какой первый шаг возможен.",
                "",
            ),
        ]
        for slug, title, category, ttb, excerpt, stub in supporting:
            related = _related_links(category, slug, LINK_MAP_PHASE2, max_links=5)
            body = _article_body(
                f"Если вам это знакомо — вы не один и не одна. {excerpt}",
                stub,
                related=related,
            )
            obj, was_created = _upsert_article(
                slug, title, category, ttb, excerpt, body, [], now, dry_run
            )
            if obj:
                key = "articles"
                (created if was_created else updated)[key] += 1

        # --- Микро-заметки (тег micro) ---
        micro = [
            (
                "micro-utro-bez-speshki",
                "Утро без спешки: один маленький шаг",
                "stress",
                "Очень многие «взрывают» утро чек-листами и тревогой.",
                "Это нормально — хотеть начать день спокойнее.",
                "Выберите один пункт: 2 минуты тишины, стакан воды у окна или три глубоких вдоха. Только он.",
            ),
            (
                "micro-vecher-granitsa",
                "Вечер: граница между днём и отдыхом",
                "burnout",
                "Переход «работа — отдых» часто размыт.",
                "Иметь границу — не эгоизм, а забота о себе.",
                "Выключите уведомления за 30 минут до сна. Один вечер — уже эксперимент.",
            ),
            (
                "micro-net-bez-viny",
                "«Нет» без чувства вины",
                "boundaries",
                "Отказывать трудно, когда кажется, что подведешь.",
                "«Нет» — это про ваши границы, а не про оценку другого.",
                "Один раз скажите «не в этот раз» в малой ситуации. Заметьте, что мир не рухнул.",
            ),
        ]
        for slug, title, category, observation, phrase, step in micro:
            related = _related_links(category, slug, LINK_MAP_PHASE2, max_links=3)
            body = _micro_body(observation, phrase, step, related=related)
            excerpt = f"{observation[:120]}…" if len(observation) > 120 else observation
            obj, was_created = _upsert_article(
                slug,
                title,
                category,
                "immediate",
                excerpt,
                body,
                ["micro"],
                now,
                dry_run,
            )
            if obj:
                key = "micro"
                (created if was_created else updated)[key] += 1

        # --- Ресурсы (Фаза 2) ---
        resources = [
            (
                "konteyner-trevozhnyh-mysley",
                "Контейнер для тревожных мыслей",
                "exercise",
                "anxiety",
                "immediate",
                "Записать 5 тревожных мыслей и одно маленькое действие на 24 часа.",
                "1. Возьмите лист или заметки. 2. Запишите 5 мыслей, которые крутятся. "
                "3. Выберите одну и сформулируйте одно действие на сегодня/завтра. 4. Отложите лист.",
            ),
            (
                "rastyazhka-rasslablenie-5-min",
                "Растяжка и расслабление тела за 5 минут",
                "exercise",
                "stress",
                "immediate",
                "Снять мышечное напряжение за несколько минут.",
                "1. Встаньте или сядьте удобно. 2. Плечи вверх — выдох, опустить. 3–4 раза. "
                "3. Мягкие наклоны головы в стороны. 4. 5 глубоких вдохов-выдохов.",
            ),
            (
                "shablon-razgovor-o-granicah",
                "Шаблон «Разговор о границах»",
                "tool",
                "boundaries",
                "short_term",
                "Подготовить разговор о границах без обвинений.",
                "1. Опишите ситуацию нейтрально («когда…»). 2. Опишите своё переживание («я чувствую…»). "
                "3. Сформулируйте просьбу («мне важно…»). 4. Предложите обсудить.",
            ),
        ]
        for slug, title, ctype, category, ttb, goal, steps in resources:
            body = _resource_body(goal, steps)
            obj, was_created = _upsert_resource(
                slug, title, ctype, category, ttb, body, now, dry_run
            )
            if obj:
                (created if was_created else updated)["resources"] += 1

        # --- Интерактивы: опционально второй квиз (если фронт поддерживает) ---
        # Оставляем как в Фазе 1; при необходимости добавить slug здесь.

        # --- итог ---
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Фаза 2 — seed завершён."))
        self.stdout.write(
            f"  Supporting-статьи: создано {created['articles']}, обновлено {updated['articles']}"
        )
        self.stdout.write(
            f"  Микро-заметки (micro): создано {created['micro']}, обновлено {updated['micro']}"
        )
        self.stdout.write(
            f"  Ресурсы: создано {created['resources']}, обновлено {updated['resources']}"
        )


def _upsert_article(
    slug: str,
    title: str,
    category: str,
    ttb: str,
    excerpt: str,
    body: str,
    tags: list,
    now,
    dry_run,
):
    if dry_run:
        return (True, True)
    obj, created = ContentItemModel.objects.update_or_create(
        slug=slug,
        defaults={
            "title": title,
            "content_type": "article",
            "status": "published",
            "topics": [category],
            "tags": tags,
            "category": category,
            "excerpt": excerpt,
            "time_to_benefit": ttb,
            "content_body": body,
            "published_at": now,
        },
    )
    return (obj, created)


def _upsert_resource(
    slug: str, title: str, ctype: str, category: str, ttb: str, body: str, now, dry_run
):
    if dry_run:
        return (True, True)
    obj, created = ContentItemModel.objects.update_or_create(
        slug=slug,
        defaults={
            "title": title,
            "content_type": ctype,
            "status": "published",
            "topics": [category],
            "tags": [],
            "category": category,
            "excerpt": "",
            "time_to_benefit": ttb,
            "content_body": body,
            "published_at": now,
        },
    )
    return (obj, created)
