"""
Tests for User Aggregate Root.
"""
import pytest
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.value_objects.role import Role
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.consent_type import ConsentType
from domain.identity.domain_events import (
    UserCreatedEvent,
    ConsentGrantedEvent,
    ConsentRevokedEvent,
    RoleAssignedEvent,
    UserBlockedEvent
)
from domain.shared.exceptions import DomainError


class TestUser:
    """Tests for User aggregate root."""
    
    def test_create_user_with_email(self):
        """Test creating user with email."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        
        assert user.email == email
        assert user.status == UserStatus.ACTIVE
        assert Role.CLIENT in user.roles
        assert len(user.get_domain_events()) == 1
        assert isinstance(user.get_domain_events()[0], UserCreatedEvent)
    
    def test_create_user_with_phone(self):
        """Test creating user with phone."""
        phone = PhoneNumber.create("+79991234567")
        user = User.create(phone=phone)
        
        assert user.phone == phone
        assert user.status == UserStatus.ACTIVE
    
    def test_create_user_with_telegram(self):
        """Test creating user with Telegram ID."""
        user = User.create(telegram_user_id="123456789")
        
        assert user.telegram_user_id == "123456789"
        assert user.status == UserStatus.ACTIVE
    
    def test_create_user_requires_at_least_one_contact(self):
        """Test that user must have at least one contact method."""
        with pytest.raises(DomainError, match="At least one contact method"):
            User.create()
    
    def test_grant_consent(self):
        """Test granting consent."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        initial_events = len(user.get_domain_events())
        
        user.grant_consent(
            ConsentType.PERSONAL_DATA,
            version="2026-01-01",
            source="web"
        )
        
        assert user.has_active_consent(ConsentType.PERSONAL_DATA)
        assert len(user.get_domain_events()) == initial_events + 1
        assert isinstance(user.get_domain_events()[-1], ConsentGrantedEvent)
    
    def test_cannot_grant_duplicate_consent(self):
        """Test that cannot grant duplicate active consent."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        
        user.grant_consent(
            ConsentType.PERSONAL_DATA,
            version="2026-01-01",
            source="web"
        )
        
        with pytest.raises(DomainError, match="already granted"):
            user.grant_consent(
                ConsentType.PERSONAL_DATA,
                version="2026-01-02",
                source="web"
            )
    
    def test_revoke_consent(self):
        """Test revoking consent."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        
        user.grant_consent(
            ConsentType.PERSONAL_DATA,
            version="2026-01-01",
            source="web"
        )
        
        initial_events = len(user.get_domain_events())
        user.revoke_consent(ConsentType.PERSONAL_DATA)
        
        assert not user.has_active_consent(ConsentType.PERSONAL_DATA)
        assert len(user.get_domain_events()) == initial_events + 1
        assert isinstance(user.get_domain_events()[-1], ConsentRevokedEvent)
    
    def test_cannot_revoke_nonexistent_consent(self):
        """Test that cannot revoke non-existent consent."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        
        with pytest.raises(DomainError, match="Active consent.*not found"):
            user.revoke_consent(ConsentType.PERSONAL_DATA)
    
    def test_assign_role(self):
        """Test assigning role."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        initial_events = len(user.get_domain_events())
        
        user.assign_role(Role.OWNER)
        
        assert Role.OWNER in user.roles
        assert len(user.get_domain_events()) == initial_events + 1
        assert isinstance(user.get_domain_events()[-1], RoleAssignedEvent)
    
    def test_cannot_assign_duplicate_role(self):
        """Test that cannot assign duplicate role."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        
        user.assign_role(Role.OWNER)
        
        with pytest.raises(DomainError, match="already assigned"):
            user.assign_role(Role.OWNER)
    
    def test_block_user(self):
        """Test blocking user."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        initial_events = len(user.get_domain_events())
        
        user.block("Test reason")
        
        assert user.status == UserStatus.BLOCKED
        assert not user.status.is_active()
        assert len(user.get_domain_events()) == initial_events + 1
        assert isinstance(user.get_domain_events()[-1], UserBlockedEvent)
    
    def test_cannot_block_inactive_user(self):
        """Test that cannot block already inactive user."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        user.block("First block")
        
        with pytest.raises(DomainError, match="User is not active"):
            user.block("Second block")
    
    def test_has_role(self):
        """Test has_role method."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        
        assert user.has_role(Role.CLIENT) is True
        assert user.has_role(Role.OWNER) is False
        
        user.assign_role(Role.OWNER)
        
        assert user.has_role(Role.OWNER) is True
    
    def test_has_active_consent(self):
        """Test has_active_consent method."""
        email = Email.create("test@example.com")
        user = User.create(email=email)
        
        assert user.has_active_consent(ConsentType.PERSONAL_DATA) is False
        
        user.grant_consent(
            ConsentType.PERSONAL_DATA,
            version="2026-01-01",
            source="web"
        )
        
        assert user.has_active_consent(ConsentType.PERSONAL_DATA) is True
        
        user.revoke_consent(ConsentType.PERSONAL_DATA)
        
        assert user.has_active_consent(ConsentType.PERSONAL_DATA) is False
