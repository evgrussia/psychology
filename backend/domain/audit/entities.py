"""
Audit domain entities.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID

from domain.shared.entity_base import AggregateRoot


@dataclass
class AuditLogEntry(AggregateRoot):
    """
    AuditLog Entry Entity (Aggregate Root для Audit context).
    """
    id: UUID = None
    actor_user_id: Optional[UUID] = None
    actor_role: str = None  # 'owner', 'assistant', 'editor'
    action: str = None  # например, 'admin_price_changed'
    entity_type: str = None  # например, 'service', 'content', 'user'
    entity_id: Optional[UUID] = None
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None
