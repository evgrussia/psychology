"""
Seed Фазы 1: минимальный жизнеспособный контент.

Создаёт статьи (pillar + supporting), ресурсы, интерактивы (квизы, ритуалы, навигатор),
скрипты границ. Идемпотентно: повторный запуск обновляет существующие по slug.
См. docs/Content-Filling-Plan.md, docs/content-templates/Phase0-Text-Templates.md.
"""
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone as dtz

from infrastructure.persistence.django_models.content import ContentItemModel, BoundaryScriptModel
from infrastructure.persistence.django_models.interactive import InteractiveDefinitionModel


DISCLAIMER_RESOURCE = (
    "Если упражнение вызывает усиление тревоги или дискомфорта — остановитесь, "
    "сделайте паузу и выберите более мягкий вариант. "
    "Если симптомы выраженные или повторяются — лучше обсудить это со специалистом."
)
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

# (slug, "article"|"resource", label) для перелинковки по теме
LINK_MAP_PHASE1 = {
    "anxiety": [
        ("trevoga-kak-ponyat", "article", "Тревога: как понять и что делать"),
        ("trevoga-utrom-3-shaga", "article", "Тревога утром: 3 мягких шага"),
        ("dyhanie-4-6", "resource", "Дыхание 4–6 (2–3 минуты)"),
        ("zazemlenie-5-4-3-2-1", "resource", "Заземление 5-4-3-2-1"),
    ],
    "burnout": [
        ("vygoranie-priznaki-prichiny", "article", "Выгорание: признаки, причины, восстановление"),
        ("symptomy-vygorania-ignoriruyut", "article", "Симптомы выгорания, которые часто игнорируют"),
        ("chek-list-den-bez-peregruza", "resource", "Чек-лист «День без перегруза»"),
    ],
    "relationships": [
        ("otnosheniya-konflikty-blizost", "article", "Отношения: конфликты, близость, границы"),
        ("kak-govorit-net-bez-viny", "article", "Как говорить «нет» без чувства вины"),
        ("chek-list-granic", "resource", "Чек-лист границ"),
    ],
    "boundaries": [
        ("kak-govorit-net-bez-viny", "article", "Как говорить «нет» без чувства вины"),
        ("otnosheniya-konflikty-blizost", "article", "Отношения: конфликты, близость, границы"),
        ("chek-list-granic", "resource", "Чек-лист границ (работа, семья, партнёр)"),
    ],
    "self-esteem": [
        ("samoocenka-samokritika", "article", "Самооценка и самокритика"),
        ("dnevnik-abc", "resource", "Дневник ABC (самокритика)"),
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


def _resource_body(goal: str, steps: str) -> str:
    return f"**Для чего:** {goal}\n\n**Как делать:**\n{steps}\n\n*{DISCLAIMER_RESOURCE}*\n\n{CTA_END}"


class Command(BaseCommand):
    help = "Наполнить БД контентом Фазы 1 (статьи, ресурсы, интерактивы, скрипты границ)."

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
        created = {"articles": 0, "resources": 0, "interactives": 0, "scripts": 0}
        updated = {"articles": 0, "resources": 0, "interactives": 0, "scripts": 0}

        # --- InteractiveDefinitionModel ---
        interactives = [
            ("trevoga-orientir", "Тревожность: ориентир (не диагноз)", "quiz", "anxiety"),
            ("stress-napryazhenie", "Стресс и напряжение", "quiz", "stress"),
            ("granicy-stili", "Стили границ", "quiz", "boundaries"),
            ("ritual-utro", "Ритуал: утро без спешки", "ritual", "burnout"),
            ("ritual-vecher", "Ритуал: вечернее завершение дня", "ritual", "stress"),
            ("boundaries-script", "Скрипты границ (интерактивный выбор)", "boundaries", "boundaries"),
            ("navigator-kuda", "Куда двигаться: навигатор", "navigator", None),
        ]
        for slug, title, itype, topic in interactives:
            obj, was_created = _get_or_create_interactive(slug, title, itype, topic, now, dry_run)
            if obj:
                (created if was_created else updated)["interactives"] += 1

        # --- ContentItemModel: статьи (pillar + supporting) ---
        articles = [
            ("trevoga-kak-ponyat", "Тревога: как понять и что делать (не диагноз)", "anxiety", "medium_term",
             "Если вам знакомо чувство тревоги — вы не один и не одна. Краткий ориентир: что чаще всего лежит в основе, "
             "как можно поддержать себя в моменте и когда имеет смысл обсудить это со специалистом.", ""),
            ("trevoga-utrom-3-shaga", "Тревога утром: 3 мягких шага", "anxiety", "immediate",
             "Утро — часто время, когда тревога поднимается. Три простых шага, которые можно попробовать, не вставая с кровати.", ""),
            ("vygoranie-priznaki-prichiny", "Выгорание: признаки, причины, восстановление", "burnout", "medium_term",
             "Выгорание — не про «слабость». Это сигнал, что нагрузка давно превышает ресурс. "
             "Кратко о признаках, причинах и о том, с чего начать восстановление.", ""),
            ("symptomy-vygorania-ignoriruyut", "Симптомы выгорания, которые часто игнорируют", "burnout", "short_term",
             "Усталость, раздражительность, «никуда не хочется» — иногда мы списываем это на погоду или характер. "
             "О каких сигналах важно знать.", ""),
            ("otnosheniya-konflikty-blizost", "Отношения: конфликты, близость, границы", "relationships", "medium_term",
             "Конфликты и границы — часть любых отношений. О том, как говорить о своих нуждах без обвинений "
             "и когда полезно разобрать это на встрече.", ""),
            ("kak-govorit-net-bez-viny", "Как говорить «нет» без чувства вины", "boundaries", "short_term",
             "Отказывать бывает трудно. Несколько опор: как формулировать отказ мягко и что делать с виной.", ""),
            ("samoocenka-samokritika", "Самооценка и самокритика", "self-esteem", "long_term",
             "Самокритика часто звучит громче поддержки. О том, как можно постепенно менять внутренний диалог "
             "и когда имеет смысл обсудить это с психологом.", ""),
        ]
        for slug, title, category, ttb, excerpt, stub in articles:
            related = _related_links(category, slug, LINK_MAP_PHASE1)
            body = _article_body(
                f"Если вам это знакомо — вы не один и не одна. {excerpt}",
                stub,
                related=related,
            )
            obj, was_created = _get_or_create_article(slug, title, category, ttb, excerpt, body, now, dry_run)
            if obj:
                (created if was_created else updated)["articles"] += 1

        # --- ContentItemModel: ресурсы (exercise, tool) ---
        resources = [
            ("dyhanie-4-6", "Дыхание 4–6 (2–3 минуты)", "exercise", "anxiety", "immediate",
             "Снизить напряжение за 2–3 минуты.", "1. Сядьте удобно. 2. Вдох на 4 счёта, выдох на 6. 3. Повторяйте 2–3 минуты."),
            ("zazemlenie-5-4-3-2-1", "Заземление 5-4-3-2-1", "exercise", "anxiety", "immediate",
             "Вернуться «в тело», когда тревога забирает фокус.",
             "Назовите про себя: 5 вещей, которые видите; 4 — слышите; 3 — чувствуете (касание); 2 — запаха; 1 — вкуса."),
            ("chek-list-den-bez-peregruza", "Чек-лист «День без перегруза»", "tool", "burnout", "short_term",
             "Структурировать день так, чтобы не доводить себя до опустошения.",
             "1. Выделите 2–3 приоритета на день. 2. Запланируйте перерывы. 3. Вечером — короткая проверка: что сняло напряжение, что усилило."),
            ("chek-list-granic", "Чек-лист границ (работа, семья, партнёр)", "tool", "boundaries", "short_term",
             "Понять, где границы чаще нарушаются, и выбрать 1–2 зоны для мягких изменений.",
             "Отметьте сферы (работа / семья / партнёр), в которых чаще чувствуете перегруз или обиду. Выберите одну и сформулируйте одну маленькую просьбу или правило."),
            ("dnevnik-abc", "Дневник ABC (самокритика)", "tool", "self-esteem", "medium_term",
             "Отслеживать триггеры самокритики и альтернативные формулировки.",
             "A — ситуация; B — мысль/оценка себя; C — эмоция. Затем: какая более мягкая формулировка возможна?"),
        ]
        for slug, title, ctype, category, ttb, goal, steps in resources:
            body = _resource_body(goal, steps)
            obj, was_created = _get_or_create_resource(slug, title, ctype, category, ttb, body, now, dry_run)
            if obj:
                (created if was_created else updated)["resources"] += 1

        # --- BoundaryScriptModel ---
        scripts = [
            ("work", "soft", "refuse", 0, "Спасибо за предложение, но в этот раз мне нужно отказаться. Я постараюсь подключаться, когда будет возможность."),
            ("work", "brief", "ask", 0, "Можешь прислать задачу в письме? Так я смогу спланировать и ответить к сроку."),
            ("partner", "soft", "refuse", 0, "Спасибо, что думаешь обо мне. В этот раз мне важно провести вечер по-другому. Давай выберем другой день?"),
            ("partner", "brief", "ask", 0, "Мне важно обсудить, как мы делим быт. Можешь выделить 15 минут на разговор на этой неделе?"),
            ("family", "soft", "refuse", 0, "Понимаю, что для тебя это важно. Сейчас мне нужно отдохнуть. Обсудим позже?"),
            ("family", "brief", "set_rule", 0, "Я не буду участвовать в разговорах о [X]. Если тема поднимется, я выйду из комнаты."),
            ("work", "firm", "refuse", 0, "Я не могу взять это на себя в текущих условиях. Предлагаю обсудить приоритеты или сроки."),
            ("partner", "firm", "set_rule", 0, "Мне важно, чтобы мы не поднимали эту тему в присутствии других. Можем обсудить с глазу на глаз."),
            ("family", "firm", "set_rule", 0, "Я не буду участвовать в обсуждениях [X]. Если тема поднимется, я выйду из комнаты."),
            ("friends", "soft", "pause", 0, "Мне сейчас нужно немного тишины. Перезвоню через пару часов, хорошо?"),
        ]
        for scenario, style, goal, order, text in scripts:
            obj, was_created = _get_or_create_script(scenario, style, goal, order, text, now, dry_run)
            if obj:
                (created if was_created else updated)["scripts"] += 1

        # --- итог ---
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Фаза 1 — seed завершён."))
        self.stdout.write(f"  Статьи: создано {created['articles']}, обновлено {updated['articles']}")
        self.stdout.write(f"  Ресурсы: создано {created['resources']}, обновлено {updated['resources']}")
        self.stdout.write(f"  Интерактивы: создано {created['interactives']}, обновлено {updated['interactives']}")
        self.stdout.write(f"  Скрипты границ: создано {created['scripts']}, обновлено {updated['scripts']}")


def _get_or_create_interactive(slug: str, title: str, itype: str, topic, now, dry_run):
    if dry_run:
        return (True, True)
    obj, created = InteractiveDefinitionModel.objects.update_or_create(
        slug=slug,
        defaults={
            "title": title,
            "interactive_type": itype,
            "topic_code": topic or "",
            "status": "published",
            "published_at": now,
        },
    )
    return (obj, created)


def _get_or_create_article(slug: str, title: str, category: str, ttb: str, excerpt: str, body: str, now, dry_run):
    if dry_run:
        return (True, True)
    obj, created = ContentItemModel.objects.update_or_create(
        slug=slug,
        defaults={
            "title": title,
            "content_type": "article",
            "status": "published",
            "topics": [category],
            "tags": [],
            "category": category,
            "excerpt": excerpt,
            "time_to_benefit": ttb,
            "content_body": body,
            "published_at": now,
        },
    )
    return (obj, created)


def _get_or_create_resource(slug: str, title: str, ctype: str, category: str, ttb: str, body: str, now, dry_run):
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


def _get_or_create_script(scenario: str, style: str, goal: str, order: int, text: str, now, dry_run):
    if dry_run:
        return (True, True)
    obj, created = BoundaryScriptModel.objects.get_or_create(
        scenario=scenario,
        style=style,
        goal=goal,
        display_order=order,
        defaults={"script_text": text, "status": "published"},
    )
    if not created:
        obj.script_text = text
        obj.status = "published"
        obj.save(update_fields=["script_text", "status"])
    return (obj, created)
