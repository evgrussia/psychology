"""
Audit repository interfaces.
"""
from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from domain.audit.entities import AuditLogEntry


class IAuditLogRepository(ABC):
    """Интерфейс репозитория аудит-лога."""
    
    @abstractmethod
    def save(self, entry: AuditLogEntry) -> AuditLogEntry:
        """Сохранить запись аудит-лога."""
        pass
    
    @abstractmethod
    def get_by_actor(self, actor_user_id: UUID, limit: int = 100) -> List[AuditLogEntry]:
        """Получить записи по актору."""
        pass
    
    @abstractmethod
    def get_by_entity(self, entity_type: str, entity_id: UUID) -> List[AuditLogEntry]:
        """Получить записи по сущности."""
        pass
