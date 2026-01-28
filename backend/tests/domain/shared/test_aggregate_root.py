"""
Tests for AggregateRoot.
"""
import pytest
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.domain_event import DomainEvent


class TestAggregateRoot(AggregateRoot):
    """Test AggregateRoot implementation."""
    
    def __init__(self, id: str):
        super().__init__()
        self._id = id


class TestEvent(DomainEvent):
    """Test DomainEvent for AggregateRoot tests."""
    
    def __init__(self, aggregate_id: str):
        self._aggregate_id = aggregate_id
        super().__init__()
    
    @property
    def aggregate_id(self) -> str:
        return self._aggregate_id
    
    @property
    def event_name(self) -> str:
        return "TestEvent"


class TestAggregateRootClass:
    """Tests for AggregateRoot base class."""
    
    def test_initial_state(self):
        """Test initial state of aggregate root."""
        aggregate = TestAggregateRoot("test-id")
        
        assert not aggregate.has_domain_events()
        assert len(aggregate.get_domain_events()) == 0
    
    def test_add_domain_event(self):
        """Test adding domain event."""
        aggregate = TestAggregateRoot("test-id")
        event = TestEvent(aggregate_id="test-id")
        
        aggregate.add_domain_event(event)
        
        assert aggregate.has_domain_events()
        assert len(aggregate.get_domain_events()) == 1
        assert aggregate.get_domain_events()[0] == event
    
    def test_add_multiple_events(self):
        """Test adding multiple domain events."""
        aggregate = TestAggregateRoot("test-id")
        event1 = TestEvent(aggregate_id="test-id")
        event2 = TestEvent(aggregate_id="test-id")
        
        aggregate.add_domain_event(event1)
        aggregate.add_domain_event(event2)
        
        assert len(aggregate.get_domain_events()) == 2
        assert aggregate.get_domain_events()[0] == event1
        assert aggregate.get_domain_events()[1] == event2
    
    def test_clear_domain_events(self):
        """Test clearing domain events."""
        aggregate = TestAggregateRoot("test-id")
        event = TestEvent(aggregate_id="test-id")
        
        aggregate.add_domain_event(event)
        assert aggregate.has_domain_events()
        
        aggregate.clear_domain_events()
        
        assert not aggregate.has_domain_events()
        assert len(aggregate.get_domain_events()) == 0
    
    def test_get_domain_events_returns_copy(self):
        """Test that get_domain_events returns a copy."""
        aggregate = TestAggregateRoot("test-id")
        event = TestEvent(aggregate_id="test-id")
        
        aggregate.add_domain_event(event)
        events = aggregate.get_domain_events()
        
        # Modifying the returned list should not affect internal state
        events.append(TestEvent(aggregate_id="other-id"))
        
        assert len(aggregate.get_domain_events()) == 1
    
    def test_add_invalid_event_type(self):
        """Test that adding non-DomainEvent raises TypeError."""
        aggregate = TestAggregateRoot("test-id")
        
        with pytest.raises(TypeError, match="Event must be DomainEvent"):
            aggregate.add_domain_event("not-an-event")
