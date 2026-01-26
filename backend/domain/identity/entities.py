"""
Identity & Access domain entities.
"""
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from domain.shared.entity_base import AggregateRoot


class UserStatus(Enum):
    """Статус пользователя."""
    ACTIVE = "active"
    BLOCKED = "blocked"
    DELETED = "deleted"


@dataclass
class User(AggregateRoot):
    """
    User Entity (Aggregate Root для Identity context).
    """
    email: Optional[str] = None
    phone: Optional[str] = None
    telegram_user_id: Optional[str] = None
    telegram_username: Optional[str] = None
    display_name: Optional[str] = None
    status: UserStatus = UserStatus.ACTIVE
    deleted_at: Optional[datetime] = None
    
    def is_active(self) -> bool:
        """Проверить, активен ли пользователь."""
        return self.status == UserStatus.ACTIVE and self.deleted_at is None
    
    def has_role(self, role_code: str) -> bool:
        """
        Проверить наличие роли у пользователя.
        
        Note: Реализация через UserRole связь, проверяется в репозитории.
        """
        # Это будет реализовано через репозиторий
        pass
