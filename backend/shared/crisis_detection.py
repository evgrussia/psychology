"""
Общая логика детекции кризисных индикаторов в тексте.
Используется в complete_interactive_run, модерации UGC и других местах.
"""

# Единый список ключевых слов (расширенный, из модерации + submit_question)
CRISIS_KEYWORDS = [
    'суицид',
    'самоубийство',
    'убить себя',
    'покончить',
    'покончить с собой',
    'не хочу жить',
    'лучше умереть',
    'самоповреждение',
    'резать себя',
    'повредить себя',
]


def detect_crisis_indicators(text: str) -> bool:
    """
    Проверяет наличие кризисных индикаторов в тексте.

    Args:
        text: произвольный текст (ответы пользователя, UGC и т.д.)

    Returns:
        True, если обнаружен хотя бы один кризисный индикатор.
    """
    if not text or not isinstance(text, str):
        return False
    content_lower = text.lower().strip()
    return any(keyword in content_lower for keyword in CRISIS_KEYWORDS)


def extract_text_from_answers(answers: list) -> str:
    """
    Извлекает объединённый текст из списка ответов (для интерактивов).
    answers — список dict с полями 'value', 'text', 'content' и т.п.
    """
    if not answers:
        return ''
    parts = []
    for item in answers:
        if not isinstance(item, dict):
            continue
        for key in ('text', 'content', 'value', 'answer'):
            if key in item and item[key] is not None:
                v = item[key]
                if isinstance(v, str):
                    parts.append(v)
                elif isinstance(v, (int, float)):
                    parts.append(str(v))
                break
    return ' '.join(parts)
