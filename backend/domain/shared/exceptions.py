"""
Доменные исключения.
"""


class DomainException(Exception):
    """Базовое исключение домена."""
    user_message: str = "Произошла ошибка. Пожалуйста, попробуйте позже."
    
    def __init__(self, message: str = None, user_message: str = None):
        super().__init__(message or self.user_message)
        if user_message:
            self.user_message = user_message


class ValidationError(DomainException):
    """Ошибка валидации."""
    user_message = "Некорректные данные."


class EntityNotFoundError(DomainException):
    """Сущность не найдена."""
    user_message = "Запрашиваемый объект не найден."
