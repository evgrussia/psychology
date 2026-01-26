"""
Domain Event Bus implementation.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Callable, Type
import logging

from domain.shared.domain_event_base import DomainEvent

logger = logging.getLogger(__name__)


class IDomainEventBus(ABC):
    """Интерфейс шины доменных событий."""
    
    @abstractmethod
    def publish(self, event: DomainEvent) -> None:
        """Опубликовать событие."""
        pass
    
    @abstractmethod
    def subscribe(
        self, 
        event_type: Type[DomainEvent], 
        handler: Callable[[DomainEvent], None]
    ) -> None:
        """Подписаться на события определённого типа."""
        pass


class InMemoryDomainEventBus(IDomainEventBus):
    """In-memory реализация шины событий."""
    
    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}
    
    def publish(self, event: DomainEvent) -> None:
        """Опубликовать событие."""
        event_type = event.event_type
        handlers = self._handlers.get(event_type, [])
        
        logger.info(f"Publishing event: {event_type}", extra={
            "event_id": str(event.event_id),
            "event_type": event_type
        })
        
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error(
                    f"Error handling event {event_type}: {e}",
                    exc_info=True
                )
    
    def subscribe(
        self, 
        event_type: Type[DomainEvent], 
        handler: Callable[[DomainEvent], None]
    ) -> None:
        """Подписаться на события определённого типа."""
        type_name = event_type.__name__
        if type_name not in self._handlers:
            self._handlers[type_name] = []
        self._handlers[type_name].append(handler)
