"""
InMemoryEventBus реализация для Release 1.
"""
from typing import Dict, List, Callable
from domain.shared.domain_event import DomainEvent
from application.interfaces.event_bus import IEventBus
import asyncio


class InMemoryEventBus(IEventBus):
    """In-memory реализация Event Bus (для Release 1)."""
    
    def __init__(self):
        self._handlers: Dict[type, List[Callable]] = {}
        self._event_queue: asyncio.Queue = asyncio.Queue()
        self._running = False
    
    async def publish(self, event: DomainEvent) -> None:
        """Опубликовать одно событие."""
        await self._event_queue.put(event)
    
    async def publish_all(self, events: List[DomainEvent]) -> None:
        """Опубликовать несколько событий."""
        for event in events:
            await self._event_queue.put(event)
    
    def subscribe(self, event_type: type, handler: Callable) -> None:
        """Подписаться на события определенного типа."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
    
    async def start(self) -> None:
        """Запустить обработку событий."""
        self._running = True
        asyncio.create_task(self._process_events())
    
    async def stop(self) -> None:
        """Остановить обработку событий."""
        self._running = False
    
    async def _process_events(self) -> None:
        """Обработать события из очереди."""
        while self._running:
            try:
                event = await asyncio.wait_for(self._event_queue.get(), timeout=1.0)
                await self._handle_event(event)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                # Логируем ошибку, но продолжаем обработку
                # В production: отправляем в систему мониторинга
                print(f"Error processing event: {e}")
    
    async def _handle_event(self, event: DomainEvent) -> None:
        """Обработать одно событие."""
        event_type = type(event)
        handlers = self._handlers.get(event_type, [])
        
        # Вызываем все обработчики параллельно
        tasks = [handler(event) for handler in handlers]
        await asyncio.gather(*tasks, return_exceptions=True)
