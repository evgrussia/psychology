"""
Client Cabinet Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from domain.shared.domain_event import DomainEvent
from domain.client_cabinet.value_objects.export_type import ExportType


@dataclass(frozen=True, kw_only=True)
class DiaryEntryCreatedEvent(DomainEvent):
    """Событие создания записи дневника."""
    entry_id: "DiaryEntryId"
    user_id: "UserId"
    
    @property
    def aggregate_id(self) -> str:
        return self.entry_id.value
    
    @property
    def event_name(self) -> str:
        return "DiaryEntryCreated"


@dataclass(frozen=True, kw_only=True)
class DiaryEntryDeletedEvent(DomainEvent):
    """Событие удаления записи дневника."""
    entry_id: "DiaryEntryId"
    user_id: "UserId"
    
    @property
    def aggregate_id(self) -> str:
        return self.entry_id.value
    
    @property
    def event_name(self) -> str:
        return "DiaryEntryDeleted"


@dataclass(frozen=True, kw_only=True)
class DataExportRequestedEvent(DomainEvent):
    """Событие запроса экспорта данных."""
    user_id: "UserId"
    export_type: ExportType
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "DataExportRequested"
