"""
Интеграционные тесты для Favorites (аптечка) API — FIX-P0-02.
"""
import pytest
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from asgiref.sync import async_to_sync

from infrastructure.persistence.django_models.client_cabinet import FavoriteModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService


@pytest.mark.django_db
@pytest.mark.integration
class TestFavoritesEndpoints(APITestCase):
    """GET /cabinet/favorites/, POST /cabinet/favorites/, DELETE /cabinet/favorites/<id>/."""

    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        password_service = PasswordService()
        user = User.create(email=Email.create('favorites_user@example.com'))
        async_to_sync(user_repository.save)(user)
        user_repository.set_password_hash(user.id.value, password_service.hash_password('Password123!'))
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        self.user_id = user.id.value
        login_resp = self.client.post('/api/v1/auth/login/', {
            'email': 'favorites_user@example.com',
            'password': 'Password123!',
        }, format='json')
        if 'access_token' in login_resp.cookies:
            self.client.cookies = login_resp.cookies

    def test_list_favorites_empty(self):
        response = self.client.get('/api/v1/cabinet/favorites/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data'], [])

    def test_add_favorite_article(self):
        payload = {'resource_type': 'article', 'resource_id': 'test-article-slug'}
        response = self.client.post('/api/v1/cabinet/favorites/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('data', response.data)
        data = response.data['data']
        self.assertEqual(data['resource_type'], 'article')
        self.assertEqual(data['resource_id'], 'test-article-slug')
        self.assertIn('id', data)
        self.assertIn('created_at', data)

    def test_add_favorite_duplicate_idempotent(self):
        payload = {'resource_type': 'resource', 'resource_id': 'same-slug'}
        r1 = self.client.post('/api/v1/cabinet/favorites/', payload, format='json')
        self.assertEqual(r1.status_code, status.HTTP_201_CREATED)
        r2 = self.client.post('/api/v1/cabinet/favorites/', payload, format='json')
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)
        # Дубликат не создаётся — один запись в БД
        count = FavoriteModel.objects.filter(
            user_id=str(self.user_id),
            resource_type='resource',
            resource_id='same-slug',
        ).count()
        self.assertEqual(count, 1)

    def test_list_favorites_after_add(self):
        self.client.post('/api/v1/cabinet/favorites/', {'resource_type': 'article', 'resource_id': 'a1'}, format='json')
        self.client.post('/api/v1/cabinet/favorites/', {'resource_type': 'resource', 'resource_id': 'r1'}, format='json')
        response = self.client.get('/api/v1/cabinet/favorites/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 2)

    def test_remove_favorite(self):
        add_resp = self.client.post(
            '/api/v1/cabinet/favorites/',
            {'resource_type': 'article', 'resource_id': 'to-remove'},
            format='json',
        )
        fav_id = add_resp.data['data']['id']
        del_resp = self.client.delete(f'/api/v1/cabinet/favorites/{fav_id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)
        list_resp = self.client.get('/api/v1/cabinet/favorites/')
        self.assertEqual(len(list_resp.data['data']), 0)

    def test_remove_favorite_404(self):
        from uuid import uuid4
        response = self.client.delete(f'/api/v1/cabinet/favorites/{uuid4()}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
