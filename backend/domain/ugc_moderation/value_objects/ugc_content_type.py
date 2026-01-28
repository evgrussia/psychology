"""
UGCContentType Value Object.
"""
from domain.shared.value_object import ValueObject


class UGCContentType(ValueObject):
    """Value Object для типа UGC контента."""
    
    def __init__(self, value: str):
        valid_types = ['question', 'review', 'comment']
        if value not in valid_types:
            raise ValueError(f"Invalid UGC content type: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
