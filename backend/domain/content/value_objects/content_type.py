"""
ContentType Value Object.
"""
from domain.shared.value_object import ValueObject


class ContentType(ValueObject):
    """Value Object для типа контента."""
    
    def __init__(self, value: str):
        valid_types = ['article', 'video', 'audio', 'exercise', 'tool', 'landing', 'quiz', 'resource']
        if value not in valid_types:
            raise ValueError(f"Invalid content type: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
