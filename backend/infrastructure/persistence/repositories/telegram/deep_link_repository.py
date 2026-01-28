"""
Django ORM реализация IDeepLinkRepository.
"""
from typing import Optional
from asgiref.sync import sync_to_async
from django.db import transaction

from domain.telegram.aggregates.deep_link import DeepLink, DeepLinkId
from domain.telegram.repositories import IDeepLinkRepository
from infrastructure.persistence.django_models.telegram import DeepLinkModel
from infrastructure.persistence.mappers.telegram_mapper import TelegramMapper
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class PostgresDeepLinkRepository(IDeepLinkRepository):
    """Реализация IDeepLinkRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, id: DeepLinkId) -> Optional[DeepLink]:
        """Найти DeepLink по ID."""
        try:
            record = await DeepLinkModel.objects.aget(id=id.value)
            return await sync_to_async(TelegramMapper.to_domain)(record)
        except DeepLinkModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find deep link: {e}") from e
    
    async def find_by_token(self, token: str) -> Optional[DeepLink]:
        """Найти DeepLink по токену."""
        try:
            record = await DeepLinkModel.objects.aget(token=token)
            return await sync_to_async(TelegramMapper.to_domain)(record)
        except DeepLinkModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find deep link by token: {e}") from e
    
    async def save(self, link: DeepLink) -> None:
        """Сохранить DeepLink (создать или обновить)."""
        try:
            await sync_to_async(self._save_sync)(link)
            
            # Публикация Domain Events
            domain_events = link.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                link.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save deep link: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, link: DeepLink) -> None:
        """Синхронная версия save."""
        record_data = TelegramMapper.to_persistence(link)
        
        DeepLinkModel.objects.update_or_create(
            id=record_data['id'],
            defaults=record_data
        )
