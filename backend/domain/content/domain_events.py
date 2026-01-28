"""
Content Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from domain.shared.domain_event import DomainEvent
from domain.content.value_objects.content_type import ContentType


@dataclass(frozen=True, kw_only=True)
class ContentItemPublishedEvent(DomainEvent):
    """Событие публикации контента."""
    content_id: "ContentItemId"
    slug: str
    content_type: ContentType
    
    @property
    def aggregate_id(self) -> str:
        return self.content_id.value
    
    @property
    def event_name(self) -> str:
        return "ContentItemPublished"


@dataclass(frozen=True, kw_only=True)
class ContentItemArchivedEvent(DomainEvent):
    """Событие архивации контента."""
    content_id: "ContentItemId"
    slug: str
    
    @property
    def aggregate_id(self) -> str:
        return self.content_id.value
    
    @property
    def event_name(self) -> str:
        return "ContentItemArchived"
