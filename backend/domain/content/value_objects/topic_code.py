"""
TopicCode Value Object.
"""
from domain.shared.value_object import ValueObject


class TopicCode(ValueObject):
    """Value Object для кода темы."""
    
    def __init__(self, value: str):
        if not value or not isinstance(value, str):
            raise ValueError(f"Invalid topic code: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
