"""
RejectionReason Value Object.
"""
from domain.shared.value_object import ValueObject


class RejectionReason(ValueObject):
    """Value Object для причины отклонения."""
    
    def __init__(self, value: str):
        if not value or not isinstance(value, str):
            raise ValueError(f"Invalid rejection reason: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
