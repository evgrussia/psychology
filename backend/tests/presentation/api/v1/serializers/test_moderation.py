"""
Unit-тесты для Moderation Serializers (Phase 5).
"""
import pytest

from presentation.api.v1.serializers.moderation import (
    SubmitQuestionSerializer,
    QuestionSerializer,
)


@pytest.mark.django_db
class TestSubmitQuestionSerializer:
    """Тесты для SubmitQuestionSerializer."""

    def test_valid_data(self):
        """Валидные данные."""
        content = "Как справиться с тревогой? " + "x" * 5
        serializer = SubmitQuestionSerializer(data={"content": content})
        assert serializer.is_valid()
        assert serializer.validated_data["content"] == content

    def test_missing_content(self):
        """Отсутствует content."""
        serializer = SubmitQuestionSerializer(data={})
        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_content_too_short(self):
        """Контент короче min_length=10."""
        serializer = SubmitQuestionSerializer(data={"content": "Коротко"})
        assert not serializer.is_valid()
        assert "content" in serializer.errors

    def test_content_max_length(self):
        """Контент в пределах max_length=5000."""
        content = "А" * 5000
        serializer = SubmitQuestionSerializer(data={"content": content})
        assert serializer.is_valid()

    def test_content_exceeds_max_length(self):
        """Контент превышает 5000 символов."""
        content = "А" * 5001
        serializer = SubmitQuestionSerializer(data={"content": content})
        assert not serializer.is_valid()
        assert "content" in serializer.errors


@pytest.mark.django_db
class TestQuestionSerializer:
    """Тесты для QuestionSerializer (output)."""

    def test_valid_data(self):
        """Валидная структура вопроса."""
        data = {
            "id": "q-uuid-123",
            "content": "Вопрос пользователя",
            "status": "pending",
            "created_at": "2026-01-27T12:00:00Z",
        }
        serializer = QuestionSerializer(data=data)
        assert serializer.is_valid()

    def test_invalid_status(self):
        """Невалидный status."""
        data = {
            "id": "q-1",
            "content": "Вопрос",
            "status": "invalid",
            "created_at": "2026-01-27T12:00:00Z",
        }
        serializer = QuestionSerializer(data=data)
        assert not serializer.is_valid()
        assert "status" in serializer.errors
