"""
DeepLink Aggregate Root.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.telegram.value_objects.deep_link_flow import DeepLinkFlow
from domain.telegram.value_objects.telegram_user import TelegramUser
from domain.telegram.domain_events import (
    DeepLinkCreatedEvent,
    TelegramUserLinkedEvent
)


class DeepLinkId(EntityId):
    """ID deep link."""
    pass


class DeepLink(AggregateRoot):
    """Aggregate Root для deep link.
    
    Бизнес-правила:
    - Deep link содержит только P0 данные (без PII)
    - TTL: 30 дней (автоматическая очистка)
    - Deep link используется для склейки аналитики Web ↔ Telegram
    """
    
    TTL_DAYS = 30
    
    def __init__(
        self,
        id: DeepLinkId,
        flow: DeepLinkFlow,
        token: str,
        telegram_user: Optional[TelegramUser],
        created_at: datetime,
        expires_at: datetime
    ):
        super().__init__()
        self._id = id
        self._flow = flow
        self._token = token
        self._telegram_user = telegram_user
        self._created_at = created_at
        self._expires_at = expires_at
    
    @classmethod
    def create(
        cls,
        flow: DeepLinkFlow,
        token: str
    ) -> "DeepLink":
        """Factory method для создания deep link."""
        now = datetime.now(timezone.utc)
        link = cls(
            id=DeepLinkId.generate(),
            flow=flow,
            token=token,
            telegram_user=None,
            created_at=now,
            expires_at=now + timedelta(days=cls.TTL_DAYS)
        )
        
        link.add_domain_event(
            DeepLinkCreatedEvent(
                link_id=link._id,
                flow=flow
            )
        )
        
        return link
    
    def link_telegram_user(self, telegram_user: TelegramUser) -> None:
        """Связывает deep link с Telegram пользователем."""
        if self._telegram_user:
            raise ValueError("Deep link is already linked to a Telegram user")
        
        self._telegram_user = telegram_user
        
        self.add_domain_event(
            TelegramUserLinkedEvent(
                link_id=self._id,
                telegram_user=telegram_user
            )
        )
    
    def is_expired(self) -> bool:
        """Проверяет, истек ли срок действия."""
        return datetime.now(timezone.utc) > self._expires_at
    
    @property
    def id(self) -> DeepLinkId:
        return self._id
    
    @property
    def token(self) -> str:
        return self._token
    
    @property
    def flow(self) -> DeepLinkFlow:
        return self._flow
    
    @property
    def telegram_user(self) -> Optional[TelegramUser]:
        return self._telegram_user
    
    @property
    def expires_at(self) -> datetime:
        return self._expires_at
