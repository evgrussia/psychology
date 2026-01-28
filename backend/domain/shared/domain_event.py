"""
Базовый класс для доменных событий.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import uuid4


@dataclass(frozen=True)
class DomainEvent(ABC):
    """Базовый класс для доменных событий.
    
    Все события неизменяемые (immutable) и содержат минимум данных.
    """
    
    event_id: str = field(default_factory=lambda: str(uuid4()))
    occurred_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    
    @property
    @abstractmethod
    def aggregate_id(self) -> str:
        """ID агрегата, который породил событие."""
        pass
    
    @property
    @abstractmethod
    def event_name(self) -> str:
        """Имя события (для логирования/маршрутизации)."""
        pass
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(aggregate_id={self.aggregate_id}, occurred_at={self.occurred_at})"
