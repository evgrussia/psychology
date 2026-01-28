"""
Tests for RunStatus Value Object.
"""
import pytest
from domain.interactive.value_objects.run_status import RunStatus


class TestRunStatus:
    """Tests for RunStatus value object."""
    
    def test_create_valid_status(self):
        """Test creating valid run status."""
        status = RunStatus('started')
        assert status.value == 'started'
    
    def test_create_invalid_status(self):
        """Test creating invalid run status."""
        with pytest.raises(ValueError, match="Invalid run status"):
            RunStatus('invalid')
    
    def test_predefined_statuses(self):
        """Test predefined statuses."""
        assert RunStatus.STARTED.value == 'started'
        assert RunStatus.COMPLETED.value == 'completed'
        assert RunStatus.ABANDONED.value == 'abandoned'
    
    def test_equality(self):
        """Test RunStatus equality."""
        status1 = RunStatus('started')
        status2 = RunStatus('started')
        status3 = RunStatus('completed')
        
        assert status1 == status2
        assert status1 != status3
        assert status1 == RunStatus.STARTED
    
    def test_hash(self):
        """Test RunStatus hashability."""
        status1 = RunStatus('started')
        status2 = RunStatus('started')
        
        assert hash(status1) == hash(status2)
        assert status1 in {status1, status2}
