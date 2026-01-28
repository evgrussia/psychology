"""
Tests for ModerationStatus Value Object.
"""
import pytest
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus


class TestModerationStatus:
    """Tests for ModerationStatus value object."""
    
    def test_create_valid_status(self):
        """Test creating valid moderation status."""
        status = ModerationStatus('pending')
        assert status.value == 'pending'
    
    def test_create_invalid_status(self):
        """Test creating invalid moderation status."""
        with pytest.raises(ValueError, match="Invalid moderation status"):
            ModerationStatus('invalid')
    
    def test_predefined_statuses(self):
        """Test predefined statuses."""
        assert ModerationStatus.PENDING.value == 'pending'
        assert ModerationStatus.APPROVED.value == 'approved'
        assert ModerationStatus.REJECTED.value == 'rejected'
        assert ModerationStatus.FLAGGED.value == 'flagged'
    
    def test_equality(self):
        """Test ModerationStatus equality."""
        status1 = ModerationStatus('pending')
        status2 = ModerationStatus('pending')
        status3 = ModerationStatus('approved')
        
        assert status1 == status2
        assert status1 != status3
        assert status1 == ModerationStatus.PENDING
    
    def test_hash(self):
        """Test ModerationStatus hashability."""
        status1 = ModerationStatus('pending')
        status2 = ModerationStatus('pending')
        
        assert hash(status1) == hash(status2)
        assert status1 in {status1, status2}
