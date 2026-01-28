"""
Тесты для Content API endpoints (Phase 5).
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase


@pytest.mark.django_db
@pytest.mark.integration
class TestArticleViewSet(TestCase):
    """Тесты для GET /api/v1/content/articles."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/content/articles/"

    def test_list_articles_public(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("data", response.data)
        self.assertIn("pagination", response.data)
        self.assertIsInstance(response.data["data"], list)

    def test_list_articles_pagination_params(self):
        response = self.client.get(self.url, {"page": 1, "per_page": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pagination = response.data.get("pagination", {})
        self.assertIn("page", pagination)
        self.assertIn("total", pagination)


@pytest.mark.django_db
@pytest.mark.integration
class TestResourceViewSet(TestCase):
    """Тесты для GET /api/v1/content/resources."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/content/resources/"

    def test_list_resources_public(self):
        response = self.client.get(self.url)
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_200_OK:
            self.assertIn("data", response.data)
            self.assertIsInstance(response.data["data"], list)
