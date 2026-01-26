"""
Identity & Access domain events.
"""
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4

from domain.shared.domain_event_base import DomainEvent


@dataclass
class UserCreated(DomainEvent):
    """Событие: пользователь создан."""
    user_id: UUID = None
    email: str = None
    telegram_user_id: str = None
    
    def __post_init__(self):
        if self.user_id is None:
            raise ValueError("user_id is required")


@dataclass
class ConsentGranted(DomainEvent):
    """Событие: согласие предоставлено."""
    user_id: UUID = None
    consent_type: str = None
    version: str = None
    source: str = None
    
    def __post_init__(self):
        if self.user_id is None:
            raise ValueError("user_id is required")
        if self.consent_type is None:
            raise ValueError("consent_type is required")
        if self.version is None:
            raise ValueError("version is required")
        if self.source is None:
            raise ValueError("source is required")


@dataclass
class ConsentRevoked(DomainEvent):
    """Событие: согласие отозвано."""
    user_id: UUID = None
    consent_type: str = None
    
    def __post_init__(self):
        if self.user_id is None:
            raise ValueError("user_id is required")
        if self.consent_type is None:
            raise ValueError("consent_type is required")
