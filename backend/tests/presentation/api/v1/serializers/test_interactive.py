"""
Unit-тесты для Interactive Serializers (Phase 5).
"""
import pytest
from datetime import datetime, timezone
from uuid import uuid4

from presentation.api.v1.serializers.interactive import (
    SubmitQuizSerializer,
    CreateDiaryEntrySerializer,
    QuizSerializer,
    QuizListSerializer,
    QuizRunSerializer,
    QuizResultSerializer,
    DiaryEntrySerializer,
    DiaryListSerializer,
)


@pytest.mark.django_db
class TestSubmitQuizSerializer:
    """Тесты для SubmitQuizSerializer."""

    def test_valid_data(self):
        """Валидные данные."""
        serializer = SubmitQuizSerializer(
            data={
                "run_id": str(uuid4()),
                "answers": [{"question_id": "q1", "value": "a1"}],
            }
        )
        assert serializer.is_valid()

    def test_missing_run_id(self):
        """Отсутствует run_id."""
        serializer = SubmitQuizSerializer(
            data={"answers": [{"question_id": "q1", "value": "a1"}]}
        )
        assert not serializer.is_valid()
        assert "run_id" in serializer.errors

    def test_missing_answers(self):
        """Отсутствует answers."""
        serializer = SubmitQuizSerializer(data={"run_id": str(uuid4())})
        assert not serializer.is_valid()
        assert "answers" in serializer.errors

    def test_empty_answers_list(self):
        """Пустой список answers допустим (зависит от бизнес-логики)."""
        serializer = SubmitQuizSerializer(
            data={"run_id": str(uuid4()), "answers": []}
        )
        assert serializer.is_valid()


@pytest.mark.django_db
class TestCreateDiaryEntrySerializer:
    """Тесты для CreateDiaryEntrySerializer."""

    def test_valid_data(self):
        """Валидные данные."""
        serializer = CreateDiaryEntrySerializer(
            data={"type": "mood", "content": "Сегодня спокойно."}
        )
        assert serializer.is_valid()
        assert serializer.validated_data["type"] == "mood"
        assert serializer.validated_data["content"] == "Сегодня спокойно."

    def test_missing_type(self):
        """Отсутствует type."""
        serializer = CreateDiaryEntrySerializer(data={"content": "Текст"})
        assert not serializer.is_valid()
        assert "type" in serializer.errors

    def test_type_only_no_content(self):
        """Только type, content опционален."""
        serializer = CreateDiaryEntrySerializer(data={"type": "mood"})
        assert serializer.is_valid()


@pytest.mark.django_db
class TestQuizRunSerializer:
    """Тесты для QuizRunSerializer (output)."""

    def test_valid_data(self):
        """Валидная структура запуска квиза."""
        data = {
            "run_id": uuid4(),
            "quiz_slug": "anxiety-check",
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        serializer = QuizRunSerializer(data=data)
        assert serializer.is_valid()


@pytest.mark.django_db
class TestQuizResultSerializer:
    """Тесты для QuizResultSerializer (output)."""

    def test_valid_data(self):
        """Валидная структура результата."""
        data = {
            "run_id": uuid4(),
            "result": {"level": "low", "profile": "A", "recommendations": []},
            "deep_link_id": None,
        }
        serializer = QuizResultSerializer(data=data)
        assert serializer.is_valid()


@pytest.mark.django_db
class TestDiaryEntrySerializer:
    """Тесты для DiaryEntrySerializer (output)."""

    def test_valid_data(self):
        """Валидная структура записи дневника."""
        data = {
            "id": uuid4(),
            "type": "mood",
            "content": "Запись",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        serializer = DiaryEntrySerializer(data=data)
        assert serializer.is_valid()
