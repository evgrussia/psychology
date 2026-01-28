"""
Unit тесты для PostgresInteractiveRunRepository.
"""
import pytest
from datetime import datetime, timezone
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from domain.interactive.value_objects import RunStatus, RunMetadata
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.repositories.interactive.interactive_run_repository import PostgresInteractiveRunRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestPostgresInteractiveRunRepository:
    """Unit тесты для PostgresInteractiveRunRepository."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def repository(self, event_bus):
        return PostgresInteractiveRunRepository(event_bus)
    
    @pytest.fixture
    def user_id(self):
        return UserId.generate()
    
    @pytest.fixture
    def metadata(self):
        return RunMetadata(interactive_slug='test-quiz')
    
    @pytest.mark.asyncio
    async def test_save_and_find_by_id(self, repository, user_id, metadata):
        """Тест сохранения и поиска по ID."""
        run = InteractiveRun.start(metadata=metadata, user_id=user_id)
        
        await repository.save(run)
        
        found = await repository.find_by_id(run.id)
        
        assert found is not None
        assert found.id.value == run.id.value
        assert found.user_id.value == run.user_id.value
    
    @pytest.mark.asyncio
    async def test_find_by_user_id(self, repository, user_id, metadata):
        """Тест поиска по user_id."""
        from infrastructure.persistence.django_models.interactive import InteractiveDefinitionModel
        from uuid import uuid4
        from asgiref.sync import sync_to_async
        
        # Создать InteractiveDefinition в БД
        await sync_to_async(InteractiveDefinitionModel.objects.create)(
            id=uuid4(),
            slug='test-quiz',
            interactive_type='quiz',
            title='Test Quiz',
            status='published'
        )
        
        # Создать несколько runs для одного пользователя
        run1 = InteractiveRun.start(metadata=metadata, user_id=user_id)
        run2 = InteractiveRun.start(metadata=metadata, user_id=user_id)
        
        # Создать run для другого пользователя
        other_user_id = UserId.generate()
        run3 = InteractiveRun.start(metadata=metadata, user_id=other_user_id)
        
        await repository.save(run1)
        await repository.save(run2)
        await repository.save(run3)
        
        # Найти все runs первого пользователя
        runs = await repository.find_by_user_id(user_id)
        
        assert len(runs) >= 2
        run_ids = [r.id.value for r in runs]
        assert run1.id.value in run_ids
        assert run2.id.value in run_ids
        assert run3.id.value not in run_ids
