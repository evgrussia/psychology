"""
Telegram Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from domain.shared.domain_event import DomainEvent
from domain.telegram.value_objects.deep_link_flow import DeepLinkFlow
from domain.telegram.value_objects.telegram_user import TelegramUser


@dataclass(frozen=True, kw_only=True)
class DeepLinkCreatedEvent(DomainEvent):
    """Событие создания deep link."""
    link_id: "DeepLinkId"
    flow: DeepLinkFlow
    
    @property
    def aggregate_id(self) -> str:
        return self.link_id.value
    
    @property
    def event_name(self) -> str:
        return "DeepLinkCreated"


@dataclass(frozen=True, kw_only=True)
class TelegramUserLinkedEvent(DomainEvent):
    """Событие связывания Telegram пользователя."""
    link_id: "DeepLinkId"
    telegram_user: TelegramUser
    
    @property
    def aggregate_id(self) -> str:
        return self.link_id.value
    
    @property
    def event_name(self) -> str:
        return "TelegramUserLinked"
