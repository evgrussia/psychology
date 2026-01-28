"""
Django ORM реализация IModerationItemRepository.
"""
from typing import List, Optional
from asgiref.sync import sync_to_async
from django.db import transaction

from domain.ugc_moderation.aggregates.moderation_item import ModerationItem, ModerationItemId
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus
from domain.ugc_moderation.repositories import IModerationItemRepository
from infrastructure.persistence.django_models.moderation import ModerationItemModel
from infrastructure.persistence.mappers.moderation_mapper import ModerationMapper
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class PostgresModerationItemRepository(IModerationItemRepository):
    """Реализация IModerationItemRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, id: ModerationItemId) -> Optional[ModerationItem]:
        """Найти ModerationItem по ID."""
        try:
            record = await ModerationItemModel.objects.aget(id=id.value)
            return await sync_to_async(ModerationMapper.to_domain)(record)
        except ModerationItemModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find moderation item: {e}") from e
    
    async def find_by_status(self, status: ModerationStatus) -> List[ModerationItem]:
        """Найти все ModerationItem по статусу."""
        try:
            records = ModerationItemModel.objects.filter(status=status.value).order_by('-created_at')
            
            items = []
            async for record in records:
                item = await sync_to_async(ModerationMapper.to_domain)(record)
                items.append(item)
            
            return items
        except Exception as e:
            raise InfrastructureError(f"Failed to find moderation items by status: {e}") from e
    
    async def save(self, item: ModerationItem) -> None:
        """Сохранить ModerationItem (создать или обновить)."""
        try:
            await sync_to_async(self._save_sync)(item)
            
            # Публикация Domain Events
            domain_events = item.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                item.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save moderation item: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, item: ModerationItem) -> None:
        """Синхронная версия save."""
        record_data = ModerationMapper.to_persistence(item)
        
        ModerationItemModel.objects.update_or_create(
            id=record_data['id'],
            defaults=record_data
        )
