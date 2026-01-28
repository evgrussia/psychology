"""
Tests for ModerationItem Aggregate Root.
"""
import pytest
from datetime import datetime, timezone
from domain.ugc_moderation.aggregates.moderation_item import ModerationItem, ModerationItemId
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus
from domain.ugc_moderation.value_objects.ugc_content_type import UGCContentType
from domain.ugc_moderation.value_objects.trigger_flag import TriggerFlag
from domain.ugc_moderation.value_objects.moderation_decision import ModerationDecision
from domain.identity.aggregates.user import UserId


class TestModerationItem:
    """Tests for ModerationItem aggregate root."""
    
    def test_flag(self):
        """Test flagging content."""
        item = ModerationItem(
            id=ModerationItemId.generate(),
            content_type=UGCContentType('question'),
            content="encrypted_content",
            author_id=None,
            status=ModerationStatus.PENDING,
            trigger_flags=[],
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
        
        flag = TriggerFlag('crisis')
        item.flag(flag)
        
        assert flag in item.trigger_flags
        assert item.status == ModerationStatus.FLAGGED
        assert len(item.get_domain_events()) == 1
    
    def test_moderate_approve(self):
        """Test moderating with approve decision."""
        from domain.identity.aggregates.user import UserId
        moderator_id = UserId.generate()
        item = ModerationItem(
            id=ModerationItemId.generate(),
            content_type=UGCContentType('question'),
            content="encrypted_content",
            author_id=None,
            status=ModerationStatus.PENDING,
            trigger_flags=[],
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
        
        decision = ModerationDecision('approve')
        item.moderate(moderator_id=moderator_id, decision=decision)
        
        assert item.status == ModerationStatus.APPROVED
        assert len(item.actions) == 1
        assert len(item.get_domain_events()) == 1
    
    def test_moderate_reject(self):
        """Test moderating with reject decision."""
        from domain.identity.aggregates.user import UserId
        moderator_id = UserId.generate()
        item = ModerationItem(
            id=ModerationItemId.generate(),
            content_type=UGCContentType('question'),
            content="encrypted_content",
            author_id=None,
            status=ModerationStatus.PENDING,
            trigger_flags=[],
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
        
        decision = ModerationDecision('reject')
        item.moderate(moderator_id=moderator_id, decision=decision)
        
        assert item.status == ModerationStatus.REJECTED
        assert len(item.actions) == 1
    
    def test_properties(self):
        """Test moderation item properties."""
        item = ModerationItem(
            id=ModerationItemId.generate(),
            content_type=UGCContentType('question'),
            content="encrypted_content",
            author_id=None,
            status=ModerationStatus.PENDING,
            trigger_flags=[],
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
        
        assert isinstance(item.id, ModerationItemId)
        assert item.content_type == UGCContentType('question')
        assert item.status == ModerationStatus.PENDING
