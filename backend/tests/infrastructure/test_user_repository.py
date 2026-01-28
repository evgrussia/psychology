"""
Тесты для DjangoUserRepository.
"""
import pytest
from uuid import uuid4
from datetime import datetime, timezone

from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestDjangoUserRepository:
    """Тесты для DjangoUserRepository."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def repository(self, event_bus):
        return DjangoUserRepository(event_bus)
    
    @pytest.mark.asyncio
    async def test_save_and_find_by_id(self, repository):
        """Тест сохранения и получения пользователя."""
        user = User(
            id=UserId(uuid4()),
            email=Email("test@example.com"),
            phone=None,
            telegram_user_id=None,
            display_name=None,
            status=UserStatus.ACTIVE,
            roles=[],
            consents=[],
            created_at=datetime.now(timezone.utc),
        )
        
        await repository.save(user)
        
        retrieved_user = await repository.find_by_id(user.id)
        assert retrieved_user is not None
        assert retrieved_user.id.value == user.id.value
        assert retrieved_user.email.value == user.email.value
    
    @pytest.mark.asyncio
    async def test_find_by_email(self, repository):
        """Тест получения пользователя по email."""
        user = User(
            id=UserId(uuid4()),
            email=Email("test-email@example.com"),
            phone=None,
            telegram_user_id=None,
            display_name=None,
            status=UserStatus.ACTIVE,
            roles=[],
            consents=[],
            created_at=datetime.now(timezone.utc),
        )
        
        await repository.save(user)
        
        retrieved_user = await repository.find_by_email(Email("test-email@example.com"))
        assert retrieved_user is not None
        assert retrieved_user.email.value == "test-email@example.com"
        
        non_existent = await repository.find_by_email(Email("nonexistent@example.com"))
        assert non_existent is None
