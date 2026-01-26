"""
DTOs для Identity & Access use cases.
"""
from dataclasses import dataclass
from uuid import UUID
from typing import Optional


@dataclass
class UserDTO:
    """DTO для пользователя."""
    id: UUID
    email: Optional[str]
    phone: Optional[str]
    telegram_user_id: Optional[str]
    display_name: Optional[str]
    status: str


@dataclass
class ConsentDTO:
    """DTO для согласия."""
    user_id: UUID
    consent_type: str
    granted: bool
    version: str
    source: str
