"""
Timezone Value Object.
"""
from domain.shared.value_object import ValueObject


class Timezone(ValueObject):
    """Value Object для таймзоны."""
    
    def __init__(self, value: str):
        # Базовая валидация формата IANA timezone
        if not value or not isinstance(value, str):
            raise ValueError(f"Invalid timezone: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    def __str__(self) -> str:
        return self._value
