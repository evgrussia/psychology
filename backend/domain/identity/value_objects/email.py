"""
Email Value Object.
"""
import re
from domain.shared.value_object import ValueObject


class Email(ValueObject):
    """Value Object для email адреса.
    
    Бизнес-правила:
    - Email должен быть валидным форматом
    - Email нормализуется (lowercase, trim)
    """
    
    EMAIL_REGEX = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    def __init__(self, value: str):
        if not self._is_valid(value):
            raise ValueError(f"Invalid email format: {value}")
        
        self._value = value.lower().strip()
    
    @classmethod
    def create(cls, email: str) -> "Email":
        """Создает Email Value Object."""
        return cls(email)
    
    @staticmethod
    def _is_valid(email: str) -> bool:
        """Проверяет валидность email."""
        if not email or not isinstance(email, str):
            return False
        return bool(Email.EMAIL_REGEX.match(email.strip()))
    
    @property
    def value(self) -> str:
        return self._value
    
    def __str__(self) -> str:
        return self._value
