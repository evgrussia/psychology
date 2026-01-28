"""
Tests for Consent Entity.
"""
import pytest
from datetime import datetime, timezone
from domain.identity.entities.consent import Consent, ConsentId
from domain.identity.value_objects.consent_type import ConsentType
from domain.shared.exceptions import DomainError


class TestConsent:
    """Tests for Consent entity."""
    
    def test_create_consent(self):
        """Test creating consent."""
        consent = Consent.create(
            consent_type=ConsentType.PERSONAL_DATA,
            version="2026-01-01",
            source="web"
        )
        
        assert consent.consent_type == ConsentType.PERSONAL_DATA
        assert consent.version == "2026-01-01"
        assert consent.is_active() is True
        assert consent.revoked_at is None
        assert isinstance(consent.id, ConsentId)
        assert isinstance(consent.granted_at, datetime)
    
    def test_is_active(self):
        """Test is_active method."""
        consent = Consent.create(
            consent_type=ConsentType.PERSONAL_DATA,
            version="2026-01-01",
            source="web"
        )
        
        assert consent.is_active() is True
        
        consent.revoke()
        
        assert consent.is_active() is False
    
    def test_revoke_consent(self):
        """Test revoking consent."""
        consent = Consent.create(
            consent_type=ConsentType.PERSONAL_DATA,
            version="2026-01-01",
            source="web"
        )
        
        assert consent.is_active() is True
        
        consent.revoke()
        
        assert consent.is_active() is False
        assert consent.revoked_at is not None
        assert isinstance(consent.revoked_at, datetime)
    
    def test_cannot_revoke_already_revoked_consent(self):
        """Test that revoking already revoked consent raises error."""
        consent = Consent.create(
            consent_type=ConsentType.PERSONAL_DATA,
            version="2026-01-01",
            source="web"
        )
        
        consent.revoke()
        
        with pytest.raises(DomainError, match="already revoked"):
            consent.revoke()
