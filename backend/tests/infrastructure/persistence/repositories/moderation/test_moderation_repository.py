"""
Unit тесты для PostgresModerationItemRepository.
"""
import pytest
from datetime import datetime, timezone
from domain.ugc_moderation.aggregates.moderation_item import ModerationItem, ModerationItemId
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus
from domain.ugc_moderation.value_objects.ugc_content_type import UGCContentType
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.repositories.moderation.moderation_repository import PostgresModerationItemRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestPostgresModerationItemRepository:
    """Unit тесты для PostgresModerationItemRepository."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def repository(self, event_bus):
        return PostgresModerationItemRepository(event_bus)
    
    @pytest.fixture
    def moderation_item(self):
        """Создать тестовый ModerationItem."""
        from domain.ugc_moderation.value_objects.trigger_flag import TriggerFlag
        
        return ModerationItem(
            id=ModerationItemId.generate(),
            content_type=UGCContentType('question'),
            content='encrypted_content_123',  # В реальности это зашифрованный контент
            author_id=UserId.generate(),
            status=ModerationStatus.PENDING,
            trigger_flags=[],
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
    
    @pytest.mark.asyncio
    async def test_save_and_find_by_id(self, repository, moderation_item):
        """Тест сохранения и поиска по ID."""
        await repository.save(moderation_item)
        
        found = await repository.find_by_id(moderation_item.id)
        
        assert found is not None
        assert found.id.value == moderation_item.id.value
        assert found.content_type.value == moderation_item.content_type.value
        assert found.status.value == moderation_item.status.value
    
    @pytest.mark.asyncio
    async def test_find_by_id_not_found(self, repository):
        """Тест поиска по несуществующему ID."""
        non_existent_id = ModerationItemId.generate()
        
        found = await repository.find_by_id(non_existent_id)
        
        assert found is None
    
    @pytest.mark.asyncio
    async def test_find_by_status(self, repository):
        """Тест поиска по статусу."""
        # Создать несколько элементов с разными статусами
        item1 = ModerationItem(
            id=ModerationItemId.generate(),
            content_type=UGCContentType('question'),
            content='content1',
            author_id=UserId.generate(),
            status=ModerationStatus.PENDING,
            trigger_flags=[],
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
        
        item2 = ModerationItem(
            id=ModerationItemId.generate(),
            content_type=UGCContentType('review'),
            content='content2',
            author_id=UserId.generate(),
            status=ModerationStatus.APPROVED,
            trigger_flags=[],
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
        
        item3 = ModerationItem(
            id=ModerationItemId.generate(),
            content_type=UGCContentType('comment'),
            content='content3',
            author_id=UserId.generate(),
            status=ModerationStatus.PENDING,
            trigger_flags=[],
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
        
        await repository.save(item1)
        await repository.save(item2)
        await repository.save(item3)
        
        # Найти все pending элементы
        pending_items = await repository.find_by_status(ModerationStatus.PENDING)
        
        assert len(pending_items) >= 2
        pending_ids = [item.id.value for item in pending_items]
        assert item1.id.value in pending_ids
        assert item3.id.value in pending_ids
        assert item2.id.value not in pending_ids
