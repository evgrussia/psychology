"""
Identity & Access Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from domain.shared.domain_event import DomainEvent
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.value_objects.consent_type import ConsentType
from domain.identity.value_objects.role import Role


@dataclass(frozen=True, kw_only=True)
class UserCreatedEvent(DomainEvent):
    """Событие создания пользователя."""
    user_id: "UserId"
    email: Optional[Email] = None
    phone: Optional[PhoneNumber] = None
    telegram_user_id: Optional[str] = None
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "UserCreated"


@dataclass(frozen=True, kw_only=True)
class ConsentGrantedEvent(DomainEvent):
    """Событие выдачи согласия."""
    user_id: "UserId"
    consent_type: ConsentType
    version: str
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "ConsentGranted"


@dataclass(frozen=True, kw_only=True)
class ConsentRevokedEvent(DomainEvent):
    """Событие отзыва согласия."""
    user_id: "UserId"
    consent_type: ConsentType
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "ConsentRevoked"


@dataclass(frozen=True, kw_only=True)
class RoleAssignedEvent(DomainEvent):
    """Событие назначения роли."""
    user_id: "UserId"
    role: Role
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "RoleAssigned"


@dataclass(frozen=True, kw_only=True)
class UserBlockedEvent(DomainEvent):
    """Событие блокировки пользователя."""
    user_id: "UserId"
    reason: str
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "UserBlocked"


@dataclass(frozen=True, kw_only=True)
class UserDataDeletedEvent(DomainEvent):
    """Событие удаления данных пользователя (GDPR/152-ФЗ)."""
    user_id: "UserId"
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "UserDataDeleted"
