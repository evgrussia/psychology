"""
Use Case: логирование события в аудит-лог.
"""
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, Dict, Any

from domain.audit.entities import AuditLogEntry
from domain.audit.repositories import IAuditLogRepository


class LogAuditEventUseCase:
    """Use Case для логирования события в аудит-лог."""
    
    def __init__(self, audit_repository: IAuditLogRepository):
        self._audit_repository = audit_repository
    
    def execute(
        self,
        actor_user_id: Optional[UUID],
        actor_role: str,
        action: str,
        entity_type: str,
        entity_id: Optional[UUID] = None,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLogEntry:
        """
        Записать событие в аудит-лог.
        
        Returns:
            AuditLogEntry созданная запись.
        """
        entry = AuditLogEntry(
            id=uuid4(),
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        return self._audit_repository.save(entry)
