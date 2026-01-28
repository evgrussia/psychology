"""
Tests for UserStatus Value Object.
"""
import pytest
from domain.identity.value_objects.user_status import UserStatus


class TestUserStatus:
    """Tests for UserStatus value object."""
    
    def test_create_valid_status(self):
        """Test creating valid status."""
        status = UserStatus('active')
        
        assert status.value == 'active'
        assert status.is_active() is True
    
    def test_create_invalid_status(self):
        """Test creating invalid status."""
        with pytest.raises(ValueError, match="Invalid user status"):
            UserStatus('invalid')
    
    def test_is_active(self):
        """Test is_active method."""
        active = UserStatus('active')
        blocked = UserStatus('blocked')
        deleted = UserStatus('deleted')
        
        assert active.is_active() is True
        assert blocked.is_active() is False
        assert deleted.is_active() is False
    
    def test_predefined_statuses(self):
        """Test predefined status constants."""
        assert UserStatus.ACTIVE.value == 'active'
        assert UserStatus.ACTIVE.is_active() is True
        
        assert UserStatus.BLOCKED.value == 'blocked'
        assert UserStatus.BLOCKED.is_active() is False
        
        assert UserStatus.DELETED.value == 'deleted'
        assert UserStatus.DELETED.is_active() is False
    
    def test_status_equality(self):
        """Test status equality."""
        status1 = UserStatus('active')
        status2 = UserStatus('active')
        status3 = UserStatus('blocked')
        
        assert status1 == status2
        assert status1 != status3
    
    def test_status_hash(self):
        """Test status hashability."""
        status1 = UserStatus('active')
        status2 = UserStatus('active')
        
        assert hash(status1) == hash(status2)
