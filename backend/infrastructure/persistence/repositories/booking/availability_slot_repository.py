"""
Django ORM реализация IAvailabilitySlotRepository.
"""
from typing import List, Optional
from datetime import datetime
from asgiref.sync import sync_to_async
from django.db import transaction
from django.utils import timezone

from domain.booking.repositories import IAvailabilitySlotRepository
from domain.booking.entities.availability_slot import AvailabilitySlot, AvailabilitySlotId
from domain.booking.aggregates.service import ServiceId
from infrastructure.persistence.django_models.booking import AvailabilitySlotModel
from infrastructure.exceptions import InfrastructureError


class PostgresAvailabilitySlotRepository(IAvailabilitySlotRepository):
    """Реализация IAvailabilitySlotRepository для PostgreSQL через Django ORM."""
    
    async def find_by_id(self, slot_id: AvailabilitySlotId) -> Optional[AvailabilitySlot]:
        """Найти AvailabilitySlot по ID."""
        try:
            record = await AvailabilitySlotModel.objects.aget(id=slot_id.value)
            return self._to_domain(record)
        except AvailabilitySlotModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find availability slot: {e}") from e
    
    async def find_available_slots(
        self,
        service_id: ServiceId,
        date_from: datetime,
        date_to: datetime
    ) -> List[AvailabilitySlot]:
        """Найти доступные слоты для услуги в диапазоне дат."""
        try:
            queryset = AvailabilitySlotModel.objects.filter(
                service_id=service_id.value,
                status='available',
                start_at__gte=date_from,
                start_at__lte=date_to
            ).order_by('start_at')
            
            records = []
            async for record in queryset:
                records.append(record)
            
            return [self._to_domain(record) for record in records]
        except Exception as e:
            raise InfrastructureError(f"Failed to find available slots: {e}") from e
    
    async def find_all_slots(
        self,
        service_id: Optional[ServiceId] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        status: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[AvailabilitySlot]:
        """Найти все слоты с фильтрацией (для админки)."""
        try:
            queryset = AvailabilitySlotModel.objects.all()
            
            if service_id:
                queryset = queryset.filter(service_id=service_id.value)
            
            if date_from:
                queryset = queryset.filter(start_at__gte=date_from)
            
            if date_to:
                queryset = queryset.filter(start_at__lte=date_to)
            
            if status:
                queryset = queryset.filter(status=status)
            
            queryset = queryset.order_by('start_at')
            
            if limit:
                queryset = queryset[:limit]
            
            records = []
            async for record in queryset:
                records.append(record)
            
            return [self._to_domain(record) for record in records]
        except Exception as e:
            raise InfrastructureError(f"Failed to find all slots: {e}") from e
    
    async def save(self, slot: AvailabilitySlot) -> None:
        """Сохранить AvailabilitySlot."""
        try:
            await sync_to_async(self._save_sync)(slot)
        except Exception as e:
            raise InfrastructureError(f"Failed to save availability slot: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, slot: AvailabilitySlot) -> None:
        """Синхронная версия save."""
        defaults = {
            'service_id': slot.service_id.value if slot.service_id else None,
            'start_at': slot.start_at,
            'end_at': slot.end_at,
            'status': slot.status,
            'source': slot.source,
            'external_event_id': slot.external_event_id
        }
        
        AvailabilitySlotModel.objects.update_or_create(
            id=slot.id.value,
            defaults=defaults
        )
    
    def _to_domain(self, record: AvailabilitySlotModel) -> AvailabilitySlot:
        """Конвертирует Django модель в доменный объект."""
        from domain.booking.entities.availability_slot import AvailabilitySlotId
        
        service_id = None
        if record.service_id:
            service_id = ServiceId(record.service_id)
        
        return AvailabilitySlot(
            id=AvailabilitySlotId(record.id),
            service_id=service_id,
            start_at=record.start_at,
            end_at=record.end_at,
            status=record.status,
            source=record.source,
            external_event_id=record.external_event_id
        )
