"""
Application Layer исключения.
"""
from typing import Optional, Any


class ApplicationError(Exception):
    """Базовое исключение для Application Layer.
    
    Используется для ошибок на уровне use cases.
    """
    
    def __init__(
        self,
        message: str,
        code: str,
        http_status: int,
        details: Optional[Any] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.http_status = http_status
        self.details = details


# Стандартные коды ошибок
class NotFoundError(ApplicationError):
    """Ресурс не найден."""
    
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(message, "NOT_FOUND", 404, details)


class ValidationError(ApplicationError):
    """Ошибка валидации входных данных."""
    
    def __init__(self, message: str = "Validation failed", details: Optional[Any] = None):
        super().__init__(message, "VALIDATION_ERROR", 422, details)


class ForbiddenError(ApplicationError):
    """Доступ запрещен."""
    
    def __init__(self, message: str = "Forbidden", details: Optional[Any] = None):
        super().__init__(message, "FORBIDDEN", 403, details)


class UnauthorizedError(ApplicationError):
    """Не авторизован."""
    
    def __init__(self, message: str = "Unauthorized", details: Optional[Any] = None):
        super().__init__(message, "UNAUTHORIZED", 401, details)


class ConflictError(ApplicationError):
    """Конфликт (например, слот уже занят)."""
    
    def __init__(self, message: str = "Conflict", details: Optional[Any] = None):
        super().__init__(message, "CONFLICT", 409, details)


class InternalError(ApplicationError):
    """Внутренняя ошибка сервера."""
    
    def __init__(self, message: str = "Internal server error", details: Optional[Any] = None):
        super().__init__(message, "INTERNAL_ERROR", 500, details)


class NotImplementedError(ApplicationError):
    """Метод не реализован."""
    
    def __init__(self, message: str = "Not implemented", details: Optional[Any] = None):
        super().__init__(message, "NOT_IMPLEMENTED", 501, details)
