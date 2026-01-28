"""
Базовый класс для Value Objects.
"""
from abc import ABC
from typing import Any


class ValueObject(ABC):
    """Базовый класс для Value Objects.
    
    Value Objects:
    - Неизменяемые (immutable)
    - Определяются значениями атрибутов
    - Сравниваются по значениям, а не по ID
    """
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        
        # Глубокое сравнение для dict и других коллекций
        def deep_equal(d1, d2):
            """Глубокое сравнение словарей."""
            if type(d1) != type(d2):
                return False
            if isinstance(d1, dict):
                if set(d1.keys()) != set(d2.keys()):
                    return False
                return all(deep_equal(d1[k], d2[k]) for k in d1.keys())
            elif isinstance(d1, (list, tuple)):
                if len(d1) != len(d2):
                    return False
                return all(deep_equal(a, b) for a, b in zip(d1, d2))
            else:
                return d1 == d2
        
        # Сравниваем все атрибуты
        if set(self.__dict__.keys()) != set(other.__dict__.keys()):
            return False
        
        return all(deep_equal(getattr(self, k), getattr(other, k)) 
                   for k in self.__dict__.keys())
    
    def __hash__(self) -> int:
        """Хеширование Value Object с обработкой нехэшируемых значений."""
        def make_hashable(value):
            """Преобразует значение в хешируемое."""
            if isinstance(value, dict):
                return tuple(sorted((k, make_hashable(v)) for k, v in value.items()))
            elif isinstance(value, (list, tuple)):
                return tuple(make_hashable(item) for item in value)
            elif isinstance(value, set):
                return tuple(sorted(make_hashable(item) for item in value))
            else:
                return value
        
        return hash(tuple(sorted((k, make_hashable(v)) for k, v in self.__dict__.items())))
    
    def __repr__(self) -> str:
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{self.__class__.__name__}({attrs})"
