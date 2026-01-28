"""
Базовый класс для идентификаторов сущностей.
"""
from abc import ABC
from typing import Any
from uuid import UUID, uuid4


class EntityId(ABC):
    """Базовый класс для идентификаторов сущностей."""
    
    def __init__(self, value: str | UUID):
        """
        Args:
            value: UUID в виде строки или UUID объекта
        """
        if isinstance(value, UUID):
            self._value = str(value)
        elif isinstance(value, str):
            # Валидация UUID формата
            try:
                UUID(value)
                self._value = value
            except ValueError:
                raise ValueError(f"Invalid UUID format: {value}")
        else:
            raise TypeError(f"EntityId value must be str or UUID, got {type(value)}")
    
    @classmethod
    def generate(cls) -> "EntityId":
        """Генерирует новый UUID."""
        return cls(str(uuid4()))
    
    @property
    def value(self) -> str:
        """Возвращает значение ID как строку."""
        return self._value
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, EntityId):
            return False
        return self._value == other._value
    
    def __hash__(self) -> int:
        return hash(self._value)
    
    def __str__(self) -> str:
        return self._value
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self._value})"
