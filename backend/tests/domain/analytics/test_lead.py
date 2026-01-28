"""
Tests for Lead Aggregate Root.
"""
import pytest
from datetime import datetime, timezone
from domain.analytics.aggregates.lead import Lead, LeadId
from domain.analytics.value_objects.lead_status import LeadStatus
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.lead_identity import LeadIdentity
from domain.analytics.value_objects.timeline_event import TimelineEvent
from domain.analytics.value_objects.utm_params import UTMParams
from domain.analytics.domain_events import (
    LeadCreatedEvent,
    LeadStatusChangedEvent,
    LeadConvertedEvent
)


class TestLead:
    """Tests for Lead aggregate root."""
    
    def test_create(self):
        """Test creating lead."""
        identity = LeadIdentity(anonymous_id="anon_123")
        source = LeadSource('web')
        lead = Lead.create(identity=identity, source=source)
        
        assert lead.identity == identity
        assert lead.source == source
        assert lead.status == LeadStatus.NEW
        assert len(lead.timeline) == 0
        assert len(lead.get_domain_events()) == 1
        assert isinstance(lead.get_domain_events()[0], LeadCreatedEvent)
    
    def test_add_timeline_event(self):
        """Test adding timeline event."""
        identity = LeadIdentity(anonymous_id="anon_123")
        source = LeadSource('web')
        lead = Lead.create(identity=identity, source=source)
        
        event = TimelineEvent(
            event_type='page_view',
            occurred_at=datetime.now(timezone.utc),
            metadata={}
        )
        lead.add_timeline_event(event)
        
        assert len(lead.timeline) == 1
        assert lead.timeline[0] == event
    
    def test_update_status(self):
        """Test updating lead status."""
        identity = LeadIdentity(anonymous_id="anon_123")
        source = LeadSource('web')
        lead = Lead.create(identity=identity, source=source)
        lead.clear_domain_events()
        
        new_status = LeadStatus.CONTACTED
        lead.update_status(new_status)
        
        assert lead.status == new_status
        assert len(lead.get_domain_events()) == 1
        assert isinstance(lead.get_domain_events()[0], LeadStatusChangedEvent)
    
    def test_mark_as_converted(self):
        """Test marking lead as converted."""
        identity = LeadIdentity(anonymous_id="anon_123")
        source = LeadSource('web')
        lead = Lead.create(identity=identity, source=source)
        lead.clear_domain_events()
        
        lead.mark_as_converted()
        
        assert lead.status == LeadStatus.CONVERTED
        assert len(lead.get_domain_events()) == 1
        assert isinstance(lead.get_domain_events()[0], LeadConvertedEvent)
    
    def test_properties(self):
        """Test lead properties."""
        identity = LeadIdentity(anonymous_id="anon_123")
        source = LeadSource('web')
        utm_params = UTMParams(source='google', medium='cpc')
        lead = Lead.create(identity=identity, source=source, utm_params=utm_params)
        
        assert isinstance(lead.id, LeadId)
        assert lead.identity == identity
        assert lead.source == source
        assert lead.utm_params == utm_params
