"""
Базовые классы для Entity и Aggregate Root.
"""
from abc import ABC
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Any
from uuid import UUID, uuid4


@dataclass
class Entity(ABC):
    """Базовый класс для Entity."""
    id: UUID = field(default_factory=uuid4)
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, Entity):
            return False
        return self.id == other.id
    
    def __hash__(self) -> int:
        return hash(self.id)


@dataclass
class AggregateRoot(Entity):
    """Базовый класс для Aggregate Root с поддержкой Domain Events."""
    _events: List["DomainEvent"] = field(default_factory=list, repr=False)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    def _add_event(self, event: "DomainEvent") -> None:
        """Добавить доменное событие."""
        self._events.append(event)
    
    def get_events(self) -> List["DomainEvent"]:
        """Получить все накопленные события."""
        return self._events.copy()
    
    def clear_events(self) -> None:
        """Очистить события после публикации."""
        self._events.clear()
