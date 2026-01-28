"""
Доменные исключения.
"""


class DomainError(Exception):
    """Базовое исключение для доменных ошибок."""
    pass


class ConflictError(DomainError):
    """Ошибка конфликта (например, слот уже занят)."""
    pass


class BusinessRuleViolationError(DomainError):
    """Нарушение бизнес-правила."""
    pass


class InvalidStateError(DomainError):
    """Некорректное состояние агрегата для операции."""
    pass


# Обратная совместимость
DomainException = DomainError
ValidationError = DomainError
EntityNotFoundError = DomainError
