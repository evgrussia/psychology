"""
ContentItem Aggregate Root.
"""
from datetime import datetime, timezone
from typing import List, Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.content.value_objects.content_type import ContentType
from domain.content.value_objects.content_status import ContentStatus
from domain.content.value_objects.topic_code import TopicCode
from domain.content.value_objects.time_to_benefit import TimeToBenefit
from domain.content.domain_events import (
    ContentItemPublishedEvent,
    ContentItemArchivedEvent
)


class ContentItemId(EntityId):
    """ID контента."""
    pass


class ContentItem(AggregateRoot):
    """Aggregate Root для контента.
    
    Бизнес-правила:
    - Slug уникален в пределах content_type
    - Публикация меняет статус на Published и устанавливает published_at
    - Контент может быть связан с темами (topics) и тегами (tags)
    """
    
    def __init__(
        self,
        id: ContentItemId,
        slug: str,
        title: str,
        content_type: ContentType,
        status: ContentStatus,
        topics: List[TopicCode],
        tags: List[str],
        time_to_benefit: Optional[TimeToBenefit],
        created_at: datetime,
        content_body: str = "",
        published_at: Optional[datetime] = None
    ):
        super().__init__()
        self._id = id
        self._slug = slug
        self._title = title
        self._content_type = content_type
        self._status = status
        self._topics = topics
        self._tags = tags
        self._time_to_benefit = time_to_benefit
        self._content_body = content_body
        self._created_at = created_at
        self._published_at = published_at
    
    def publish(self) -> None:
        """Публикует контент."""
        if self._status.value == 'published':
            raise ValueError("Content is already published")
        
        self._status = ContentStatus.PUBLISHED
        self._published_at = datetime.now(timezone.utc)
        
        self.add_domain_event(
            ContentItemPublishedEvent(
                content_id=self._id,
                slug=self._slug,
                content_type=self._content_type
            )
        )
    
    def archive(self) -> None:
        """Архивирует контент."""
        if self._status.value == 'archived':
            raise ValueError("Content is already archived")
        
        self._status = ContentStatus.ARCHIVED
        
        self.add_domain_event(
            ContentItemArchivedEvent(
                content_id=self._id,
                slug=self._slug
            )
        )
    
    @property
    def id(self) -> ContentItemId:
        return self._id
    
    @property
    def slug(self) -> str:
        return self._slug
    
    @property
    def title(self) -> str:
        return self._title
    
    @property
    def content_type(self) -> ContentType:
        return self._content_type
    
    @property
    def status(self) -> ContentStatus:
        return self._status
    
    @property
    def topics(self) -> List[TopicCode]:
        return list(self._topics)
    
    @property
    def tags(self) -> List[str]:
        return list(self._tags)
    
    @property
    def time_to_benefit(self) -> Optional[TimeToBenefit]:
        return self._time_to_benefit
    
    @property
    def published_at(self) -> Optional[datetime]:
        return self._published_at
    
    @property
    def content_body(self) -> str:
        return self._content_body
