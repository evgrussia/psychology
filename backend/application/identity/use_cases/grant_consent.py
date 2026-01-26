"""
Use Case: предоставление согласия.
"""
from dataclasses import dataclass
from uuid import UUID
from datetime import datetime

from domain.identity.repositories import IConsentRepository
from domain.identity.domain_events import ConsentGranted
from infrastructure.events.event_bus import IDomainEventBus


@dataclass
class GrantConsentRequest:
    """DTO: запрос на предоставление согласия."""
    user_id: UUID
    consent_type: str  # 'personal_data', 'communications', 'telegram', 'review_publication'
    version: str  # например, '2026-01-26'
    source: str  # 'web', 'telegram', 'admin'


class GrantConsentUseCase:
    """Use Case для предоставления согласия."""
    
    def __init__(
        self,
        consent_repository: IConsentRepository,
        event_bus: IDomainEventBus
    ):
        self._consent_repository = consent_repository
        self._event_bus = event_bus
    
    def execute(self, request: GrantConsentRequest) -> None:
        """Предоставить согласие."""
        self._consent_repository.grant_consent(
            user_id=request.user_id,
            consent_type=request.consent_type,
            version=request.version,
            source=request.source,
        )
        
        # Публиковать доменное событие
        event = ConsentGranted(
            user_id=request.user_id,
            consent_type=request.consent_type,
            version=request.version,
            source=request.source,
        )
        self._event_bus.publish(event)
