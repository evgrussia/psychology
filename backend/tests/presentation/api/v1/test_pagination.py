"""
Unit-тесты для Pagination (Phase 5).
"""
import pytest
from unittest.mock import Mock, MagicMock

from rest_framework.request import Request
from django.http import HttpRequest

from presentation.api.v1.pagination import (
    StandardResultsSetPagination,
    LargeResultsSetPagination,
)


@pytest.mark.django_db
class TestStandardResultsSetPagination:
    """Тесты для StandardResultsSetPagination."""

    def test_page_size(self):
        """Стандартный размер страницы 20."""
        p = StandardResultsSetPagination()
        assert p.page_size == 20

    def test_page_size_query_param(self):
        """Параметр per_page."""
        assert StandardResultsSetPagination.page_size_query_param == "per_page"

    def test_max_page_size(self):
        """Максимум 100."""
        assert StandardResultsSetPagination.max_page_size == 100

    def test_get_paginated_response_structure(self):
        """Формат ответа: data + pagination."""
        p = StandardResultsSetPagination()
        p.page = MagicMock()
        p.page.number = 1
        p.page.has_next = Mock(return_value=False)
        p.page.has_previous = Mock(return_value=False)
        p.page.paginator = MagicMock()
        p.page.paginator.count = 5
        p.page.paginator.per_page = 20
        p.page.paginator.num_pages = 1

        data = [{"id": 1}, {"id": 2}]
        response = p.get_paginated_response(data)

        assert response.status_code == 200
        assert "data" in response.data
        assert response.data["data"] == data
        assert "pagination" in response.data
        pag = response.data["pagination"]
        assert "page" in pag
        assert "per_page" in pag
        assert "total" in pag
        assert "total_pages" in pag
        assert "has_next" in pag
        assert "has_previous" in pag
        assert pag["page"] == 1
        assert pag["total"] == 5
        assert pag["has_next"] is False


@pytest.mark.django_db
class TestLargeResultsSetPagination:
    """Тесты для LargeResultsSetPagination."""

    def test_page_size(self):
        """Размер страницы 50."""
        p = LargeResultsSetPagination()
        assert p.page_size == 50

    def test_max_page_size(self):
        """Максимум 200."""
        assert LargeResultsSetPagination.max_page_size == 200

    def test_get_paginated_response_structure(self):
        """Формат ответа: data + pagination."""
        p = LargeResultsSetPagination()
        p.page = MagicMock()
        p.page.number = 2
        p.page.has_next = Mock(return_value=True)
        p.page.has_previous = Mock(return_value=True)
        p.page.paginator = MagicMock()
        p.page.paginator.count = 150
        p.page.paginator.per_page = 50
        p.page.paginator.num_pages = 3

        data = [{"id": i} for i in range(50)]
        response = p.get_paginated_response(data)

        assert response.status_code == 200
        assert response.data["pagination"]["page"] == 2
        assert response.data["pagination"]["total"] == 150
        assert response.data["pagination"]["has_next"] is True
        assert response.data["pagination"]["has_previous"] is True
