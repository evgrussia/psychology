"""
ExportType Value Object.
"""
from domain.shared.value_object import ValueObject


class ExportType(ValueObject):
    """Value Object для типа экспорта."""
    
    def __init__(self, value: str):
        valid_types = ['pdf', 'json', 'csv']
        if value not in valid_types:
            raise ValueError(f"Invalid export type: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
