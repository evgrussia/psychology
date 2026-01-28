"""
Тесты для GrantConsentUseCase.
"""
import pytest
from unittest.mock import Mock
from uuid import uuid4

from domain.identity.domain_events import ConsentGrantedEvent
from application.identity.use_cases.grant_consent import (
    GrantConsentUseCase,
    GrantConsentRequest,
)


class TestGrantConsentUseCase:
    """Тесты для GrantConsentUseCase."""
    
    def test_grant_consent_personal_data(self):
        """Тест предоставления согласия на обработку персональных данных."""
        # Arrange
        user_id = uuid4()
        consent_repository = Mock()
        event_bus = Mock()
        
        use_case = GrantConsentUseCase(consent_repository, event_bus)
        
        request = GrantConsentRequest(
            user_id=user_id,
            consent_type="personal_data",
            version="2026-01-26",
            source="web",
        )
        
        # Act
        use_case.execute(request)
        
        # Assert
        consent_repository.grant_consent.assert_called_once_with(
            user_id=user_id,
            consent_type="personal_data",
            version="2026-01-26",
            source="web",
        )
        event_bus.publish.assert_called_once()
        
        # Проверить, что событие правильное
        published_event = event_bus.publish.call_args[0][0]
        assert isinstance(published_event, ConsentGrantedEvent)
        from domain.identity.aggregates.user import UserId
        assert published_event.user_id == UserId(user_id)
        assert published_event.consent_type.value == "personal_data"
        assert published_event.version == "2026-01-26"
    
    def test_grant_consent_telegram(self):
        """Тест предоставления согласия через Telegram."""
        # Arrange
        user_id = uuid4()
        consent_repository = Mock()
        event_bus = Mock()
        
        use_case = GrantConsentUseCase(consent_repository, event_bus)
        
        request = GrantConsentRequest(
            user_id=user_id,
            consent_type="telegram",
            version="2026-01-26",
            source="telegram",
        )
        
        # Act
        use_case.execute(request)
        
        # Assert
        consent_repository.grant_consent.assert_called_once_with(
            user_id=user_id,
            consent_type="telegram",
            version="2026-01-26",
            source="telegram",
        )
        event_bus.publish.assert_called_once()
    
    def test_grant_consent_review_publication(self):
        """Тест предоставления согласия на публикацию отзыва."""
        # Arrange
        user_id = uuid4()
        consent_repository = Mock()
        event_bus = Mock()
        
        use_case = GrantConsentUseCase(consent_repository, event_bus)
        
        request = GrantConsentRequest(
            user_id=user_id,
            consent_type="review_publication",
            version="2026-01-26",
            source="web",
        )
        
        # Act
        use_case.execute(request)
        
        # Assert
        consent_repository.grant_consent.assert_called_once()
        event_bus.publish.assert_called_once()
