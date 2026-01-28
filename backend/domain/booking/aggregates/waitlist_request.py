"""
WaitlistRequest Aggregate Root.
"""
from datetime import datetime, timezone
from typing import Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.identity.aggregates.user import UserId
from domain.booking.aggregates.service import ServiceId


class WaitlistRequestId(EntityId):
    """ID запроса в лист ожидания."""
    pass


class WaitlistRequest(AggregateRoot):
    """Aggregate Root для запроса в лист ожидания."""
    
    def __init__(
        self,
        id: WaitlistRequestId,
        service_id: ServiceId,
        client_id: Optional[UserId],
        created_at: datetime
    ):
        super().__init__()
        self._id = id
        self._service_id = service_id
        self._client_id = client_id
        self._created_at = created_at
    
    @classmethod
    def create(
        cls,
        service_id: ServiceId,
        client_id: Optional[UserId] = None
    ) -> "WaitlistRequest":
        """Factory method для создания запроса в лист ожидания.
        
        Args:
            service_id: ID услуги
            client_id: ID клиента (опционально, для анонимных запросов может быть None)
        """
        return cls(
            id=WaitlistRequestId.generate(),
            service_id=service_id,
            client_id=client_id,
            created_at=datetime.now(timezone.utc)
        )
    
    @property
    def id(self) -> WaitlistRequestId:
        return self._id
    
    @property
    def service_id(self) -> ServiceId:
        return self._service_id
    
    @property
    def client_id(self) -> Optional[UserId]:
        return self._client_id
