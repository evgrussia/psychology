"""
ResultLevel Value Object.
"""
from domain.shared.value_object import ValueObject


class ResultLevel(ValueObject):
    """Value Object для уровня результата интерактива."""
    
    def __init__(self, value: str):
        valid_levels = ['low', 'medium', 'high', 'critical']
        if value not in valid_levels:
            raise ValueError(f"Invalid result level: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
