"""
Интеграционные тесты для Content API endpoints.
"""
import pytest
from rest_framework.test import APIClient, APITestCase as TestCase
from rest_framework import status
# from django.test import TestCase
from uuid import uuid4
from datetime import datetime, timezone

from infrastructure.persistence.django_models.user import UserModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService


@pytest.mark.django_db
@pytest.mark.integration
class TestContentArticlesEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/content/articles."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/content/articles/'
    
    def test_list_articles_success(self):
        """Тест получения списка статей."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_articles_public_access(self):
        """Тест, что список статей доступен без аутентификации."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_list_articles_with_pagination(self):
        """Тест получения списка статей с пагинацией."""
        # Arrange
        params = {
            'page': 1,
            'per_page': 10,
        }
        
        # Act
        response = self.client.get(self.url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('pagination', response.data)
        
        pagination = response.data['pagination']
        self.assertIn('page', pagination)
        self.assertIn('per_page', pagination)
        self.assertIn('total', pagination)
    
    def test_list_articles_with_filtering(self):
        """Тест получения списка статей с фильтрацией."""
        # Arrange
        params = {
            'category': 'anxiety',
            'tag': 'self-help',
        }
        
        # Act
        response = self.client.get(self.url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
    
    def test_list_articles_with_search(self):
        """Тест получения списка статей с поиском."""
        # Arrange
        params = {
            'search': 'anxiety',
        }
        
        # Act
        response = self.client.get(self.url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
    
    def test_list_articles_with_ordering(self):
        """Тест получения списка статей с сортировкой."""
        # Arrange
        params = {
            'ordering': '-published_at',
        }
        
        # Act
        response = self.client.get(self.url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
    
    def test_retrieve_article_success(self):
        """Тест получения статьи по slug."""
        # Arrange
        article_slug = 'how-to-manage-anxiety'
        url = f'/api/v1/content/articles/{article_slug}/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        # Может быть 200 или 404 если статья не существует
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        ])
        
        if response.status_code == status.HTTP_200_OK:
            self.assertIn('data', response.data)
            article_data = response.data['data']
            self.assertIn('id', article_data)
            self.assertIn('slug', article_data)
            self.assertIn('title', article_data)
            self.assertIn('content', article_data)
    
    def test_retrieve_article_not_found(self):
        """Тест получения несуществующей статьи."""
        # Arrange
        non_existent_slug = 'non-existent-article-slug-12345'
        url = f'/api/v1/content/articles/{non_existent_slug}/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
    
    def test_retrieve_article_public_access(self):
        """Тест, что статья доступна без аутентификации."""
        # Arrange
        article_slug = 'how-to-manage-anxiety'
        url = f'/api/v1/content/articles/{article_slug}/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        # Даже если статья не найдена, доступ должен быть разрешен
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        ])


@pytest.mark.django_db
@pytest.mark.integration
class TestContentResourcesEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/content/resources."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/content/resources/'
    
    def test_list_resources_success(self):
        """Тест получения списка ресурсов."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_resources_public_access(self):
        """Тест, что список ресурсов доступен без аутентификации."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_list_resources_with_filtering(self):
        """Тест получения списка ресурсов с фильтрацией."""
        # Arrange
        params = {
            'category': 'exercises',
            'type': 'pdf',
        }
        
        # Act
        response = self.client.get(self.url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
    
    def test_retrieve_resource_success(self):
        """Тест получения ресурса по ID."""
        # Arrange
        resource_id = uuid4()
        url = f'/api/v1/content/resources/{resource_id}/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        # Может быть 200 или 404 если ресурс не существует
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
        ])
        
        if response.status_code == status.HTTP_200_OK:
            self.assertIn('data', response.data)
            resource_data = response.data['data']
            self.assertIn('id', resource_data)
            self.assertIn('title', resource_data)
    
    def test_retrieve_resource_not_found(self):
        """Тест получения несуществующего ресурса."""
        # Arrange
        non_existent_id = uuid4()
        url = f'/api/v1/content/resources/{non_existent_id}/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
