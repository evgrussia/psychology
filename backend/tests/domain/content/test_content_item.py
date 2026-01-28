"""
Tests for ContentItem Aggregate Root.
"""
import pytest
from datetime import datetime, timezone
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects.content_type import ContentType
from domain.content.value_objects.content_status import ContentStatus
from domain.content.value_objects.topic_code import TopicCode
from domain.content.value_objects.time_to_benefit import TimeToBenefit
from domain.content.domain_events import (
    ContentItemPublishedEvent,
    ContentItemArchivedEvent
)


class TestContentItem:
    """Tests for ContentItem aggregate root."""
    
    def test_publish(self):
        """Test publishing content item."""
        content = ContentItem(
            id=ContentItemId.generate(),
            slug="test-article",
            title="Test Article",
            content_type=ContentType('article'),
            status=ContentStatus.DRAFT,
            topics=[],
            tags=[],
            time_to_benefit=None,
            created_at=datetime.now(timezone.utc),
            content_body="Test content"
        )
        
        content.publish()
        
        assert content.status == ContentStatus.PUBLISHED
        assert content.published_at is not None
        assert len(content.get_domain_events()) == 1
        assert isinstance(content.get_domain_events()[0], ContentItemPublishedEvent)
    
    def test_publish_already_published(self):
        """Test that publishing already published content raises error."""
        content = ContentItem(
            id=ContentItemId.generate(),
            slug="test-article",
            title="Test Article",
            content_type=ContentType('article'),
            status=ContentStatus.PUBLISHED,
            topics=[],
            tags=[],
            time_to_benefit=None,
            created_at=datetime.now(timezone.utc),
            content_body="Test content"
        )
        
        with pytest.raises(ValueError, match="Content is already published"):
            content.publish()
    
    def test_archive(self):
        """Test archiving content item."""
        content = ContentItem(
            id=ContentItemId.generate(),
            slug="test-article",
            title="Test Article",
            content_type=ContentType('article'),
            status=ContentStatus.PUBLISHED,
            topics=[],
            tags=[],
            time_to_benefit=None,
            created_at=datetime.now(timezone.utc),
            content_body="Test content"
        )
        
        content.archive()
        
        assert content.status == ContentStatus.ARCHIVED
        assert len(content.get_domain_events()) == 1
        assert isinstance(content.get_domain_events()[0], ContentItemArchivedEvent)
    
    def test_archive_already_archived(self):
        """Test that archiving already archived content raises error."""
        content = ContentItem(
            id=ContentItemId.generate(),
            slug="test-article",
            title="Test Article",
            content_type=ContentType('article'),
            status=ContentStatus.ARCHIVED,
            topics=[],
            tags=[],
            time_to_benefit=None,
            created_at=datetime.now(timezone.utc),
            content_body="Test content"
        )
        
        with pytest.raises(ValueError, match="Content is already archived"):
            content.archive()
    
    def test_properties(self):
        """Test content item properties."""
        topics = [TopicCode('anxiety'), TopicCode('depression')]
        tags = ['mental-health', 'wellness']
        time_to_benefit = TimeToBenefit(value="short_term")
        
        content = ContentItem(
            id=ContentItemId.generate(),
            slug="test-article",
            title="Test Article",
            content_type=ContentType('article'),
            status=ContentStatus.DRAFT,
            topics=topics,
            tags=tags,
            time_to_benefit=time_to_benefit,
            created_at=datetime.now(timezone.utc),
            content_body="Test content"
        )
        
        assert isinstance(content.id, ContentItemId)
        assert content.slug == "test-article"
        assert content.title == "Test Article"
        assert content.content_type == ContentType('article')
        assert content.topics == topics
        assert content.tags == tags
        assert content.time_to_benefit == time_to_benefit
        assert content.content_body == "Test content"
