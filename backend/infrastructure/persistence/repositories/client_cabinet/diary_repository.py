"""
Django ORM реализация IDiaryEntryRepository.
"""
from typing import List, Optional
from asgiref.sync import sync_to_async
from django.db import transaction

from datetime import datetime
from django.utils import timezone
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from domain.identity.aggregates.user import UserId
from domain.client_cabinet.repositories import IDiaryEntryRepository
from infrastructure.persistence.django_models.client_cabinet import DiaryEntryModel
from infrastructure.persistence.mappers.client_cabinet_mapper import DiaryEntryMapper
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class PostgresDiaryEntryRepository(IDiaryEntryRepository):
    """Реализация IDiaryEntryRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, id: DiaryEntryId) -> Optional[DiaryEntry]:
        """Найти DiaryEntry по ID."""
        try:
            record = await DiaryEntryModel.objects.aget(id=id.value, deleted_at__isnull=True)
            return await sync_to_async(DiaryEntryMapper.to_domain)(record)
        except DiaryEntryModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find diary entry: {e}") from e
    
    async def find_by_user_id(self, user_id: UserId) -> List[DiaryEntry]:
        """Найти все DiaryEntry для пользователя."""
        try:
            records = DiaryEntryModel.objects.filter(
                user_id=user_id.value,
                deleted_at__isnull=True
            ).order_by('-created_at')
            
            entries = []
            async for record in records:
                entry = await sync_to_async(DiaryEntryMapper.to_domain)(record)
                entries.append(entry)
            
            return entries
        except Exception as e:
            raise InfrastructureError(f"Failed to find diary entries by user: {e}") from e
    
    async def save(self, entry: DiaryEntry) -> None:
        """Сохранить DiaryEntry (создать или обновить)."""
        try:
            await sync_to_async(self._save_sync)(entry)
            
            # Публикация Domain Events
            domain_events = entry.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                entry.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save diary entry: {e}") from e
    
    async def delete(self, entry_id: DiaryEntryId) -> None:
        """Удалить DiaryEntry (soft delete)."""
        try:
            await DiaryEntryModel.objects.filter(id=entry_id.value).aupdate(
                deleted_at=timezone.now()
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to delete diary entry: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, entry: DiaryEntry) -> None:
        """Синхронная версия save."""
        record_data = DiaryEntryMapper.to_persistence(entry)
        
        DiaryEntryModel.objects.update_or_create(
            id=record_data['id'],
            defaults=record_data
        )
