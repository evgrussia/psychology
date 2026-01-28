"""
Django ORM реализация ILeadRepository.
"""
from typing import List, Optional
from asgiref.sync import sync_to_async
from django.db import transaction

from domain.analytics.aggregates.lead import Lead, LeadId
from domain.analytics.value_objects.lead_status import LeadStatus
from domain.analytics.repositories import ILeadRepository
from infrastructure.persistence.django_models.crm import LeadModel
from infrastructure.persistence.mappers.crm_mapper import CRMMapper
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class PostgresLeadRepository(ILeadRepository):
    """Реализация ILeadRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, id: LeadId) -> Optional[Lead]:
        """Найти Lead по ID."""
        try:
            record = await LeadModel.objects.aget(id=id.value)
            return await sync_to_async(CRMMapper.to_domain)(record)
        except LeadModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find lead: {e}") from e
    
    async def find_by_deep_link_id(self, deep_link_id: str) -> Optional[Lead]:
        """Найти Lead по deep_link_id из timeline events."""
        try:
            # Ищем Lead, у которого в timeline_events есть событие с таким deep_link_id в metadata
            # Используем JSONField lookup для поиска в массиве событий
            # deep_link_id хранится в metadata событий: {'metadata': {'deep_link_id': '...'}}
            records = LeadModel.objects.filter(
                timeline_events__contains=[{'metadata': {'deep_link_id': deep_link_id}}]
            ).order_by('-created_at')
            
            # Берем первый найденный Lead
            try:
                record = await records.afirst()
                if record:
                    return await sync_to_async(CRMMapper.to_domain)(record)
                return None
            except LeadModel.DoesNotExist:
                return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find lead by deep_link_id: {e}") from e
    
    async def find_by_status(self, status: LeadStatus) -> List[Lead]:
        """Найти все Lead по статусу."""
        try:
            records = LeadModel.objects.filter(status=status.value).order_by('-created_at')
            
            leads = []
            async for record in records:
                lead = await sync_to_async(CRMMapper.to_domain)(record)
                leads.append(lead)
            
            return leads
        except Exception as e:
            raise InfrastructureError(f"Failed to find leads by status: {e}") from e
    
    async def save(self, lead: Lead) -> None:
        """Сохранить Lead (создать или обновить)."""
        try:
            await sync_to_async(self._save_sync)(lead)
            
            # Публикация Domain Events
            domain_events = lead.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                lead.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save lead: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, lead: Lead) -> None:
        """Синхронная версия save."""
        record_data = CRMMapper.to_persistence(lead)
        
        LeadModel.objects.update_or_create(
            id=record_data['id'],
            defaults=record_data
        )
