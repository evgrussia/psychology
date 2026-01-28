"""
Unit-тесты для Content Serializers (Phase 5).
"""
import pytest
from datetime import datetime, timezone
from uuid import uuid4

from presentation.api.v1.serializers.content import (
    ArticleSerializer,
    ArticleListSerializer,
    ResourceSerializer,
    ResourceListSerializer,
)


@pytest.mark.django_db
class TestArticleSerializer:
    """Тесты для ArticleSerializer (output)."""

    def test_valid_data(self):
        """Валидная структура статьи."""
        data = {
            "id": uuid4(),
            "slug": "anxiety-self-help",
            "title": "Тревога и самопомощь",
            "excerpt": "Краткое описание",
            "content": "Полный текст",
            "category": "anxiety",
            "tags": ["self-help", "anxiety"],
            "published_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        serializer = ArticleSerializer(data=data)
        assert serializer.is_valid()

    def test_published_at_null(self):
        """published_at может быть null."""
        data = {
            "id": uuid4(),
            "slug": "draft-article",
            "title": "Черновик",
            "content": "Текст",
            "category": "general",
            "tags": [],
            "published_at": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        serializer = ArticleSerializer(data=data)
        assert serializer.is_valid()


@pytest.mark.django_db
class TestArticleListSerializer:
    """Тесты для ArticleListSerializer (output)."""

    def test_valid_data(self):
        """Валидная структура элемента списка."""
        data = {
            "id": uuid4(),
            "slug": "article-slug",
            "title": "Заголовок",
            "excerpt": "",
            "category": "category",
            "tags": ["tag1"],
            "published_at": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        serializer = ArticleListSerializer(data=data)
        assert serializer.is_valid()


@pytest.mark.django_db
class TestResourceSerializer:
    """Тесты для ResourceSerializer (output)."""

    def test_valid_data(self):
        """Валидная структура ресурса."""
        data = {
            "id": str(uuid4()),
            "slug": "meditation-guide",
            "title": "Гид по медитации",
            "type": "audio",
            "content": "",
            "duration_minutes": 10,
            "audio_url": "https://example.com/audio.mp3",
            "pdf_url": None,
            "related_articles": [],
        }
        serializer = ResourceSerializer(data=data)
        assert serializer.is_valid()

    def test_minimal_data(self):
        """Минимальные поля."""
        data = {
            "id": "r-1",
            "slug": "resource",
            "title": "Ресурс",
            "type": "article",
        }
        serializer = ResourceSerializer(data=data)
        assert serializer.is_valid()
