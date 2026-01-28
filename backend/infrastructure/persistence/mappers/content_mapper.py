"""
Mapper для преобразования Content Domain Entities ↔ DB Records.
"""
from typing import Dict, Any
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects import ContentType, ContentStatus, TopicCode, TimeToBenefit
from infrastructure.persistence.django_models.content import ContentItemModel


class ContentItemMapper:
    """Mapper для преобразования ContentItem Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: ContentItemModel) -> ContentItem:
        """Преобразовать DB Record → Domain Entity."""
        content_type = ContentType(record.content_type)
        status = ContentStatus(record.status)
        
        topics = [TopicCode(topic) for topic in (record.topics or [])]
        tags = record.tags or []
        
        time_to_benefit = TimeToBenefit(record.time_to_benefit) if record.time_to_benefit else None
        
        return ContentItem(
            id=ContentItemId(record.id),
            slug=record.slug,
            title=record.title,
            content_type=content_type,
            status=status,
            topics=topics,
            tags=tags,
            time_to_benefit=time_to_benefit,
            content_body=record.content_body,
            created_at=record.created_at,
            published_at=record.published_at
        )
    
    @staticmethod
    def to_persistence(content: ContentItem) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record."""
        return {
            'id': content.id.value,
            'slug': content.slug,
            'title': content.title,
            'content_type': content.content_type.value,
            'status': content.status.value,
            'topics': [t.value for t in content.topics],
            'tags': content.tags,
            'time_to_benefit': content.time_to_benefit.value if content.time_to_benefit else None,
            'content_body': content.content_body,
            'published_at': content.published_at,
        }
