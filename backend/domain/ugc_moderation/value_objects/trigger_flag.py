"""
TriggerFlag Value Object.
"""
from domain.shared.value_object import ValueObject


class TriggerFlag(ValueObject):
    """Value Object для флага триггера."""
    
    def __init__(self, value: str):
        valid_flags = ['crisis', 'spam', 'inappropriate', 'off_topic']
        if value not in valid_flags:
            raise ValueError(f"Invalid trigger flag: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
