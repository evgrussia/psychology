"""
DiaryType Value Object.
"""
from domain.shared.value_object import ValueObject


class DiaryType(ValueObject):
    """Value Object для типа записи дневника."""
    
    def __init__(self, value: str):
        valid_types = ['mood', 'emotion', 'event', 'note']
        if value not in valid_types:
            raise ValueError(f"Invalid diary type: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
