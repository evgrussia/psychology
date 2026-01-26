"""
Базовый интерфейс репозитория.
"""
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional
from uuid import UUID

T = TypeVar('T')


class IRepository(ABC, Generic[T]):
    """Базовый интерфейс репозитория."""
    
    @abstractmethod
    def save(self, entity: T) -> None:
        """Сохранить entity."""
        pass
    
    @abstractmethod
    def get_by_id(self, id: UUID) -> Optional[T]:
        """Получить entity по ID."""
        pass
    
    @abstractmethod
    def delete(self, entity: T) -> None:
        """Удалить entity."""
        pass
