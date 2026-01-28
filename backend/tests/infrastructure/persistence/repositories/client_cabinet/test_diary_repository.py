"""
Unit тесты для PostgresDiaryEntryRepository.
"""
import pytest
from datetime import datetime, timezone
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from domain.client_cabinet.value_objects.diary_type import DiaryType
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.repositories.client_cabinet.diary_repository import PostgresDiaryEntryRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestPostgresDiaryEntryRepository:
    """Unit тесты для PostgresDiaryEntryRepository."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def repository(self, event_bus):
        return PostgresDiaryEntryRepository(event_bus)
    
    @pytest.fixture
    def user_id(self):
        return UserId.generate()
    
    @pytest.mark.asyncio
    async def test_save_and_find_by_id(self, repository, user_id):
        """Тест сохранения и поиска по ID."""
        entry = DiaryEntry.create(
            user_id=user_id,
            diary_type=DiaryType('mood'),
            content='Test content'
        )
        
        await repository.save(entry)
        
        found = await repository.find_by_id(entry.id)
        
        assert found is not None
        assert found.id.value == entry.id.value
        assert found.user_id.value == user_id.value
        assert found.diary_type.value == 'mood'
        assert found.content == 'Test content'
    
    @pytest.mark.asyncio
    async def test_find_by_id_not_found(self, repository):
        """Тест поиска по несуществующему ID."""
        non_existent_id = DiaryEntryId.generate()
        
        found = await repository.find_by_id(non_existent_id)
        
        assert found is None
    
    @pytest.mark.asyncio
    async def test_find_by_user_id(self, repository, user_id):
        """Тест поиска всех записей пользователя."""
        # Создать несколько записей для одного пользователя
        entry1 = DiaryEntry.create(
            user_id=user_id,
            diary_type=DiaryType('mood'),
            content='Content 1'
        )
        entry2 = DiaryEntry.create(
            user_id=user_id,
            diary_type=DiaryType('emotion'),
            content='Content 2'
        )
        
        # Создать запись для другого пользователя
        other_user_id = UserId.generate()
        entry3 = DiaryEntry.create(
            user_id=other_user_id,
            diary_type=DiaryType('mood'),
            content='Content 3'
        )
        
        await repository.save(entry1)
        await repository.save(entry2)
        await repository.save(entry3)
        
        # Найти все записи первого пользователя
        entries = await repository.find_by_user_id(user_id)
        
        assert len(entries) == 2
        entry_ids = [e.id.value for e in entries]
        assert entry1.id.value in entry_ids
        assert entry2.id.value in entry_ids
        assert entry3.id.value not in entry_ids
    
    @pytest.mark.asyncio
    async def test_find_by_user_id_empty(self, repository):
        """Тест поиска записей для пользователя без записей."""
        user_id = UserId.generate()
        
        entries = await repository.find_by_user_id(user_id)
        
        assert len(entries) == 0
    
    @pytest.mark.asyncio
    async def test_delete(self, repository, user_id):
        """Тест удаления записи (soft delete)."""
        entry = DiaryEntry.create(
            user_id=user_id,
            diary_type=DiaryType('mood'),
            content='Test content'
        )
        
        await repository.save(entry)
        
        # Убедиться, что запись найдена
        found = await repository.find_by_id(entry.id)
        assert found is not None
        
        # Удалить запись
        await repository.delete(entry.id)
        
        # Убедиться, что запись больше не найдена (soft delete)
        found_after_delete = await repository.find_by_id(entry.id)
        assert found_after_delete is None
