"""
Lead Aggregate Root.
"""
from datetime import datetime, timezone
from typing import List, Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.analytics.value_objects.lead_status import LeadStatus
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.lead_identity import LeadIdentity
from domain.analytics.value_objects.timeline_event import TimelineEvent
from domain.analytics.value_objects.utm_params import UTMParams
from domain.analytics.domain_events import (
    LeadCreatedEvent,
    LeadStatusChangedEvent,
    LeadConvertedEvent
)


class LeadId(EntityId):
    """ID лида."""
    pass


class Lead(AggregateRoot):
    """Aggregate Root для лида.
    
    Бизнес-правила:
    - Лид создается при первом "контактном" событии
    - Timeline events содержат только P0 данные (без PII/текстов)
    - Статус лида обновляется автоматически на основе событий
    - Лид может иметь несколько идентичностей (userId, anonymousId, email, phone, telegram)
    """
    
    def __init__(
        self,
        id: LeadId,
        identity: LeadIdentity,
        source: LeadSource,
        status: LeadStatus,
        utm_params: Optional[UTMParams],
        timeline: List[TimelineEvent],
        created_at: datetime,
        topic_code: Optional[str] = None
    ):
        super().__init__()
        self._id = id
        self._identity = identity
        self._source = source
        self._status = status
        self._utm_params = utm_params
        self._timeline = timeline
        self._created_at = created_at
        self._topic_code = topic_code
    
    @classmethod
    def create(
        cls,
        identity: LeadIdentity,
        source: LeadSource,
        utm_params: Optional[UTMParams] = None,
        topic_code: Optional[str] = None
    ) -> "Lead":
        """Factory method для создания лида."""
        lead = cls(
            id=LeadId.generate(),
            identity=identity,
            source=source,
            status=LeadStatus.NEW,
            utm_params=utm_params,
            timeline=[],
            created_at=datetime.now(timezone.utc),
            topic_code=topic_code
        )
        
        lead.add_domain_event(
            LeadCreatedEvent(
                lead_id=lead._id,
                source=source
            )
        )
        
        return lead
    
    def add_timeline_event(self, event: TimelineEvent) -> None:
        """Добавляет событие в timeline."""
        self._timeline.append(event)
        
        # Автоматическое обновление статуса на основе событий
        if event.event_type == 'appointment_booked':
            self._status = LeadStatus.QUALIFIED
        elif event.event_type == 'appointment_completed':
            self._status = LeadStatus.CONVERTED
            self.add_domain_event(
                LeadConvertedEvent(
                    lead_id=self._id
                )
            )
    
    def update_status(self, status: LeadStatus) -> None:
        """Обновляет статус лида."""
        if self._status == status:
            return
        
        old_status = self._status
        self._status = status
        
        self.add_domain_event(
            LeadStatusChangedEvent(
                lead_id=self._id,
                old_status=old_status,
                new_status=status
            )
        )
    
    @property
    def id(self) -> LeadId:
        return self._id
    
    @property
    def status(self) -> LeadStatus:
        return self._status
    
    @property
    def identity(self) -> LeadIdentity:
        return self._identity
    
    @property
    def source(self) -> LeadSource:
        return self._source
    
    @property
    def utm_params(self) -> Optional[UTMParams]:
        return self._utm_params
    
    @property
    def timeline(self) -> List[TimelineEvent]:
        return list(self._timeline)
    
    @property
    def topic_code(self) -> Optional[str]:
        return self._topic_code
    
    @property
    def created_at(self) -> datetime:
        return self._created_at
    
    def mark_as_converted(self) -> None:
        """Помечает лид как конвертированный."""
        if self._status.value == 'converted':
            return
        
        self._status = LeadStatus.CONVERTED
        
        self.add_domain_event(
            LeadConvertedEvent(
                lead_id=self._id
            )
        )
