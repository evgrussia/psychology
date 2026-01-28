from abc import ABC, abstractmethod
from typing import List
from domain.shared.domain_event import DomainEvent


class IEventBus(ABC):
    """Интерфейс для публикации Domain Events."""
    
    @abstractmethod
    async def publish(self, event: DomainEvent) -> None:
        """Опубликовать одно событие."""
        pass
    
    @abstractmethod
    async def publish_all(self, events: List[DomainEvent]) -> None:
        """Опубликовать несколько событий."""
        pass
    
    @abstractmethod
    def subscribe(self, event_type: type, handler: callable) -> None:
        """Подписаться на события определенного типа."""
        pass
