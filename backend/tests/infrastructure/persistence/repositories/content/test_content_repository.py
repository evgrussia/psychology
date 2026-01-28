"""
Unit тесты для PostgresContentItemRepository.
"""
import pytest
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects.content_type import ContentType
from domain.content.value_objects.content_status import ContentStatus
from domain.content.value_objects.topic_code import TopicCode
from infrastructure.persistence.repositories.content.content_repository import PostgresContentItemRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestPostgresContentItemRepository:
    """Unit тесты для PostgresContentItemRepository."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def repository(self, event_bus):
        return PostgresContentItemRepository(event_bus)
    
    @pytest.mark.asyncio
    async def test_save_and_find_by_id(self, repository):
        """Тест сохранения и поиска по ID."""
        from datetime import datetime, timezone
        
        from domain.content.value_objects.topic_code import TopicCode
        
        content = ContentItem(
            id=ContentItemId.generate(),
            slug='test-article',
            title='Test Article',
            content_type=ContentType('article'),
            status=ContentStatus('draft'),
            topics=[TopicCode('anxiety')],
            tags=['test'],
            time_to_benefit=None,
            created_at=datetime.now(timezone.utc),
            published_at=None
        )
        
        await repository.save(content)
        
        found = await repository.find_by_id(content.id)
        
        assert found is not None
        assert found.id.value == content.id.value
        assert found.slug == content.slug
