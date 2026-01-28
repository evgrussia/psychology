"""
Tests for DeepLink Aggregate Root.
"""
import pytest
from datetime import datetime, timezone, timedelta
from domain.telegram.aggregates.deep_link import DeepLink, DeepLinkId
from domain.telegram.value_objects.deep_link_flow import DeepLinkFlow
from domain.telegram.value_objects.telegram_user import TelegramUser
from domain.telegram.domain_events import (
    DeepLinkCreatedEvent,
    TelegramUserLinkedEvent
)


class TestDeepLink:
    """Tests for DeepLink aggregate root."""
    
    def test_create(self):
        """Test creating deep link."""
        flow = DeepLinkFlow('booking')
        link = DeepLink.create(flow=flow, token="test_token_123")
        
        assert link.flow == flow
        assert link.token == "test_token_123"
        assert link.telegram_user is None
        assert link.expires_at > datetime.now(timezone.utc)
        assert len(link.get_domain_events()) == 1
        assert isinstance(link.get_domain_events()[0], DeepLinkCreatedEvent)
    
    def test_link_telegram_user(self):
        """Test linking Telegram user."""
        flow = DeepLinkFlow('booking')
        link = DeepLink.create(flow=flow, token="test_token_123")
        link.clear_domain_events()
        
        telegram_user = TelegramUser(user_id=123456789, username="test_user")
        link.link_telegram_user(telegram_user)
        
        assert link.telegram_user == telegram_user
        assert len(link.get_domain_events()) == 1
        assert isinstance(link.get_domain_events()[0], TelegramUserLinkedEvent)
    
    def test_link_telegram_user_when_already_linked(self):
        """Test linking when Telegram user is already linked."""
        flow = DeepLinkFlow('booking')
        link = DeepLink.create(flow=flow, token="test_token_123")
        telegram_user1 = TelegramUser(user_id=123456789, username="test_user")
        link.link_telegram_user(telegram_user1)
        
        telegram_user2 = TelegramUser(user_id=987654321, username="another_user")
        with pytest.raises(ValueError, match="already linked"):
            link.link_telegram_user(telegram_user2)
    
    def test_is_expired(self):
        """Test checking if deep link is expired."""
        flow = DeepLinkFlow('booking')
        link = DeepLink.create(flow=flow, token="test_token_123")
        
        assert not link.is_expired()
        
        # Manually set expired time
        from datetime import timedelta
        link._expires_at = datetime.now(timezone.utc) - timedelta(days=1)
        assert link.is_expired()
    
    def test_properties(self):
        """Test deep link properties."""
        flow = DeepLinkFlow('booking')
        link = DeepLink.create(flow=flow, token="test_token_123")
        
        assert isinstance(link.id, DeepLinkId)
        assert link.flow == flow
        assert link.token == "test_token_123"
