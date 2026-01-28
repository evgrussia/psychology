"""
Django ORM реализация IContentItemRepository.
"""
from typing import Optional, List
from asgiref.sync import sync_to_async
from django.db import transaction
from django.core.paginator import Paginator

from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects import ContentType, ContentStatus
from domain.content.repositories import IContentItemRepository
from infrastructure.persistence.django_models.content import ContentItemModel
from infrastructure.persistence.mappers.content_mapper import ContentItemMapper
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class PostgresContentItemRepository(IContentItemRepository):
    """Реализация IContentItemRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, id: ContentItemId) -> Optional[ContentItem]:
        """Найти ContentItem по ID."""
        try:
            record = await ContentItemModel.objects.aget(id=id.value)
            return await sync_to_async(ContentItemMapper.to_domain)(record)
        except ContentItemModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find content item: {e}") from e
    
    async def find_by_slug(self, slug: str, content_type: ContentType) -> Optional[ContentItem]:
        """Найти ContentItem по slug и типу."""
        try:
            record = await ContentItemModel.objects.aget(
                slug=slug,
                content_type=content_type.value
            )
            return await sync_to_async(ContentItemMapper.to_domain)(record)
        except ContentItemModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find content item by slug: {e}") from e
    
    async def save(self, content: ContentItem) -> None:
        """Сохранить ContentItem (создать или обновить)."""
        try:
            await sync_to_async(self._save_sync)(content)
            
            # Публикация Domain Events
            domain_events = content.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                content.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save content item: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, content: ContentItem) -> None:
        """Синхронная версия save."""
        record_data = ContentItemMapper.to_persistence(content)
        
        ContentItemModel.objects.update_or_create(
            id=record_data['id'],
            defaults=record_data
        )
    
    async def find_published(
        self,
        content_type: ContentType,
        page: int = 1,
        per_page: int = 20
    ) -> List[ContentItem]:
        """Находит опубликованный контент с пагинацией."""
        try:
            queryset = ContentItemModel.objects.filter(
                content_type=content_type.value,
                status=ContentStatus.PUBLISHED.value
            ).order_by('-published_at', '-created_at')
            
            # Применяем пагинацию
            paginator = Paginator(queryset, per_page)
            page_obj = await sync_to_async(paginator.get_page)(page)
            
            # Конвертируем записи в доменные объекты
            records = await sync_to_async(list)(page_obj.object_list)
            return [
                await sync_to_async(ContentItemMapper.to_domain)(record)
                for record in records
            ]
        except Exception as e:
            raise InfrastructureError(f"Failed to find published content: {e}") from e
    
    async def count_published(self, content_type: ContentType) -> int:
        """Подсчитывает количество опубликованного контента."""
        try:
            count = await ContentItemModel.objects.filter(
                content_type=content_type.value,
                status=ContentStatus.PUBLISHED.value
            ).acount()
            return count
        except Exception as e:
            raise InfrastructureError(f"Failed to count published content: {e}") from e
    
    async def find_related_resources(
        self,
        content_item: ContentItem,
        limit: int = 5
    ) -> List[ContentItem]:
        """Находит связанные ресурсы для контента."""
        try:
            # Находим ресурсы с общими тегами или топиками
            # Приоритет: общие топики, затем общие теги
            related_records = []
            
            # Поиск по общим топикам
            if content_item.topics:
                queryset = ContentItemModel.objects.filter(
                    content_type__in=['exercise', 'audio', 'tool'],
                    status=ContentStatus.PUBLISHED.value,
                    topics__overlap=content_item.topics
                ).exclude(id=content_item.id.value).order_by('-published_at')[:limit]
                
                related_records = await sync_to_async(list)(queryset)
            
            # Если недостаточно, дополняем по тегам
            if len(related_records) < limit and content_item.tags:
                remaining = limit - len(related_records)
                queryset = ContentItemModel.objects.filter(
                    content_type__in=['exercise', 'audio', 'tool'],
                    status=ContentStatus.PUBLISHED.value,
                    tags__overlap=content_item.tags
                ).exclude(id=content_item.id.value).exclude(
                    id__in=[r.id for r in related_records]
                ).order_by('-published_at')[:remaining]
                
                additional = await sync_to_async(list)(queryset)
                related_records.extend(additional)
            
            # Конвертируем в доменные объекты
            return [
                await sync_to_async(ContentItemMapper.to_domain)(record)
                for record in related_records
            ]
        except Exception as e:
            raise InfrastructureError(f"Failed to find related resources: {e}") from e
