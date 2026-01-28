"""
Базовый класс для Aggregate Roots.
"""
from abc import ABC
from typing import List
from domain.shared.domain_event import DomainEvent


class AggregateRoot(ABC):
    """Базовый класс для Aggregate Roots.
    
    Aggregate Root:
    - Единственная точка входа для изменений агрегата
    - Управляет Domain Events
    - Обеспечивает инкапсуляцию бизнес-правил
    """
    
    def __init__(self):
        self._domain_events: List[DomainEvent] = []
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Возвращает список накопленных Domain Events."""
        return list(self._domain_events)
    
    def clear_domain_events(self) -> None:
        """Очищает список Domain Events (после публикации)."""
        self._domain_events.clear()
    
    def add_domain_event(self, event: DomainEvent) -> None:
        """Добавляет Domain Event."""
        if not isinstance(event, DomainEvent):
            raise TypeError(f"Event must be DomainEvent, got {type(event)}")
        self._domain_events.append(event)
    
    def has_domain_events(self) -> bool:
        """Проверяет наличие Domain Events."""
        return len(self._domain_events) > 0
