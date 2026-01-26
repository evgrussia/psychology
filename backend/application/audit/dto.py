"""
DTOs для Audit use cases.
"""
from dataclasses import dataclass
from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime


@dataclass
class AuditLogEntryDTO:
    """DTO для записи аудит-лога."""
    id: UUID
    actor_user_id: Optional[UUID]
    actor_role: str
    action: str
    entity_type: str
    entity_id: Optional[UUID]
    old_value: Optional[Dict[str, Any]]
    new_value: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
