"""
Unit-тесты для Cabinet Serializers (Phase 5).
"""
import pytest
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from presentation.api.v1.serializers.cabinet import (
    ExportDiariesSerializer,
    ExportStatusSerializer,
)


@pytest.mark.django_db
class TestExportDiariesSerializer:
    """Тесты для ExportDiariesSerializer."""

    def test_valid_data_defaults(self):
        """Валидные данные с дефолтами."""
        serializer = ExportDiariesSerializer(data={})
        assert serializer.is_valid()
        assert serializer.validated_data.get("format") == "pdf"

    def test_valid_data_with_dates(self):
        """Валидные данные с date_from/date_to."""
        start = datetime.now(timezone.utc) - timedelta(days=30)
        end = datetime.now(timezone.utc)
        serializer = ExportDiariesSerializer(
            data={
                "date_from": start.isoformat(),
                "date_to": end.isoformat(),
                "format": "pdf",
            }
        )
        assert serializer.is_valid()

    def test_format_choice(self):
        """Только pdf допустим."""
        serializer = ExportDiariesSerializer(data={"format": "pdf"})
        assert serializer.is_valid()

    def test_invalid_format(self):
        """Невалидный format."""
        serializer = ExportDiariesSerializer(data={"format": "csv"})
        assert not serializer.is_valid()
        assert "format" in serializer.errors


@pytest.mark.django_db
class TestExportStatusSerializer:
    """Тесты для ExportStatusSerializer (output)."""

    def test_valid_data(self):
        """Валидная структура статуса экспорта."""
        data = {
            "export_id": uuid4(),
            "status": "completed",
            "file_url": "https://example.com/export.pdf",
        }
        serializer = ExportStatusSerializer(data=data)
        assert serializer.is_valid()

    def test_status_pending(self):
        """Статус pending."""
        data = {"export_id": uuid4(), "status": "pending", "file_url": None}
        serializer = ExportStatusSerializer(data=data)
        assert serializer.is_valid()

    def test_invalid_status(self):
        """Невалидный status."""
        data = {"export_id": uuid4(), "status": "invalid"}
        serializer = ExportStatusSerializer(data=data)
        assert not serializer.is_valid()
        assert "status" in serializer.errors
