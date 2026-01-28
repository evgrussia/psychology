"""
CancellationReason Value Object.
"""
from domain.shared.value_object import ValueObject


class CancellationReason(ValueObject):
    """Value Object для причины отмены."""
    
    def __init__(self, value: str):
        if not value or not isinstance(value, str):
            raise ValueError(f"Invalid cancellation reason: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    def __str__(self) -> str:
        return self._value
