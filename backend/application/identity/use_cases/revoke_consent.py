"""
Use Case: отзыв согласия.
"""
from dataclasses import dataclass
from uuid import UUID

from domain.identity.repositories import IConsentRepository
from domain.identity.domain_events import ConsentRevokedEvent
from domain.identity.aggregates.user import UserId
from domain.identity.value_objects.consent_type import ConsentType
from application.interfaces.event_bus import IEventBus as IDomainEventBus


@dataclass
class RevokeConsentRequest:
    """DTO: запрос на отзыв согласия."""
    user_id: UUID
    consent_type: str


class RevokeConsentUseCase:
    """Use Case для отзыва согласия."""
    
    def __init__(
        self,
        consent_repository: IConsentRepository,
        event_bus: IDomainEventBus
    ):
        self._consent_repository = consent_repository
        self._event_bus = event_bus
    
    def execute(self, request: RevokeConsentRequest) -> None:
        """Отозвать согласие."""
        self._consent_repository.revoke_consent(
            user_id=request.user_id,
            consent_type=request.consent_type,
        )
        
        # Публиковать доменное событие
        event = ConsentRevokedEvent(
            user_id=UserId(request.user_id),
            consent_type=ConsentType(request.consent_type),
        )
        self._event_bus.publish(event)
