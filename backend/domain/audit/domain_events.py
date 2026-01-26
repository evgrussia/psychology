"""
Audit domain events.
"""
from dataclasses import dataclass
from uuid import UUID

from domain.shared.domain_event_base import DomainEvent


@dataclass
class AuditLogged(DomainEvent):
    """Событие: действие залогировано в аудит-лог."""
    audit_log_id: UUID
    action: str
    entity_type: str
