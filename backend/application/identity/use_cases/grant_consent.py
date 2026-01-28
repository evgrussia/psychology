"""
Use Case: предоставление согласия.
"""
from dataclasses import dataclass
from uuid import UUID
from datetime import datetime

from domain.identity.domain_events import ConsentGrantedEvent
from domain.identity.repositories import IConsentRepository
from application.interfaces.event_bus import IEventBus


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
        event_bus: IEventBus
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
        from domain.identity.value_objects.consent_type import ConsentType
        from domain.identity.aggregates.user import UserId
        
        event = ConsentGrantedEvent(
            user_id=UserId(request.user_id),
            consent_type=ConsentType(request.consent_type),
            version=request.version,
        )
        # Публикация события (синхронно для InMemoryEventBus)
        if hasattr(self._event_bus, 'publish'):
            import asyncio
            if asyncio.iscoroutinefunction(self._event_bus.publish):
                # Если async, нужно использовать async_to_sync или await
                from asgiref.sync import async_to_sync
                async_to_sync(self._event_bus.publish)(event)
            else:
                self._event_bus.publish(event)
