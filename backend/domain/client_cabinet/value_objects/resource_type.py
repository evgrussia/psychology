"""
ResourceType Value Object для избранного (аптечка).
"""
from domain.shared.value_object import ValueObject


class ResourceType(ValueObject):
    """Тип ресурса в избранном: article | resource | ritual."""

    VALID_TYPES = ('article', 'resource', 'ritual')

    def __init__(self, value: str):
        if value not in self.VALID_TYPES:
            raise ValueError(f"Invalid resource type: {value}. Must be one of {self.VALID_TYPES}")
        self._value = value

    @property
    def value(self) -> str:
        return self._value
