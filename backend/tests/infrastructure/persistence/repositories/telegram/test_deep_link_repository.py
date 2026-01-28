"""
Unit тесты для PostgresDeepLinkRepository.
"""
import pytest
from domain.telegram.aggregates.deep_link import DeepLink, DeepLinkId
from domain.telegram.value_objects.deep_link_flow import DeepLinkFlow
from infrastructure.persistence.repositories.telegram.deep_link_repository import PostgresDeepLinkRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestPostgresDeepLinkRepository:
    """Unit тесты для PostgresDeepLinkRepository."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def repository(self, event_bus):
        return PostgresDeepLinkRepository(event_bus)
    
    @pytest.mark.asyncio
    async def test_save_and_find_by_id(self, repository):
        """Тест сохранения и поиска по ID."""
        link = DeepLink.create(
            flow=DeepLinkFlow('quiz'),
            token='test-token-123'
        )
        
        await repository.save(link)
        
        found = await repository.find_by_id(link.id)
        
        assert found is not None
        assert found.id.value == link.id.value
        assert found.token == 'test-token-123'
        assert found.flow.value == 'quiz'
    
    @pytest.mark.asyncio
    async def test_find_by_id_not_found(self, repository):
        """Тест поиска по несуществующему ID."""
        non_existent_id = DeepLinkId.generate()
        
        found = await repository.find_by_id(non_existent_id)
        
        assert found is None
    
    @pytest.mark.asyncio
    async def test_find_by_token(self, repository):
        """Тест поиска по токену."""
        link = DeepLink.create(
            flow=DeepLinkFlow('booking'),
            token='unique-token-456'
        )
        
        await repository.save(link)
        
        found = await repository.find_by_token('unique-token-456')
        
        assert found is not None
        assert found.id.value == link.id.value
        assert found.token == 'unique-token-456'
        assert found.flow.value == 'booking'
    
    @pytest.mark.asyncio
    async def test_find_by_token_not_found(self, repository):
        """Тест поиска по несуществующему токену."""
        found = await repository.find_by_token('non-existent-token')
        
        assert found is None
    
    @pytest.mark.asyncio
    async def test_save_updates_existing(self, repository):
        """Тест обновления существующей записи."""
        from datetime import datetime, timedelta, timezone
        
        link = DeepLink.create(
            flow=DeepLinkFlow('content'),
            token='update-test-token'
        )
        
        await repository.save(link)
        
        # Изменить flow (через создание нового объекта с тем же ID)
        # В реальности это делается через доменные методы, но для теста создадим новый объект
        # Получаем created_at через приватное поле
        created_at = getattr(link, '_created_at', datetime.now(timezone.utc))
        updated_link = DeepLink(
            id=link.id,
            flow=DeepLinkFlow('profile'),
            token='update-test-token',
            telegram_user=None,
            created_at=created_at,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30)
        )
        
        await repository.save(updated_link)
        
        found = await repository.find_by_id(link.id)
        assert found is not None
        assert found.flow.value == 'profile'
