"""
Analytics Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from domain.shared.domain_event import DomainEvent
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.lead_status import LeadStatus


@dataclass(frozen=True, kw_only=True)
class LeadCreatedEvent(DomainEvent):
    """Событие создания лида."""
    lead_id: "LeadId"
    source: LeadSource
    
    @property
    def aggregate_id(self) -> str:
        return self.lead_id.value
    
    @property
    def event_name(self) -> str:
        return "LeadCreated"


@dataclass(frozen=True, kw_only=True)
class LeadStatusChangedEvent(DomainEvent):
    """Событие изменения статуса лида."""
    lead_id: "LeadId"
    old_status: LeadStatus
    new_status: LeadStatus
    
    @property
    def aggregate_id(self) -> str:
        return self.lead_id.value
    
    @property
    def event_name(self) -> str:
        return "LeadStatusChanged"


@dataclass(frozen=True, kw_only=True)
class LeadConvertedEvent(DomainEvent):
    """Событие конверсии лида."""
    lead_id: "LeadId"
    
    @property
    def aggregate_id(self) -> str:
        return self.lead_id.value
    
    @property
    def event_name(self) -> str:
        return "LeadConverted"
