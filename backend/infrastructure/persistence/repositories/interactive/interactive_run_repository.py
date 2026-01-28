"""
Django ORM реализация IInteractiveRunRepository.
"""
from typing import List, Optional
from asgiref.sync import sync_to_async
from django.db import transaction

from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from domain.identity.aggregates.user import UserId
from domain.interactive.repositories import IInteractiveRunRepository
from infrastructure.persistence.django_models.interactive import InteractiveRunModel
from infrastructure.persistence.mappers.interactive_mapper import InteractiveRunMapper
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class PostgresInteractiveRunRepository(IInteractiveRunRepository):
    """Реализация IInteractiveRunRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, id: InteractiveRunId) -> Optional[InteractiveRun]:
        """Найти InteractiveRun по ID."""
        try:
            record = await InteractiveRunModel.objects.aget(id=id.value)
            return await sync_to_async(InteractiveRunMapper.to_domain)(record)
        except InteractiveRunModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find interactive run: {e}") from e
    
    async def find_by_user_id(self, user_id: UserId) -> List[InteractiveRun]:
        """Найти все InteractiveRun для пользователя."""
        try:
            records = InteractiveRunModel.objects.filter(
                user_id=user_id.value
            ).order_by('-started_at')
            
            runs = []
            async for record in records:
                run = await sync_to_async(InteractiveRunMapper.to_domain)(record)
                runs.append(run)
            
            return runs
        except Exception as e:
            raise InfrastructureError(f"Failed to find interactive runs by user: {e}") from e
    
    async def save(self, run: InteractiveRun) -> None:
        """Сохранить InteractiveRun (создать или обновить)."""
        try:
            await sync_to_async(self._save_sync)(run)
            
            # Публикация Domain Events после успешного сохранения
            domain_events = run.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                run.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save interactive run: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, run: InteractiveRun) -> None:
        """Синхронная версия save для использования в транзакции."""
        record_data = InteractiveRunMapper.to_persistence(run)
        
        InteractiveRunModel.objects.update_or_create(
            id=record_data['id'],
            defaults=record_data
        )
