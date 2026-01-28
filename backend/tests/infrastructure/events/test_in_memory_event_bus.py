"""
Unit тесты для InMemoryEventBus.
"""
import pytest
from dataclasses import dataclass, field
from domain.shared.domain_event import DomainEvent
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@dataclass(frozen=True)
class SampleEvent(DomainEvent):
    """Тестовое событие."""
    value: str = field(default="")
    
    @property
    def aggregate_id(self) -> str:
        return "test"
    
    @property
    def event_name(self) -> str:
        return "SampleEvent"


@pytest.mark.asyncio
class TestInMemoryEventBus:
    """Unit тесты для InMemoryEventBus."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.mark.asyncio
    async def test_publish_and_subscribe(self, event_bus):
        """Тест публикации и подписки на события."""
        handled_events = []
        
        def handler(event: SampleEvent):
            handled_events.append(event)
        
        event_bus.subscribe(SampleEvent, handler)
        await event_bus.start()
        
        event = SampleEvent(value="test")
        await event_bus.publish(event)
        
        # Дать время на обработку
        import asyncio
        await asyncio.sleep(0.1)
        
        assert len(handled_events) > 0
        assert handled_events[0].value == "test"
        
        await event_bus.stop()
    
    @pytest.mark.asyncio
    async def test_publish_all(self, event_bus):
        """Тест публикации нескольких событий."""
        handled_events = []
        
        def handler(event: SampleEvent):
            handled_events.append(event)
        
        event_bus.subscribe(SampleEvent, handler)
        await event_bus.start()
        
        events = [
            SampleEvent(value="event1"),
            SampleEvent(value="event2"),
        ]
        await event_bus.publish_all(events)
        
        # Дать время на обработку
        import asyncio
        await asyncio.sleep(0.1)
        
        assert len(handled_events) >= 2
        
        await event_bus.stop()
