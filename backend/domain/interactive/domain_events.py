"""
Interactive Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from domain.shared.domain_event import DomainEvent
from domain.interactive.value_objects.interactive_result import InteractiveResult


@dataclass(frozen=True, kw_only=True)
class InteractiveRunStartedEvent(DomainEvent):
    """Событие начала прохождения интерактива."""
    run_id: "InteractiveRunId"
    interactive_slug: str
    user_id: Optional["UserId"] = None
    
    @property
    def aggregate_id(self) -> str:
        return self.run_id.value
    
    @property
    def event_name(self) -> str:
        return "InteractiveRunStarted"


@dataclass(frozen=True, kw_only=True)
class InteractiveRunCompletedEvent(DomainEvent):
    """Событие завершения прохождения интерактива."""
    run_id: "InteractiveRunId"
    result: InteractiveResult
    
    @property
    def aggregate_id(self) -> str:
        return self.run_id.value
    
    @property
    def event_name(self) -> str:
        return "InteractiveRunCompleted"


@dataclass(frozen=True, kw_only=True)
class InteractiveRunAbandonedEvent(DomainEvent):
    """Событие забрасывания прохождения интерактива."""
    run_id: "InteractiveRunId"
    
    @property
    def aggregate_id(self) -> str:
        return self.run_id.value
    
    @property
    def event_name(self) -> str:
        return "InteractiveRunAbandoned"


@dataclass(frozen=True, kw_only=True)
class CrisisTriggeredEvent(DomainEvent):
    """Событие обнаружения кризисного состояния."""
    run_id: "InteractiveRunId"
    user_id: Optional["UserId"] = None
    
    @property
    def aggregate_id(self) -> str:
        return self.run_id.value
    
    @property
    def event_name(self) -> str:
        return "CrisisTriggered"
