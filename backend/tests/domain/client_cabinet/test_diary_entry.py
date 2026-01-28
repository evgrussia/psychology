"""
Tests for DiaryEntry Aggregate Root.
"""
import pytest
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from domain.client_cabinet.value_objects.diary_type import DiaryType
from domain.client_cabinet.domain_events import (
    DiaryEntryCreatedEvent,
    DiaryEntryDeletedEvent
)
from domain.identity.aggregates.user import UserId


class TestDiaryEntry:
    """Tests for DiaryEntry aggregate root."""
    
    def test_create(self):
        """Test creating diary entry."""
        user_id = UserId.generate()
        entry = DiaryEntry.create(
            user_id=user_id,
            diary_type=DiaryType('mood'),
            content="encrypted_content"
        )
        
        assert entry.user_id == user_id
        assert entry.diary_type == DiaryType('mood')
        assert entry.content == "encrypted_content"
        assert len(entry.get_domain_events()) == 1
        assert isinstance(entry.get_domain_events()[0], DiaryEntryCreatedEvent)
    
    def test_delete(self):
        """Test deleting diary entry."""
        user_id = UserId.generate()
        entry = DiaryEntry.create(
            user_id=user_id,
            diary_type=DiaryType('mood'),
            content="encrypted_content"
        )
        entry.clear_domain_events()
        
        entry.delete()
        
        assert len(entry.get_domain_events()) == 1
        assert isinstance(entry.get_domain_events()[0], DiaryEntryDeletedEvent)
    
    def test_properties(self):
        """Test diary entry properties."""
        user_id = UserId.generate()
        entry = DiaryEntry.create(
            user_id=user_id,
            diary_type=DiaryType('mood'),
            content="encrypted_content"
        )
        
        assert isinstance(entry.id, DiaryEntryId)
        assert entry.user_id == user_id
        assert entry.diary_type == DiaryType('mood')
        assert entry.content == "encrypted_content"
