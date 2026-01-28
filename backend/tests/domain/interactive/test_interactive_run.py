"""
Tests for InteractiveRun Aggregate Root.
"""
import pytest
from datetime import datetime, timezone
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from domain.interactive.value_objects.run_status import RunStatus
from domain.interactive.value_objects.run_metadata import RunMetadata
from domain.interactive.value_objects.interactive_result import InteractiveResult
from domain.interactive.value_objects.result_level import ResultLevel
from domain.interactive.domain_events import (
    InteractiveRunStartedEvent,
    InteractiveRunCompletedEvent,
    InteractiveRunAbandonedEvent,
    CrisisTriggeredEvent
)
from domain.identity.aggregates.user import UserId


class TestInteractiveRun:
    """Tests for InteractiveRun aggregate root."""
    
    def test_start_anonymous(self):
        """Test starting interactive run anonymously."""
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata)
        
        assert run.user_id is None
        assert run.metadata == metadata
        assert run.status == RunStatus.STARTED
        assert run.result is None
        assert len(run.get_domain_events()) == 1
        assert isinstance(run.get_domain_events()[0], InteractiveRunStartedEvent)
    
    def test_start_with_user(self):
        """Test starting interactive run with user."""
        user_id = UserId.generate()
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata, user_id=user_id)
        
        assert run.user_id == user_id
        assert run.status == RunStatus.STARTED
    
    def test_complete(self):
        """Test completing interactive run."""
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata)
        run.clear_domain_events()
        
        result = InteractiveResult(
            level=ResultLevel('medium'),
            profile={"key": "value"},
            crisis_detected=False
        )
        run.complete(result)
        
        assert run.status == RunStatus.COMPLETED
        assert run.result == result
        assert run.completed_at is not None
        assert len(run.get_domain_events()) == 1
        assert isinstance(run.get_domain_events()[0], InteractiveRunCompletedEvent)
    
    def test_complete_with_crisis(self):
        """Test completing interactive run with crisis detected."""
        user_id = UserId.generate()
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata, user_id=user_id)
        run.clear_domain_events()
        
        result = InteractiveResult(
            level=ResultLevel('high'),
            crisis_detected=True
        )
        run.complete(result)
        
        events = run.get_domain_events()
        assert len(events) == 2
        assert isinstance(events[0], InteractiveRunCompletedEvent)
        assert isinstance(events[1], CrisisTriggeredEvent)
    
    def test_complete_from_wrong_status(self):
        """Test that complete can only be called from started status."""
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata)
        run.complete(InteractiveResult(level=ResultLevel('medium')))
        
        result = InteractiveResult(level=ResultLevel('medium'))
        with pytest.raises(ValueError, match="Can only complete started run"):
            run.complete(result)
    
    def test_abandon(self):
        """Test abandoning interactive run."""
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata)
        run.clear_domain_events()
        
        run.abandon()
        
        assert run.status == RunStatus.ABANDONED
        assert len(run.get_domain_events()) == 1
        assert isinstance(run.get_domain_events()[0], InteractiveRunAbandonedEvent)
    
    def test_link_to_user(self):
        """Test linking run to user."""
        user_id = UserId.generate()
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata)
        
        assert run.user_id is None
        
        run.link_to_user(user_id)
        
        assert run.user_id == user_id
    
    def test_link_to_user_when_already_linked(self):
        """Test linking when user is already linked."""
        user_id = UserId.generate()
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata, user_id=user_id)
        
        with pytest.raises(ValueError, match="Run is already linked to a user"):
            run.link_to_user(user_id)
    
    def test_properties(self):
        """Test interactive run properties."""
        metadata = RunMetadata(interactive_slug="test-interactive")
        run = InteractiveRun.start(metadata=metadata)
        
        assert isinstance(run.id, InteractiveRunId)
        assert run.metadata == metadata
        assert run.status == RunStatus.STARTED
