"""
Identity & Access value objects.
"""
from dataclasses import dataclass

from domain.shared.value_object_base import ValueObject


@dataclass(frozen=True)
class Email(ValueObject):
    """Email value object."""
    value: str
    
    def __post_init__(self):
        if not self.value or '@' not in self.value:
            raise ValueError("Invalid email format")


@dataclass(frozen=True)
class PasswordHash(ValueObject):
    """Password hash value object."""
    value: str  # Argon2id hash
    
    @classmethod
    def from_password(cls, password: str) -> 'PasswordHash':
        """
        Создать hash из пароля.
        
        Note: Реализация через passlib или argon2-cffi в Infrastructure layer.
        """
        # Это будет реализовано в Infrastructure layer
        raise NotImplementedError("Use infrastructure service to hash passwords")


@dataclass(frozen=True)
class Phone(ValueObject):
    """Phone number value object."""
    value: str
    
    def __post_init__(self):
        # Базовая валидация
        if not self.value:
            raise ValueError("Phone number cannot be empty")
